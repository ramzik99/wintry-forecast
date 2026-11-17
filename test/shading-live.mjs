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
const hasRaster=()=>page.evaluate(()=>W.map.map.maplibreMap.getLayersOrder().includes('wintry-precip-shading'));
async function mount(){
 await page.evaluate(async url=>{
  const mod=await import(url),config=mod.__pluginConfig;
  const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
  W.plugins[config.name]=host;window.wintryHost=host;
  await host.open({params:{},disableOpeningAnimation:true});window.wintryTest=host.svelteApp;
 },pluginURL);
 await settled();
 assert.ok(await hasRaster(),'Plugin adds the weather cover to the native map');
 assert.ok(await page.evaluate(()=>{const order=W.map.map.maplibreMap.getLayersOrder();return order.indexOf('tileLayer')<order.indexOf('wintry-precip-shading')&&order.indexOf('wintry-precip-shading')<order.indexOf('raster-basemap')}),'Weather cover is below the native geographic raster');
 assert.equal(await page.evaluate(()=>W.store.get('overlay')),'ptype','Opening selects precipitation type automatically');
 assert.equal(await page.locator('.wintry-geographic-tile').count(),0,'No duplicate geographic map over shading');
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
 // Use fixed phase and terrain values to test dry and unknown pixels independently of the live forecast.
 await page.evaluate(async url=>{
  const {createPrecipRaster,colourTerrainTile,drawPrecipRaster}=await import(url);
  const source=document.createElement('canvas');source.width=source.height=256;
  const phaseContext=source.getContext('2d');
  phaseContext.fillStyle='#00c6ff';phaseContext.fillRect(0,0,128,256);
  const terrain=document.createElement('canvas');terrain.width=terrain.height=256;
  const tc=terrain.getContext('2d');
  tc.fillStyle='#808080';tc.fillRect(0,0,256,256);tc.fillStyle='#404040';tc.fillRect(0,0,256,64);
  const phase=colourTerrainTile(source,terrain);
  const preview=document.createElement('canvas');preview.width=384;preview.height=256;
  const ctx=preview.getContext('2d');
  drawPrecipRaster(ctx,[{nw:{lat:0,lon:0},se:{lat:256,lon:256},terrain,phase}],([x,y])=>({x,y}));
  const wet=ctx.getImageData(64,128,1,1).data,dark=ctx.getImageData(64,32,1,1).data;
  const dry=ctx.getImageData(192,128,1,1).data,missing=ctx.getImageData(300,128,1,1).data;
  if([wet,dark,dry,missing].some(p=>p[3]!==255))throw new Error('Weather cover must be opaque for wet, dry and missing pixels');
  if(Math.abs(wet[1]-99)>2||Math.abs(wet[2]-128)>2||Math.abs(dark[1]-50)>2||Math.abs(dark[2]-64)>2)throw new Error('Wet colours must retain terrain relief');
  if(dry[0]<90||dry[0]>115||missing[0]<190)throw new Error('Dry and missing pixels must show the neutral base');
  const map=W.map.map;
  window.expectedRasterColour=[...wet].slice(0,3);
  window.makeTestRaster=()=>{
   const bounds=map.getBounds();
   const raster=createPrecipRaster(map.maplibreMap,W.map.layerOrder.BASE_MAP);
   raster.setTiles([{nw:{lat:bounds.getNorth(),lon:bounds.getWest()},se:{lat:bounds.getSouth(),lon:bounds.getEast()},terrain,phase}]);
   raster.setActive(true);
   return raster;
  };
 },rasterURL);
 for(const zoom of [9,12]){
  await page.evaluate(z=>{W.store.set('overlay','temp');W.map.map.setZoom(z,{animate:false})},zoom);
  await page.waitForTimeout(2200);
  const locations=[[460,350],[540,450],[620,520],[760,380],[820,480],[900,530]];
  const samples=()=>Promise.all(locations.map(([x,y])=>colour(x,y)));
  const native=await samples();
  await page.evaluate(()=>{window.testRaster=makeTestRaster()});
  await page.waitForTimeout(400);
  const expected=await page.evaluate(()=>expectedRasterColour);
  const first=await samples();
  const close=(a,b,threshold)=>a.every((v,i)=>Math.abs(v-b[i])<threshold);
  assert.ok(first.slice(0,3).some(rgb=>close(rgb,expected,24)),JSON.stringify({zoom,expected,first}));
  assert.ok(first.slice(3).some((rgb,i)=>!close(rgb,native[i+3],24)),'Dry terrain must hide the native temperature layer');
  const assertGeography=()=>page.evaluate(()=>{
   const order=W.map.map.maplibreMap.getLayersOrder();
   return order.indexOf('tileLayer')<order.indexOf('wintry-precip-shading')&&order.indexOf('wintry-precip-shading')<order.indexOf('raster-basemap');
  });
  assert.ok(await assertGeography(),'Native basemap remains above the weather cover');
  await page.evaluate(()=>W.store.set('overlay','rain'));await page.waitForTimeout(1400);
  const second=await samples();
  assert.ok(first.every((rgb,i)=>close(rgb,second[i],12)),JSON.stringify({zoom,first,second}));
  assert.ok(await assertGeography(),'Switching weather layers keeps the geographic basemap above Wintry');
  await page.screenshot({path:'test-output/windy-raster-zoom-'+zoom+'.png'});
  await page.evaluate(()=>testRaster.setActive(false));
 }
 console.log('Opaque wet and dry rendering, relief and geographic layer order passed at zoom 9 and 12.');
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
 assert.ok(await hasRaster(),'Real wet forecast mounts the raster');
 assert.equal(await page.locator('.zoom-hint').count(),0);
 await page.screenshot({path:'test-output/windy-wintry-desktop.png'});
 await page.evaluate(()=>W.store.set('overlay','rain'));await page.waitForTimeout(1500);
 assert.equal(await page.evaluate(()=>W.store.get('overlay')),'rain');
 assert.ok(await hasRaster());
 await page.screenshot({path:'test-output/windy-wintry-rain-beneath.png'});
 await page.getByRole('checkbox',{name:'Shading',exact:true}).uncheck();
 assert.equal(await hasRaster(),false,'Turning off shading restores the Windy weather map');
 await page.getByRole('checkbox',{name:'Shading',exact:true}).check();await settled();
 assert.ok(await hasRaster());

 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).uncheck();
 assert.equal(await hasRaster(),false);
 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).check();await settled();
 await page.evaluate(t=>W.store.set('timestamp',t+3*3600000),wet.time);await settled();
 await page.evaluate(()=>W.map.map.panBy([100,40],{animate:false}));await page.waitForTimeout(800);await settled();
 assert.equal(await page.locator('.wintry-geographic-tile').count(),0);
 await page.screenshot({path:'test-output/shading-after-timeline-pan.png'});
 await page.evaluate(()=>wintryHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
 assert.equal(await hasRaster(),false);
 await page.close();
 page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'});
 await loadWindy(wet.time);await mount();
 assert.ok(await hasRaster(),'Wet forecast mounts shading on mobile');
 await page.screenshot({path:'test-output/shading-mobile.png'});
 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).uncheck();
 assert.equal(await hasRaster(),false);
 await page.getByRole('checkbox',{name:'Enable Wintry forecast'}).check();await settled();
 await page.evaluate(()=>wintryHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
 assert.equal(await hasRaster(),false);
 console.log('Visible colours, terrain relief, dry gaps, real wet forecast, layer selection, timeline, pan, mobile toggles and cleanup passed.');
}catch(error){
 await page.screenshot({path:'test-output/shading-failure.png'}).catch(()=>{});
 console.log('Shading failure panel',await page.locator('.snowline-panel').innerText().catch(()=>'(not mounted)'));throw error;
}finally{await browser.close()}
