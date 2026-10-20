import {chromium} from 'playwright';
import {rollup} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import ts from 'typescript';
import assert from 'node:assert/strict';
await mkdir('test-output',{recursive:true});
const source=ts.transpileModule(await readFile('src/mapForecastVideo.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
await writeFile('test-output/map-export-entry.mjs',source);
const bundle=await rollup({input:'test-output/map-export-entry.mjs',plugins:[resolve({browser:true})]});
await bundle.write({file:'test-output/map-export.js',format:'es'});await bundle.close();
const shadingSource=(await Promise.all(['src/precipShading.ts','src/shadingRaster.ts'].map(async path=>ts.transpileModule(await readFile(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText))).join('\n');
await writeFile('test-output/shading.js',shadingSource);
const server=createServer(async(req,res)=>{res.setHeader('Content-Type',req.url.endsWith('.js')?'text/javascript':'text/html');res.end(req.url==='/export.js'?await readFile('test-output/map-export.js'):req.url==='/shading.js'?await readFile('test-output/shading.js'):'<!doctype html><canvas></canvas>')});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
 const shading=await page.evaluate(async()=>{
  const {writePrecipitationPixel,PRECIP_TYPE_COLOURS,RASTER_SAMPLES}=await import('/shading.js');
  const canvas=document.querySelector('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  for(let ty=0;ty<2;ty++)for(let tx=0;tx<2;tx++){
   const tile=document.createElement('canvas');tile.width=tile.height=RASTER_SAMPLES;
   const tc=tile.getContext('2d'),pixels=tc.createImageData(RASTER_SAMPLES,RASTER_SAMPLES);
   for(let y=0;y<RASTER_SAMPLES;y++)for(let x=0;x<RASTER_SAMPLES;x++){
    const gx=tx*RASTER_SAMPLES+x,gy=ty*RASTER_SAMPLES+y;
    if(Math.hypot(gx-RASTER_SAMPLES*1.5,gy-RASTER_SAMPLES*1.5)<RASTER_SAMPLES*.12)continue;
    const key=Math.hypot(gx-RASTER_SAMPLES*.8,gy-RASTER_SAMPLES)<RASTER_SAMPLES*.7?'snow':'rain';
    writePrecipitationPixel(pixels.data,(y*RASTER_SAMPLES+x)*4,key);
   }
   tc.putImageData(pixels,0,0);ctx.drawImage(tile,tx*256,ty*256,256,256);
  }
  const values=ctx.getImageData(0,0,512,512).data,allowed=new Set(Object.values(PRECIP_TYPE_COLOURS).map(hex=>hex.slice(1).toLowerCase()));
  let bad=0;
  for(let i=0;i<values.length;i+=4)if(values[i+3]&&(!allowed.has([...values.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join(''))||values[i+3]!==255))bad++;
  const seam=[...ctx.getImageData(255,10,2,1).data];
  return {bad,seam,missing:ctx.getImageData(384,384,1,1).data[3]};
 });
 assert.equal(shading.bad,0);assert.equal(shading.missing,0);
 assert.deepEqual(shading.seam.slice(0,4),shading.seam.slice(4));assert.equal(shading.seam[3],255);
 await page.screenshot({path:'test-output/precipitation-shading.png'});
 console.log('Flat categorical shading passed: exact palette, contiguous tile seam and preserved missing data.');
 const result=await page.evaluate(async()=>{
  const {encodeMapForecast,canExportMapForecast,sequentialFrameReader}=await import('/export.js');
  const canvas=document.querySelector('canvas');canvas.width=320;canvas.height=240;
  if(!await canExportMapForecast(320,240))return {codec:false};
  let held=0,maxHeld=0,loads=0;
  const frames=sequentialFrameReader(async time=>{held++;loads++;maxHeld=Math.max(maxHeld,held);return {time,nominalBytes:12*1024*1024};},String,()=>held--);
  const times=Array.from({length:145},(_,i)=>i*3600000),ctx=canvas.getContext('2d');
  let blob;
  try{
   blob=await encodeMapForecast(canvas,times,async time=>{const frame=await frames.get(time);ctx.fillStyle='hsl('+(frame.time/3600000*7%360)+' 80% 50%)';ctx.fillRect(0,0,320,240);},new AbortController().signal,()=>{});
  }finally{frames.clear();}
  const bytes=new Uint8Array(await blob.arrayBuffer()),signature=new TextDecoder().decode(bytes.slice(4,8));
  const abort=new AbortController();let cancelled=false;
  try{await encodeMapForecast(canvas,times,async()=>abort.abort(),abort.signal,()=>{});}catch(e){cancelled=e.name==='AbortError';}
  return {codec:true,size:blob.size,type:blob.type,signature,loads,maxHeld,held,cancelled};
 });
 if(!result.codec)console.log('H.264 is unavailable in the runner; encoder availability fallback confirmed.');
 else {
  assert.equal(result.signature,'ftyp');assert.equal(result.type,'video/mp4');assert.ok(result.size>1000);
  assert.equal(result.loads,145);assert.equal(result.maxHeld,1);assert.equal(result.held,0);assert.equal(result.cancelled,true);
  console.log('145-frame MP4 exported with one held raster; cancellation passed:',JSON.stringify(result));
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
