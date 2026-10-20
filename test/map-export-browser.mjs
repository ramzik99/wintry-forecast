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
const server=createServer(async(req,res)=>{res.setHeader('Content-Type',req.url==='/export.js'?'text/javascript':'text/html');res.end(req.url==='/export.js'?await readFile('test-output/map-export.js'):'<!doctype html><canvas></canvas>')});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
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
