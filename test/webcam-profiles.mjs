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

const urls={};for(const name of ['snowLevel','precipType','forecastTimeline','forecastTime','precip','selectedPrecip'])urls[name]=await sourceURL(name);
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage();
const cameras=[
{name:'Paradise',lat:46.785891,lon:-121.735462,elevation:1647,time:'2026-10-20T17:59:02Z',image:'https://www.nps.gov/webcams-mora/gh.jpg',observed:'Clear; no visible falling precipitation; dry pavement'},
{name:'Longmire',lat:46.750136,lon:-121.811676,elevation:825,time:'2026-10-20T18:03:04Z',image:'https://www.nps.gov/webcams-mora/longmire.jpg',observed:'Clear; no visible falling precipitation; dry road'},
{name:'West Entrance',lat:44.6564,lon:-111.0896,elevation:2031,approximatePosition:true,time:'2026-10-20T17:59:41Z',image:'https://www.nps.gov/webcams-yell/west_gate.jpg',observed:'Clear; no visible falling precipitation; dry road'},
{name:'Mount Washburn northeast',lat:44.79778,lon:-110.43444,elevation:3115,approximatePosition:true,time:'2026-10-20T18:00:24Z',image:'https://www.nps.gov/webcams-yell/washburn_ne.jpg',observed:'Clear; snow patches on ground; no visible falling precipitation'}
];
try{
 await page.goto('https://www.windy.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.fetch?.getMeteogramForecastData,null,{timeout:60000});
 const results=[];
 for(const camera of cameras){
  const result=await page.evaluate(async({camera,urls})=>{
   const {buildProfile}=await import(urls.snowLevel),{supportedPrecipitationType}=await import(urls.precipType),{buildForecastTimes}=await import(urls.forecastTimeline),{forecastIntervalIndex}=await import(urls.forecastTime),{precipMmAtTime}=await import(urls.precip),{loadSelectedPrecipFields,alignSelectedPrecipFields}=await import(urls.selectedPrecip);
   const r=await W.fetch.getMeteogramForecastData('ecmwf',{lat:camera.lat,lon:camera.lon,step:1});
   const forecast=r.data.data,run=Date.parse(r.data.header.refTime),times=buildForecastTimes(forecast,run);
   const target=Date.parse(camera.time);
   if(precipMmAtTime(forecast,times,target)===null)Object.assign(forecast,alignSelectedPrecipFields(await loadSelectedPrecipFields(camera.lat,camera.lon),times,run));
   const i=forecastIntervalIndex(times,target),profile=i<0?[]:buildProfile(forecast,i),phase=supportedPrecipitationType(profile,camera.elevation),mm=precipMmAtTime(forecast,times,target);
   return{...camera,model:'ECMWF',run:new Date(run).toISOString(),interval:i<0?null:new Date(times[i]).toISOString(),levels:profile.length,mm3h:mm,prediction:mm===0?'Dry':mm===null?'Unavailable':phase?.label??'Unavailable',conditionalType:phase,scope:'Camera checks occurrence only; no falling hydrometeors visible, so wet-phase accuracy is unverified.'};
  },{camera,urls});
  console.log(JSON.stringify(result));results.push(result);
 }
 await writeFile('test-output/webcam-profiles.json',JSON.stringify({retrievedAt:new Date().toISOString(),results},null,2));
}finally{await browser.close()}
