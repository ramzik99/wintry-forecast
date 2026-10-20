
import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const code=await readFile('dist/released.js','utf8'),pluginURL='data:text/javascript;base64,'+Buffer.from(code).toString('base64');
assert.ok(code.includes('1000.1.9'));
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const results=[],errors=[],closeLatencies=[];let phase='startup',blockDem=false,blockForecast=false,demBlocked=0,forecastBlocked=0;
page.on('pageerror',e=>errors.push({phase,message:e.message,plugin:/data:text\/javascript/.test(e.stack??'')}));
await page.route('**/*',route=>{
 const url=route.request().url();
 if(blockDem&&url.includes('elevation-tiles-prod/terrarium')){demBlocked++;return route.abort('failed')}
 if(blockForecast&&(/\/forecast\//.test(url)||/meteogram/.test(url))){forecastBlocked++;return route.abort('failed')}
 return route.continue();
});
async function idle(){
 await page.waitForTimeout(400);
 await page.waitForFunction(()=>!!document.querySelector('.snowline-panel')&&!document.querySelector('.status-pill'),null,{timeout:180000});
 await page.waitForTimeout(400);
}
async function close(){
 const started=Date.now();await page.evaluate(()=>window.qaHost?.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel,.wintry-raster-tile,.wintry-precip-icon'),null,{timeout:15000});
 closeLatencies.push(Date.now()-started);
 assert.equal(await page.locator('.snowline-panel,.wintry-raster-tile,.wintry-precip-icon').count(),0,'Close must remove plugin UI and overlays');
}
async function mount(lat=46.5,lon=10,zoom=9){
 await close();
 await page.evaluate(({lat,lon,zoom})=>{localStorage.removeItem('wintry:prefs:v1');W.store.set('timestamp',Date.now());W.store.set('overlay','temp');W.map.map.setView([lat,lon],zoom,{animate:false})},{lat,lon,zoom});
 await page.waitForTimeout(1000);
 await page.evaluate(async url=>{
  const mod=await import(url),config=mod.__pluginConfig;
  if(config.version!=='1000.1.9')throw new Error('Wrong published plugin');
  const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
  W.plugins[config.name]=host;window.qaHost=host;await host.open({params:{},disableOpeningAnimation:true});
 },pluginURL);
 await idle();assert.equal(await page.evaluate(()=>W.store.get('overlay')),'ptype');
}
async function snapshot(name){await page.screenshot({path:'test-output/qa-'+name+'.png'});}
async function check(name,fn){
 phase=name;const started=Date.now();
 try{const details=await fn();results.push({name,passed:true,ms:Date.now()-started,details});console.log('PASS',name,JSON.stringify(details??{}))}
 catch(error){results.push({name,passed:false,ms:Date.now()-started,error:String(error)});console.log('FAIL',name,String(error));await snapshot('failure-'+name).catch(()=>{})}
}
try{
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&W.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(()=>W.store.set('particlesAnim','off'));
 await check('reopen-and-cleanup',async()=>{
  await mount();assert.equal(await page.locator('.refresh-error').count(),0);
  await page.getByRole('button',{name:'Hide Wintry forecast panel'}).click();
  await page.getByRole('button',{name:'Show Wintry forecast panel'}).click();
  await close();await mount();assert.equal(await page.locator('.snowline-panel').count(),1);
  await close();return{opens:2,orphanOverlays:0};
 });
 await check('jordan-and-dead-sea',async()=>{
  await mount(31.75,35.55,9);assert.equal(await page.locator('.refresh-error').count(),0);
  await snapshot('jordan');return{rasterTiles:await page.locator('.wintry-raster-tile').count()};
 });
 await check('high-latitude-norway',async()=>{
  await mount(69.65,18.96,8);assert.equal(await page.locator('.refresh-error').count(),0);
  await snapshot('norway');return{rasterTiles:await page.locator('.wintry-raster-tile').count()};
 });
 await check('dateline-crossing',async()=>{
  await mount(40,179.9,8);assert.equal(await page.locator('.refresh-error').count(),0);
  const tiles=await page.evaluate(()=>[...document.querySelectorAll('.wintry-raster-tile')].map(i=>({width:i.naturalWidth,transform:i.style.transform})));
  assert.ok(tiles.length<128&&tiles.every(t=>t.width===256&&!/NaN|Infinity/.test(t.transform)));
  await snapshot('dateline');return{rasterTiles:tiles.length};
 });
 await check('outside-forecast-and-recovery',async()=>{
  await mount();await page.evaluate(()=>W.store.set('timestamp',Date.now()+400*3600000));await idle();
  assert.equal(await page.locator('.wintry-raster-tile').count(),0,'Out-of-range dates must not retain stale shading');
  await page.evaluate(()=>W.store.set('timestamp',Date.now()));await idle();assert.equal(await page.locator('.refresh-error').count(),0);
  return{staleShading:false};
 });
 await check('terrain-failure-fallback-and-recovery',async()=>{
  await close();blockDem=true;demBlocked=0;await mount();
  assert.ok(demBlocked>0,'Fault injection must reach elevation requests');assert.equal(await page.locator('.refresh-error').count(),0);
  await snapshot('dem-fallback');blockDem=false;
  await page.getByRole('button',{name:'↻ Refresh',exact:true}).click();await idle();
  assert.equal(await page.locator('.refresh-error').count(),0);
  return{blocked:demBlocked,recovered:true};
 });blockDem=false;
 await check('forecast-failure-retry-and-recovery',async()=>{
  await close();blockForecast=true;forecastBlocked=0;await mount();
  assert.ok(forecastBlocked>0,'Fault injection must reach forecast requests');
  assert.ok(await page.locator('.refresh-error').count()>0);assert.equal(await page.locator('.wintry-raster-tile').count(),0);
  await snapshot('forecast-unavailable');blockForecast=false;
  await page.getByRole('button',{name:'Retry',exact:true}).click();await idle();
  assert.equal(await page.locator('.refresh-error').count(),0);
  return{blocked:forecastBlocked,recovered:true};
 });blockForecast=false;
 await check('close-during-navigation',async()=>{
  await mount();await page.evaluate(()=>{W.map.map.setView([47,11],10,{animate:false});W.store.set('timestamp',Date.now()+12*3600000)});
  await page.waitForTimeout(150);await close();await page.waitForTimeout(3000);
  assert.equal(await page.locator('.snowline-panel,.wintry-raster-tile,.wintry-precip-icon').count(),0);
  return{lateOverlays:0};
 });
 await check('unhandled-plugin-errors',async()=>{assert.deepEqual(errors.filter(e=>e.plugin),[]);return{pluginErrors:0,nativeWindyErrors:errors.filter(e=>!e.plugin).length}});
}finally{
 await writeFile('test-output/robustness-results.json',JSON.stringify({version:'1000.1.9',results,errors,closeLatencies},null,2));
 await browser.close();
}
assert.equal(results.filter(r=>!r.passed).length,0,'Robustness failures: '+JSON.stringify(results.filter(r=>!r.passed)));
