import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const url='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
try{
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&W.fetch?.getMeteogramForecastData,null,{timeout:60000});
 await page.evaluate(()=>W.store.set('particlesAnim','off'));
 for(const [name,lat,lon] of [['norway',69.65,18.96],['dateline',40,179.9]]){
  await page.evaluate(()=>window.qaContourHost?.close());
  await page.waitForFunction(()=>!document.querySelector('.snowline-panel,.wintry-raster-tile'),null,{timeout:15000});
  await page.evaluate(({lat,lon})=>{localStorage.removeItem('wintry:prefs:v1');W.map.map.setView([lat,lon],8,{animate:false});W.store.set('timestamp',Date.now())},{lat,lon});
  await page.waitForTimeout(1200);
  await page.evaluate(async url=>{
   const mod=await import(url),config=mod.__pluginConfig;
   const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
   W.plugins[config.name]=host;window.qaContourHost=host;await host.open({params:{},disableOpeningAnimation:true});
  },url);
  await page.waitForTimeout(500);
  await page.waitForFunction(()=>!!document.querySelector('.snowline-panel')&&!document.querySelector('.status-pill'),null,{timeout:180000});
  assert.equal(await page.locator('.refresh-error').count(),0);
  const paths=await page.locator('.leaflet-overlay-pane svg path').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('d')??''));
  assert.ok(paths.length>0&&paths.every(d=>!/NaN|Infinity/.test(d)));
  await page.screenshot({path:'test-output/corrected-contours-'+name+'.png'});
  console.log('Corrected contour rendering passed',name,paths.length,'SVG paths');
 }
 await page.evaluate(()=>qaContourHost.close());
 await page.waitForFunction(()=>!document.querySelector('.snowline-panel,.wintry-raster-tile'),null,{timeout:15000});
}finally{await browser.close()}
