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

await mkdir('test-output',{recursive:true});
const pluginURL='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
const timelineURL=await sourceURL('forecastTimeline');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let page;
try{
 for(const mobile of [false,true]){
  page=await browser.newPage(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'}:{viewport:{width:1365,height:1000}});
  await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>window.W?.map?.map?.maplibreMap&&window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
  await page.evaluate(async url=>{
   W.store.set('particlesAnim','off');W.map.map.setView([46.5,10],8,{animate:false});
   const {buildForecastTimes}=await import(url),r=await W.fetch.getMeteogramForecastData('ecmwf',{lat:46.5,lon:10,step:3});
   const times=buildForecastTimes(r.data.data,Date.parse(r.data.header.refTime));
   W.store.set('timestamp',times.find(t=>t>=Date.now())??times[0]);
  },timelineURL);
  await page.evaluate(async url=>{
   const mod=await import(url),config=mod.__pluginConfig;
   const host=new W.ExternalSveltePlugin.ExternalSveltePlugin({ident:config.name},{...config,url});
   W.plugins[config.name]=host;window.rollbackHost=host;
   await host.open({params:{},disableOpeningAnimation:true});window.rollbackApp=host.svelteApp;
  },pluginURL);
  await page.locator('.snowline-panel').waitFor({timeout:60000});
  await page.evaluate(()=>rollbackApp.onopen({lat:46.5,lon:10}));
  await page.locator('.point-tools').waitFor({timeout:60000});
  const openForecast=page.locator('.point-tools button').filter({hasText:'Forecast'});
  if(mobile)await openForecast.tap();else await openForecast.click();
  const chart=page.getByRole('dialog',{name:'Wintry forecast graph'});
  await chart.getByRole('img',{name:'Terrain-aware wintry forecast through 144 hours'}).waitFor();
  assert.ok(!/limited atmospheric|unresolved|type uncertain|snowfall|remaining layer|wintry period|terrain flow/i.test(await chart.innerText()));
  assert.ok(await chart.locator('.snowline-line').count()===1);
  assert.ok(await chart.locator('.phase-base').count()===1);
  assert.ok((await chart.locator('.snowline-line').getAttribute('d')).trim().length>0);
  assert.ok(!/limited atmospheric|unresolved|type uncertain|snowfall|remaining layer|wintry period|terrain flow/i.test(await page.locator('.snowline-click-label').innerText()));
  assert.ok(/Snowline/i.test(await page.locator('.snowline-click-label').innerText()));
  await page.screenshot({path:'test-output/restored-forecast-'+(mobile?'mobile':'desktop')+'.png'});
  if(!mobile){
    const downloaded=page.waitForEvent('download');
    await chart.getByRole('button',{name:'Save image',exact:true}).click();
    const png=await downloaded;assert.equal(await png.failure(),null);await png.saveAs('test-output/core-forecast-export.png');
    assert.equal((await readFile('test-output/core-forecast-export.png')).subarray(1,4).toString(),'PNG');
  }
  const soundingTab=chart.getByRole('tab',{name:'Sounding',exact:true});
  if(mobile)await soundingTab.tap();else await soundingTab.click();
  const svg=chart.getByRole('img',{name:'Temperature, dew point and wet-bulb vertical profile'});
  await svg.waitFor();
  const plotted=(await chart.locator('.temp-line').getAttribute('points')).trim().split(' ').length;
  const countText=await chart.getByLabel('Atmospheric layer count').innerText();
  const supplied=Number(countText.match(/^(\d+)/)?.[1]);
  assert.ok(supplied>=plotted&&plotted>=3,countText);
  assert.ok(countText.includes('1000'),countText);
  console.log('Sounding levels',mobile?'mobile':'desktop',JSON.stringify({supplied,plotted,countText}));
  assert.ok(!/limited atmospheric|unresolved|type uncertain/i.test(await chart.innerText()));
  const zoom=chart.getByRole('button',{name:'Zoom in',exact:true}),fit=chart.getByRole('button',{name:'Fit sounding',exact:true});
  if(mobile)await zoom.tap();else await zoom.click();
  assert.ok((await svg.getAttribute('style')).includes('125'));
  if(mobile)await fit.tap();else await fit.click();
  assert.ok((await svg.getAttribute('style')).includes('100'));
  await page.screenshot({path:'test-output/restored-sounding-'+(mobile?'mobile':'desktop')+'.png'});
  const close=chart.getByRole('button',{name:'Close graph',exact:true});
  if(mobile)await close.tap();else await close.click();
  await chart.waitFor({state:'detached'});
  await page.evaluate(()=>rollbackHost.close());
  await page.waitForFunction(()=>!document.querySelector('.snowline-panel'));
  console.log('Core Wintry forecast '+(mobile?'mobile':'desktop')+' forecast, sounding, zoom, wording and cleanup passed.');
  await page.close();
 }
} catch(error){await page?.screenshot({path:'test-output/restored-failure.png'}).catch(()=>{});throw error;}
finally{await browser.close()}
