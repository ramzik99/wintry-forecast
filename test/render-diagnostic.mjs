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
 await page.evaluate(t=>{W.store.set('particlesAnim','off');W.map.map.setView([46.5,10],9,{animate:false});if(t)W.store.set('timestamp',t);},time);
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
 await page.waitForFunction(()=>document.querySelectorAll('.wintry-terrain-tile').length>0);
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
  const {precipRasterLayer}=await import(url),m=W.map.map,b=m.getBounds(),c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');ctx.fillStyle='#00c6ff';ctx.fillRect(0,0,128,256);
  m.createPane('wintry-test-shading').style.zIndex='390';
  window.testRaster=precipRasterLayer(L,c.toDataURL(),{lat:b.getNorth(),lon:b.getWest()},{lat:b.getSouth(),lon:b.getEast()},'wintry-test-shading');
  await testRaster.ready;
 },rasterURL);
 for(const zoom of [9,12]){
  await page.evaluate(z=>W.map.map.setZoom(z,{animate:false}),zoom);await page.waitForTimeout(3000);
  const before=await colour(600,500);
  await page.evaluate(()=>testRaster.addTo(W.map.map));await page.waitForTimeout(100);
  const after=await colour(600,500),expected=before.map((v,i)=>v*.32+[0,198,255][i]*.68);
  assert.ok(after.every((v,i)=>Math.abs(v-expected[i])<32),JSON.stringify({zoom,before,after,expected}));
  await page.screenshot({path:'test-output/windy-raster-zoom-'+zoom+'.png'});
  await page.evaluate(()=>W.map.map.removeLayer(testRaster));
 }
 console.log('Visible shading colour and terrain blending passed at zoom 9 and 12.');
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
 await page.screenshot({path:'test-output/windy-wintry-desktop.png'});

 const urls={};
 for(const name of ['shadingGrid','shadingRaster','snowLevel','precipType','terrainTiles','forecastTime'])urls[name]=await sourceURL(name);
 const debug=await page.evaluate(async({urls,precipURL,timelineURL,selectedURL})=>{
  const gridmod=await import(urls.shadingGrid),raster=await import(urls.shadingRaster),snow=await import(urls.snowLevel),type=await import(urls.precipType),dem=await import(urls.terrainTiles),timing=await import(urls.forecastTime);
  const {precipMmAt}=await import(precipURL),{buildForecastTimes}=await import(timelineURL),{loadSelectedPrecipFields,alignSelectedPrecipFields}=await import(selectedURL);
  const m=W.map.map,mb=m.getBounds(),bounds={south:mb.getSouth(),north:mb.getNorth(),west:mb.getWest(),east:mb.getEast()},lattice=gridmod.viewportWeatherGrid(bounds,m.getZoom());
  const grid=Array.from({length:lattice.rows},()=>Array(lattice.cols).fill(null));
  for(const p of lattice.points)grid[p.r][p.c]=p;
  const stencil=raster.weatherInterpolator(grid),results=[];
  for(const screen of [{x:1120,y:150},{x:1120,y:370},{x:700,y:500}]){
   const ll=m.containerPointToLatLng([screen.x,screen.y]);
   const image=[...document.querySelectorAll('.wintry-raster-tile')].find(img=>{const r=img.getBoundingClientRect();return screen.x>=r.left&&screen.x<r.right&&screen.y>=r.top&&screen.y<r.bottom});
   let pixel=null,rect=null;
   if(image){const r=image.getBoundingClientRect(),c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);pixel=[...ctx.getImageData(Math.floor((screen.x-r.left)/r.width*256),Math.floor((screen.y-r.top)/r.height*256),1,1).data];rect={left:r.left,top:r.top,width:r.width,height:r.height};}
   const neighbours=stencil(ll.lat,ll.lng),profiles=await Promise.all(neighbours.map(async v=>{
    const r=await W.fetch.getMeteogramForecastData('ecmwf',{lat:v.value.lat,lon:v.value.lon,step:1}),raw=r.data.data,header=r.data.header,ref=new Date(header.refTime).getTime(),times=buildForecastTimes(raw,ref),index=timing.forecastIntervalIndex(times,W.store.get('timestamp'));
    const f={...raw,__modelTerrainM:header.modelElevation};
    if(!times.some((_,i)=>precipMmAt(f,i)!==null))Object.assign(f,alignSelectedPrecipFields(await loadSelectedPrecipFields(v.value.lat,v.value.lon),times,ref));
    const profile=snow.buildProfile(f,index);return{lat:v.value.lat,lon:v.value.lon,weight:v.weight,index,amount:precipMmAt(f,index),profile,modelTerrain:header.modelElevation};
   }));
   const blended=raster.blendedProfile(profiles.map(p=>({value:p.profile,weight:p.weight})),snow.wetBulbFromDewpoint);
   const terrain=new dem.TerrainTiles(),z=raster.viewportRasterZoom(m.getSize().x,bounds.west,bounds.east,m.getZoom());
   const ready=await terrain.ensure({south:ll.lat-.001,north:ll.lat+.001,west:ll.lng-.001,east:ll.lng+.001},z,()=>true,()=>{});
   const height=terrain.sample(ll.lat,ll.lng,z);terrain.destroy();
   const phase=height===null?null:type.supportedPrecipitationType(blended,height);
   results.push({screen,lat:ll.lat,lon:ll.lng,pixel,rect,ready,height,phase,corners:profiles.map(p=>({...p,profile:p.profile.map(v=>({level:v.level,height:v.heightM,tw:v.wetBulbC}))}))});
  }
  return{bounds,target:W.store.get('timestamp'),results};
 },{urls,precipURL,timelineURL,selectedURL});
 console.log('GAP DIAGNOSIS',JSON.stringify(debug,null,2));
 await writeFile('test-output/shading-gap-diagnosis.json',JSON.stringify(debug,null,2));
 await page.evaluate(()=>wintryHost.close());
}finally{await browser.close()}
