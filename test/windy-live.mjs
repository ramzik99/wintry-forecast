import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import assert from 'node:assert/strict';
const rasterURL='data:text/javascript;base64,'+Buffer.from(ts.transpileModule(await readFile('src/precipRasterLayer.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
async function sourceURL(name){
 const js=ts.transpileModule(await readFile('src/'+name+'.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 let result=js;
 for(const match of js.matchAll(/from ['"](\.\/[^'"]+)['"]/g))result=result.replace(match[0],'from '+JSON.stringify(await sourceURL(match[1].slice(2))));
 result=result.replace(/import \{ getPointForecastData \} from ['"]@windy\/fetch['"];/,'const {getPointForecastData}=W.fetch;');
 return 'data:text/javascript;base64,'+Buffer.from(result).toString('base64');
}
const precipURL=await sourceURL('precip'),timelineURL=await sourceURL('forecastTimeline'),selectedURL=await sourceURL('selectedPrecip');
const pluginURL='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let page=await browser.newPage({viewport:{width:1365,height:1000}});
page.on('pageerror',e=>console.log('PAGE ERROR',String(e)));
try{
 await page.goto('https://www.windy.com/?46.5,10,8',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(()=>W.map.map.setView([46.5,10],9,{animate:false}));
 await page.waitForFunction(()=>W.map.map.getZoom()===9);await page.waitForTimeout(5000);
 console.log('INITIAL MAP',await page.evaluate(()=>({zoom:W.map.map.getZoom(),bounds:W.map.map.getBounds(),map:W.store.get('map'),overlay:W.store.get('overlay'),order:W.map.layerOrder,layers:W.map.map.maplibreMap.getStyle().layers.map(l=>({id:l.id,type:l.type,paint:l.paint}))})));
 await page.screenshot({path:'test-output/windy-background.png'});
 console.log('RASTER',await page.evaluate(async rasterURL=>{
  const {precipRasterLayer,terrainBackgroundLayer,terrainMapTemplate}=await import(rasterURL),m=W.map.map,b=m.getBounds(),canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');c.fillStyle='#00c6ff';c.fillRect(0,0,128,256);
  m.createPane('wintry-precip-shading').style.zIndex='390';
  window.testBackground=terrainBackgroundLayer(L,terrainMapTemplate(W.map.getMapTiles(),W.store.get('map')),W.map.layerOrder.BASE_MAP,'wintry-precip-shading').addTo(m);
  window.testRaster=precipRasterLayer(L,canvas.toDataURL(),{lat:b.getNorth(),lon:b.getWest()},{lat:b.getSouth(),lon:b.getEast()},W.map.layerOrder.BASE_MAP,'wintry-precip-shading').addTo(m);
  const layers=m.maplibreMap.getStyle().layers;
  if(!layers.some(l=>l.id.startsWith('wintry-precip-')))throw new Error('Native precipitation layer was not installed');
  if(!layers.some(l=>l.id.startsWith('wintry-background-')))throw new Error('Native terrain background was not installed');
  return layers.map(l=>({id:l.id,type:l.type,paint:l.paint}));
 },rasterURL));
 await page.waitForTimeout(3000);await page.screenshot({path:'test-output/windy-raster-background.png'});
 await page.evaluate(()=>W.map.map.setZoom(12,{animate:false}));await page.waitForTimeout(5000);
 await page.screenshot({path:'test-output/windy-raster-close-zoom.png'});
 await page.evaluate(()=>{W.map.map.removeLayer(testRaster);W.map.map.removeLayer(testBackground);W.map.map.setView([46.5,10],9,{animate:false});});
 await page.waitForTimeout(3000);
 const wetTime=await page.evaluate(async({precipURL,timelineURL,selectedURL})=>{
  const {precipMmAt}=await import(precipURL),{buildForecastTimes}=await import(timelineURL),{loadSelectedPrecipFields,alignSelectedPrecipFields}=await import(selectedURL);
  const response=await W.fetch.getMeteogramForecastData('ecmwf',{lat:46.5,lon:10,step:1});
  const forecast=response.data.data,ref=new Date(response.data.header.refTime).getTime(),times=buildForecastTimes(forecast,ref);
  if(!times.some((_,i)=>precipMmAt(forecast,i)>0)){
   const fields=await loadSelectedPrecipFields(46.5,10);Object.assign(forecast,alignSelectedPrecipFields(fields,times,ref));
  }
  let i=-1,best=0;
  times.forEach((t,k)=>{const v=precipMmAt(forecast,k);if(t>=Date.now()&&v>best){best=v;i=k;}});
  if(i<0)throw new Error('Live Alps fixture has no wet forecast period; choose another location.');
  W.store.set('timestamp',times[i]);return{time:times[i],amount:best};
 },{precipURL,timelineURL,selectedURL});
 console.log('LIVE ECMWF WET PERIOD',wetTime);
 await page.evaluate(async pluginURL=>{
  const host=document.createElement('div');host.id='windy-plugin-snowline-map-100m';document.body.append(host);
  const mod=await import(pluginURL);window.wintryTest=new mod.default({target:host});
 },pluginURL);
 await page.waitForFunction(()=>{
  const p=document.querySelector('.snowline-panel');
  return p&&!p.querySelector('.status-pill')&&!p.querySelector('.refresh-error')&&W.map.map.maplibreMap.getStyle().layers.some(l=>l.id.startsWith('wintry-background-'));
 },null,{timeout:180000});
 console.log('PLUGIN PANEL',await page.locator('.snowline-panel').innerText());
 assert.equal(await page.locator('.zoom-hint').count(),0);
 assert.ok(await page.evaluate(()=>W.map.map.maplibreMap.getStyle().layers.some(l=>l.id.startsWith('wintry-precip-'))),'Live wet forecast must generate native precipitation tiles');
 console.log('PLUGIN NATIVE LAYERS',await page.evaluate(()=>W.map.map.maplibreMap.getStyle().layers.map(l=>({id:l.id,type:l.type}))));
 await page.screenshot({path:'test-output/windy-wintry-desktop.png'});
 await page.getByRole('button',{name:'Open Wintry settings'}).click({force:true});assert.equal(await page.getByRole('dialog',{name:'Wintry settings'}).count(),1);
 await page.getByRole('button',{name:'Close settings'}).click({force:true});
 await page.getByRole('button',{name:'Hide Wintry forecast panel'}).click({force:true});await page.getByRole('button',{name:'Show Wintry forecast panel'}).click({force:true});
 await page.evaluate(()=>wintryTest.selectMapPoint(46.5,10));
 await page.waitForFunction(()=>!!document.querySelector('.point-tools'),null,{timeout:45000});
 await page.locator('.point-tools button').filter({hasText:'Forecast'}).click({force:true});
 await page.getByRole('img',{name:'Terrain-aware wintry forecast through 144 hours'}).waitFor();
 await page.getByRole('tab',{name:'Sounding',exact:true}).click({force:true});
 await page.screenshot({path:'test-output/windy-wintry-sounding.png'});
 await page.getByRole('button',{name:'Close graph'}).click({force:true});
 await page.getByRole('button',{name:'How it works',exact:true}).click({force:true});
 await page.getByRole('dialog',{name:'How Wintry forecast works'}).waitFor();
 await page.getByRole('button',{name:'Close information'}).click({force:true});
 await page.locator('.layer-controls input').nth(1).uncheck({force:true});await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>!W.map.map.maplibreMap.getStyle().layers.some(l=>l.id.startsWith('wintry-precip-')||l.id.startsWith('wintry-background-'))));
 await page.locator('.layer-controls input').nth(1).check({force:true});
 await page.waitForFunction(()=>!document.querySelector('.status-pill'),null,{timeout:120000});
 const originalTime=await page.evaluate(()=>W.store.get('timestamp'));
 await page.evaluate(t=>W.store.set('timestamp',t+3*3600000),originalTime);
 await page.waitForFunction(()=>!document.querySelector('.status-pill'),null,{timeout:120000});
 await page.evaluate(()=>W.map.map.panBy([100,40],{animate:false}));
 await page.waitForTimeout(800);
 await page.waitForFunction(()=>!document.querySelector('.status-pill'),null,{timeout:120000});
 await page.evaluate(()=>wintryTest.$destroy());
 page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'});
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(t=>{W.map.map.setView([46.5,10],9,{animate:false});W.store.set('timestamp',t);},wetTime.time);
 await page.waitForFunction(()=>W.map.map.getZoom()===9);
 await page.evaluate(async pluginURL=>{
  const host=document.createElement('div');host.id='windy-plugin-snowline-map-100m';document.body.append(host);
  const mod=await import(pluginURL);window.wintryTest=new mod.default({target:host});
 },pluginURL);
 await page.waitForFunction(()=>document.querySelector('.snowline-panel')&&!document.querySelector('.status-pill')&&!document.querySelector('.refresh-error'),null,{timeout:180000});
 await page.screenshot({path:'test-output/windy-wintry-mobile.png'});
 await page.getByRole('button',{name:'Open Wintry settings'}).tap({force:true});
 await page.getByRole('button',{name:'Close settings'}).tap({force:true});
 const downloadButton=page.getByRole('button',{name:'Download MP4',exact:true});await downloadButton.waitFor();
 console.log('Starting real six-day plugin MP4 export on mobile viewport');
 const downloadPromise=page.waitForEvent('download',{timeout:600000});
 await downloadButton.tap({force:true});
 const download=await downloadPromise;
 assert.equal(await download.failure(),null);await download.saveAs('test-output/wintry-live.mp4');
 const videoBytes=await readFile('test-output/wintry-live.mp4');assert.ok(videoBytes.length>10000);
 console.log('Real plugin MP4 download completed',videoBytes.length,'bytes');
 await page.evaluate(async data=>{
  const video=document.createElement('video');video.muted=true;video.src='data:video/mp4;base64,'+data;
  await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(new Error('Downloaded MP4 cannot be decoded'))});
  const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);
  canvas.id='download-preview';Object.assign(canvas.style,{position:'fixed',inset:'0',zIndex:999999,width:'100%',height:'auto'});document.body.append(canvas);
 },videoBytes.toString('base64'));
 await page.screenshot({path:'test-output/windy-mp4-first-frame.png'});
 await page.evaluate(()=>{document.querySelector('#download-preview').remove();wintryTest.$destroy()});
 assert.ok(await page.evaluate(()=>!W.map.map.maplibreMap.getStyle().layers.some(l=>l.id.startsWith('wintry-'))));
 console.log('Live Windy desktop/mobile controls, timeline, pan and native resource cleanup passed.');
}catch(error){
 await page.screenshot({path:'test-output/windy-live-failure.png'}).catch(()=>{});
 console.log('Wintry failure panel',await page.locator('.snowline-panel').innerText().catch(()=>'(not mounted)'));
 throw error;
}finally{await browser.close()}
