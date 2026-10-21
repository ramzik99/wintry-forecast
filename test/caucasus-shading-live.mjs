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

const rasterURL=await sourceURL('shadingRaster'),snowURL=await sourceURL('snowLevel'),phaseURL=await sourceURL('precipType');
const timelineURL=await sourceURL('forecastTimeline'),precipURL=await sourceURL('precip'),selectedURL=await sourceURL('selectedPrecip');
const pluginURL='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let page;
const results={};
async function settled(){
 await page.waitForFunction(()=>document.querySelector('.snowline-panel')&&!document.querySelector('.status-pill')&&!document.querySelector('.refresh-error'),null,{timeout:180000});
}
async function run(name,url,location=[43.05,44.0],zoom=8){
 page=await browser.newPage({viewport:{width:1910,height:870}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.text().startsWith('Live profile source'))console.log(m.text());});
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(({location,zoom,name})=>{
  localStorage.setItem('wintry:prefs:v1',JSON.stringify({enabled:true,showShading:true,showContours:false,showIcons:false}));
  W.store.set('particlesAnim','off');W.store.set('overlay',name==='fixed'?'temp':'ptype');W.map.map.setView(location,zoom,{animate:false});
 },{location,zoom,name});
 await page.waitForTimeout(1500);
 const valid=await page.evaluate(async({timelineURL,precipURL,selectedURL,location})=>{
  const {buildForecastTimes}=await import(timelineURL),{precipMmAt}=await import(precipURL),{loadSelectedPrecipFields,alignSelectedPrecipFields}=await import(selectedURL);
  const r=await W.fetch.getMeteogramForecastData('ecmwf',{lat:location[0],lon:location[1],step:1});
  console.log('Live profile source',JSON.stringify({header:r.data.header,keys:Object.keys(r.data.data),
    levels:Object.keys(r.data.data).filter(k=>/^temp-/.test(k)),surfaceTemperature:r.data.data['temp-surface']?.[0],surfaceDewpoint:r.data.data['dewpoint-surface']?.[0],surfaceHeight:r.data.data['gh-surface']?.[0]}));
  const f=r.data.data,ref=Date.parse(r.data.header.refTime),times=buildForecastTimes(f,ref);
  if(!times.some((_,i)=>precipMmAt(f,i)>0))Object.assign(f,alignSelectedPrecipFields(await loadSelectedPrecipFields(...location),times,ref));
  const requested=Date.parse('2026-10-21T09:00:00Z');
  let time=times.find(t=>t>=requested&&t>=Date.now()-3*3600000);
  if(!time)time=times.find(t=>t>=Date.now())??times[0];
  W.store.set('timestamp',time);return time;
 },{timelineURL,precipURL,selectedURL,location});
 let requests=0,elevations=0;
 page.on('request',r=>{if(/meteogram|forecast|detail|elevation/.test(r.url()))requests++;if(/elevation/.test(r.url())&&!/elevation-tiles/.test(r.url()))elevations++;});
 const start=Date.now();
 await page.evaluate(async url=>{
  const m=await import(url),config=m.__pluginConfig;
  const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
  W.plugins[config.name]=host;window.shadingHost=host;
  await host.open({params:{},disableOpeningAnimation:true});
 },url);
 await settled();
 if(name==='fixed')assert.equal(await page.evaluate(()=>W.store.get('overlay')),'ptype');
 results[name]={loadMs:Date.now()-start,requests,elevations,valid,tiles:await page.locator('.wintry-raster-tile').count()};
 assert.ok(results[name].tiles>0,'Wet Caucasus forecast must draw shading');
 await page.screenshot({path:'test-output/caucasus-'+name+'.png'});
 // Measure the complete point forecast, including the graph, then an identical repeat.
 for(const warm of [false,true]){
  const started=Date.now();
  await page.evaluate(location=>shadingHost.svelteApp.onopen({lat:location[0],lon:location[1]}),location);
  await page.locator('.point-tools').waitFor({timeout:45000});
  await page.locator('.point-tools button').filter({hasText:'Forecast'}).click();
  const chart=page.getByRole('dialog',{name:'Wintry forecast graph'});
  await chart.getByRole('img',{name:'Terrain-aware wintry forecast through 144 hours'}).waitFor();
  results[name][warm?'repeatForecastMs':'pointForecastMs']=Date.now()-started;
  await chart.getByRole('button',{name:'Close graph',exact:true}).click();
  await chart.waitFor({state:'detached'});
 }
 if(name==='fixed'){
  assert.equal(results[name].elevations,0,'Viewport shading must not request individual point elevations');
  assert.equal(await page.locator('.wintry-geographic-tile').count(),0);
  // Real atmospheric columns: check jumps on either side of weather-cell boundaries.
  const diagnostics=await page.evaluate(async({rasterURL,snowURL,phaseURL})=>{
   const {weatherInterpolator,blendedProfile,continuousProfileBlender}=await import(rasterURL);
   const {buildProfile,wetBulbFromDewpoint}=await import(snowURL),{terrainPrecipitationType}=await import(phaseURL);
   const latitudes=[42.6,43.0,43.4],longitudes=[42.6,43.1,43.6,44.1,44.6];
   const grid=await Promise.all(latitudes.map(lat=>Promise.all(longitudes.map(async lon=>{
    const r=await W.fetch.getMeteogramForecastData('ecmwf',{lat,lon,step:1});
    const f={...r.data.data,__modelTerrainM:r.data.header.modelElevation};
    return{lat,lon,profile:buildProfile(f,0)};
   }))));
   const locate=weatherInterpolator(grid),blend=continuousProfileBlender({reuseResult:true});let oldJumps=0,newJumps=0,maxOld=0,maxNew=0;
   for(const lon of longitudes.slice(1,-1))for(let lat=42.65;lat<43.4;lat+=.05){
    const values=x=>locate(lat,x)?.map(v=>({value:v.value.profile,weight:v.weight}));
    const left=values(lon-1e-7),right=values(lon+1e-7);if(!left||!right)continue;
    const evaluate=(vals,old)=>terrainPrecipitationType(old?blendedProfile(vals,wetBulbFromDewpoint):blend(vals),800);
    const oldA=evaluate(left,true),oldB=evaluate(right,true),a=evaluate(left,false),b=evaluate(right,false);
    if(oldA&&oldB){const d=Math.abs(oldA.surfaceWetBulbC-oldB.surfaceWetBulbC);maxOld=Math.max(maxOld,d);if(d>.05)oldJumps++;}
    if(a&&b){const d=Math.abs(a.surfaceWetBulbC-b.surfaceWetBulbC);maxNew=Math.max(maxNew,d);if(d>.05)newJumps++;}
   }
   const values=locate(42.8,43.3).map(v=>({value:v.value.profile,weight:v.weight}));
   let start=performance.now();for(let i=0;i<3000;i++)blendedProfile(values,wetBulbFromDewpoint);const oldMs=performance.now()-start;
   start=performance.now();for(let i=0;i<3000;i++)blend(values);const newMs=performance.now()-start;
   return{oldJumps,newJumps,maxOld,maxNew,oldMs,newMs};
  },{rasterURL,snowURL,phaseURL});
  results.diagnostics=diagnostics;
  assert.equal(diagnostics.newJumps,0,'No cell-boundary jumps in real Caucasus columns');
  assert.ok(diagnostics.newMs<diagnostics.oldMs,'Atmospheric interpolation must be faster than the released per-pixel solver');
  const t=Date.now();await page.evaluate(t=>W.store.set('timestamp',t+3*3600000),valid);await settled();results.timelineMs=Date.now()-t;
  await page.screenshot({path:'test-output/caucasus-fixed-timeline.png'});
  await page.evaluate(()=>W.map.map.panBy([120,50],{animate:false}));await page.waitForTimeout(800);await settled();
  await page.screenshot({path:'test-output/caucasus-fixed-pan.png'});
  await page.evaluate(()=>W.map.map.setZoom(9,{animate:false}));await page.waitForTimeout(800);await settled();
  await page.screenshot({path:'test-output/caucasus-fixed-zoom.png'});
 }
 await page.evaluate(()=>shadingHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
 assert.equal(await page.locator('.wintry-raster-tile').count(),0);
 await page.close();
}
try{
 await run('released','https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.1.17/plugin.min.js');
 await run('fixed',pluginURL);
 console.log('Caucasus shading measurements',JSON.stringify(results));
 await writeFile('test-output/caucasus-measurements.json',JSON.stringify(results,null,2));
}catch(e){if(page)await page.screenshot({path:'test-output/caucasus-failure.png'}).catch(()=>{});console.log('Partial measurements',JSON.stringify(results));throw e;}
finally{await browser.close();}
