import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
async function sourceURL(name){
 let js=ts.transpileModule(await readFile('src/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 for(const match of [...js.matchAll(/from ['"](\.\/[^'"]+)['"]/g)])js=js.replace(match[0],'from '+JSON.stringify(await sourceURL(match[1].slice(2))));
 js=js.replace(/import \{ getPointForecastData \} from ['"]@windy\/fetch['"];/,'const {getPointForecastData}=W.fetch;');
 return 'data:text/javascript;base64,'+Buffer.from(js).toString('base64');
}
const rasterURL=await sourceURL('precipRasterLayer'),precipURL=await sourceURL('precip'),timelineURL=await sourceURL('forecastTimeline'),selectedURL=await sourceURL('selectedPrecip');
const pluginURL='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let page=await browser.newPage({viewport:{width:1365,height:1000}});
async function loadWindy(time){
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(t=>{W.store.set('particlesAnim','off');W.store.set('overlay','temp');W.map.map.setView([46.5,10],9,{animate:false});if(t)W.store.set('timestamp',t);},time);
 await page.waitForFunction(()=>W.map.map.getZoom()===9);await page.waitForTimeout(3000);
}
async function settled(){
 await page.waitForFunction(()=>document.querySelector('.snowline-panel')&&!document.querySelector('.status-pill')&&!document.querySelector('.refresh-error'),null,{timeout:180000});
}
async function mount(){
 await page.evaluate(async url=>{
  const mod=await import(url),config=mod.__pluginConfig;
  const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
  W.plugins[config.name]=host;window.wintryHost=host;
  await host.open({params:{},disableOpeningAnimation:true});window.wintryTest=host.svelteApp;
 },pluginURL);
 await settled();
 assert.equal(await page.locator('.wintry-terrain-tile').count(),0,'Plugin must not cover Windy with an extra base map');
 assert.equal(await page.evaluate(()=>W.store.get('overlay')),'ptype','Opening must select Windy precipitation type');
}
async function colour(x,y){
 const png=await page.screenshot({clip:{x,y,width:12,height:12}});
 return page.evaluate(async data=>{
  const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
  const c=document.createElement('canvas');c.width=c.height=12;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
  const rgba=ctx.getImageData(0,0,12,12).data,sum=[0,0,0];
  for(let i=0;i<rgba.length;i+=4)for(let j=0;j<3;j++)sum[j]+=rgba[i+j]/144;
  return sum;
 },png.toString('base64'));
}
try{
 await loadWindy();await page.screenshot({path:'test-output/windy-background.png'});
 // Verify actual visible colours, including at close zoom; layer existence cannot catch black textures.
 await page.evaluate(async url=>{
  const {precipRasterLayer,colourTerrainTile}=await import(url),m=W.map.map,b=m.getBounds(),c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');ctx.fillStyle='#00c6ff';ctx.fillRect(0,0,128,256);
  m.createPane('wintry-test-shading').style.zIndex='390';
  const terrain=document.createElement('canvas');terrain.width=terrain.height=256;const tc=terrain.getContext('2d');
  tc.fillStyle='#808080';tc.fillRect(0,0,256,256);tc.fillStyle='#404040';tc.fillRect(0,0,256,64);
  const coloured=colourTerrainTile(c,terrain),cc=coloured.getContext('2d'),light=cc.getImageData(64,128,1,1).data,dark=cc.getImageData(64,32,1,1).data,clear=cc.getImageData(192,128,1,1).data;
  const lum=p=>p[0]*.3+p[1]*.59+p[2]*.11;
  if(light[3]!==255||dark[3]!==255||clear[3]!==0||Math.abs(lum(light)-128)>2||Math.abs(lum(dark)-64)>2)throw new Error('Opaque terrain composition must preserve luminance and dry gaps');
  window.expectedRasterColour=[...light].slice(0,3);
  window.testRaster=precipRasterLayer(L,coloured.toDataURL(),{lat:b.getNorth(),lon:b.getWest()},{lat:b.getSouth(),lon:b.getEast()},'wintry-test-shading');
  await testRaster.ready;
 },rasterURL);
 for(const zoom of [9,12]){
  await page.evaluate(z=>W.map.map.setZoom(z,{animate:false}),zoom);await page.waitForTimeout(3000);
  await page.evaluate(()=>testRaster.addTo(W.map.map));await page.waitForTimeout(100);
  const expected=await page.evaluate(()=>expectedRasterColour);
  assert.equal(await page.evaluate(()=>testRaster.options.opacity),1);
  // Native place labels sit above this overlay. Sample several areas so a label cannot masquerade as alpha blending.
  let matching=0;const samples=[];
  for(const x of [440,500,560,620])for(const y of [300,400,500,600]){
    const actual=await colour(x,y);samples.push({x,y,actual});
    if(actual.every((v,i)=>Math.abs(v-expected[i])<12))matching++;
  }
  assert.ok(matching>=4,JSON.stringify({zoom,matching,expected,samples}));
  await page.screenshot({path:'test-output/windy-raster-zoom-'+zoom+'.png'});
  await page.evaluate(()=>W.map.map.removeLayer(testRaster));
 }
 console.log('Full-opacity terrain-textured shading and dry-gap preservation passed at zoom 9 and 12.');
 await page.evaluate(()=>W.map.map.setView([46.5,10],9,{animate:false}));await page.waitForTimeout(1000);
 const wet=await page.evaluate(async({precipURL,timelineURL,selectedURL})=>{
  const {precipMmAt}=await import(precipURL),{buildForecastTimes}=await import(timelineURL),{loadSelectedPrecipFields,alignSelectedPrecipFields}=await import(selectedURL);
  const r=await W.fetch.getMeteogramForecastData('ecmwf',{lat:46.5,lon:10,step:1});
  const forecast=r.data.data,ref=new Date(r.data.header.refTime).getTime(),times=buildForecastTimes(forecast,ref);
  if(!times.some((_,i)=>precipMmAt(forecast,i)>0))Object.assign(forecast,alignSelectedPrecipFields(await loadSelectedPrecipFields(46.5,10),times,ref));
  let index=-1,best=0;times.forEach((t,i)=>{const v=precipMmAt(forecast,i);if(t>=Date.now()&&v>best){best=v;index=i;}});
  if(index<0)throw new Error('Live Alps fixture has no wet forecast period; select another test location.');
  W.store.set('timestamp',times[index]);return{time:times[index],amount:best};
 },{precipURL,timelineURL,selectedURL});
 console.log('Live wet ECMWF forecast',wet);
 await mount();
 assert.ok(await page.locator('.wintry-raster-tile').count()>0,'Wet live forecast must draw precipitation');
 assert.equal(await page.locator('.zoom-hint').count(),0);
 const edgePixels=await page.evaluate(()=>{
  let count=0;
  for(const image of document.querySelectorAll('.wintry-raster-tile')){
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,256,256).data;
   for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0&&pixels[i]<255)count++;
  }
  return count;
 });assert.ok(edgePixels>0,'The real wet/dry boundary must contain partial coverage pixels');
 console.log('Live smooth wet/dry edge pixels',edgePixels);
 await page.screenshot({path:'test-output/windy-wintry-desktop.png'});
 await page.evaluate(()=>W.store.set('overlay','rain'));await page.waitForTimeout(1500);
 assert.equal(await page.evaluate(()=>W.store.get('overlay')),'rain');
 assert.ok(await page.locator('.wintry-raster-tile').count()>0);
 assert.equal(await page.locator('.wintry-terrain-tile').count(),0);
 await page.screenshot({path:'test-output/windy-wintry-rain-beneath.png'});
 console.log('Windy precipitation type selected on desktop/mobile; another layer can still be chosen beneath shading.');
 await page.getByRole('button',{name:'Open Wintry settings'}).click();
 await page.getByRole('dialog',{name:'Wintry settings'}).waitFor();
 await page.getByRole('button',{name:'Close settings'}).click();
 await page.getByRole('button',{name:'Hide Wintry forecast panel'}).click();
 await page.getByRole('button',{name:'Show Wintry forecast panel'}).click();
 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).uncheck();
 await page.evaluate(()=>W.store.set('overlay','temp'));
 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).check();await settled();
 assert.equal(await page.evaluate(()=>W.store.get('overlay')),'ptype','Enabling must select precipitation type');
 await page.evaluate(()=>wintryTest.onopen({lat:46.5,lon:10}));
 await page.waitForFunction(()=>!!document.querySelector('.point-tools'),null,{timeout:45000});
 await page.locator('.point-tools button').filter({hasText:'Forecast'}).click();
 await page.getByRole('img',{name:'Terrain-aware wintry forecast through 144 hours'}).waitFor();
 await page.screenshot({path:'test-output/windy-wintry-graph.png'});
 await page.getByRole('tab',{name:'Sounding',exact:true}).click();
 await page.screenshot({path:'test-output/windy-wintry-sounding.png'});
 await page.getByRole('button',{name:'Close graph'}).click();
 await page.getByRole('button',{name:'How it works',exact:true}).click();
 await page.getByRole('button',{name:'Close information'}).click();
 await page.locator('.layer-controls input').nth(1).uncheck();await page.waitForTimeout(200);
 assert.equal(await page.locator('.wintry-raster-tile,.wintry-terrain-tile').count(),0);
 await page.locator('.layer-controls input').nth(1).check();await settled();
 await page.evaluate(t=>W.store.set('timestamp',t+3*3600000),wet.time);await settled();
 await page.evaluate(()=>W.map.map.panBy([100,40],{animate:false}));await page.waitForTimeout(800);await settled();
 await page.evaluate(()=>wintryHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
 assert.equal(await page.locator('.wintry-raster-tile,.wintry-terrain-tile').count(),0);
 console.log('Desktop controls, graph, sounding, timeline, pan and cleanup passed.');
 await page.close();
 page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'});
 await loadWindy(wet.time);await mount();
 await page.getByRole('button',{name:'Open Wintry settings'}).tap();
 await page.getByRole('button',{name:'Close settings'}).tap();
 await page.screenshot({path:'test-output/windy-wintry-mobile.png'});
 const downloadButton=page.getByRole('button',{name:'Download MP4',exact:true});
 await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Download MP4');return b&&!b.disabled;},null,{timeout:120000});
 const downloaded=page.waitForEvent('download',{timeout:600000});
 console.log('Starting actual six-day mobile MP4 export');
 await downloadButton.tap();
 const reporter=setInterval(()=>page.locator('.prepare-map-controls small').innerText().then(t=>console.log('Export progress:',t)).catch(()=>{}),30000);
 let file;
 try{
  file=await Promise.race([downloaded,(async()=>{
   await page.waitForFunction(()=>/could not finish|cancelled|stopped|MP4 unavailable/i.test(document.querySelector('.prepare-map-controls small')?.textContent??''),null,{timeout:600000});
   throw new Error('Live download stopped: '+await page.locator('.prepare-map-controls small').innerText());
  })()]);
 }finally{clearInterval(reporter)}
 assert.equal(await file.failure(),null);await file.saveAs('test-output/wintry-live.mp4');
 const videoBytes=await readFile('test-output/wintry-live.mp4');assert.ok(videoBytes.length>10000);
 console.log('Actual plugin MP4 downloaded',videoBytes.length,'bytes');
 const decoded=await page.evaluate(async data=>{
  const v=document.createElement('video');v.muted=true;v.src='data:video/mp4;base64,'+data;
  await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=()=>reject(new Error('Downloaded MP4 cannot decode'))});
  return{width:v.videoWidth,height:v.videoHeight,duration:v.duration};
 },videoBytes.toString('base64'));
 assert.ok(decoded.duration>28&&decoded.duration<30);assert.ok(decoded.width>0&&decoded.height>0&&Math.max(decoded.width,decoded.height)<=1280);
 console.log('Decoded real MP4 metadata',decoded.width,decoded.height,decoded.duration);
 await page.evaluate(()=>wintryHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
 assert.equal(await page.locator('.wintry-raster-tile,.wintry-terrain-tile').count(),0);
 console.log('Actual mobile touch controls, complete MP4 download and cleanup passed.');
}catch(error){
 await page.screenshot({path:'test-output/windy-live-failure.png'}).catch(()=>{});
 console.log('Wintry failure panel',await page.locator('.snowline-panel').innerText().catch(()=>'(not mounted)'));throw error;
}finally{await browser.close()}
