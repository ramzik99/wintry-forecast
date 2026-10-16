import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const urls=new Map();
function url(name){
  if(urls.has(name))return urls.get(name);
  const source=readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8')
    .replace(/(['"])\.\/([A-Za-z]+)\1/g,(_,q,n)=>JSON.stringify(url(n)));
  const result='data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
  urls.set(name,result);return result;
}
const {terrainPrecipitationType,supportedPrecipitationType,precipitationLabel}=await import(url('precipType'));
const {resolvedSnowlineM,wetBulbZeroHeight}=await import(url('snowLevel'));
const {buildSnowForecast,snowForecastWindow}=await import(url('snowForecast'));
const {snowfallInput}=await import(url('snowAccum'));
const {conditionLabel,noEventMessage}=await import(url('forecastStatus'));
const {nextWintryEvent}=await import(url('eventOutlook'));
const {precipitationAccumulation}=await import(url('precipAccumulation'));
const {forecastCoverage}=await import(url('forecastCoverage'));
const {formatSnow,formatSnowline}=await import(url('displayUnits'));
const {PRECIP_TYPE_COLOURS}=await import(url('precipShading'));
const h=3600000;
const node=(z,tw)=>({heightM:z,wetBulbC:tw,tempC:tw,dewpointC:tw,pressureHpa:850,level:'850h'});
const sparsePoint=()=>({times:Array.from({length:9},(_,i)=>i*3*h),forecast:{
  __precipMm3h:Array(9).fill(6),__precipPeriodsH:Array(9).fill(3),
  'temp-850h':Array(9).fill(-5),'dewpoint-850h':Array(9).fill(-5),'gh-850h':Array(9).fill(1000),
  'temp-700h':Array(9).fill(-10),'dewpoint-700h':Array(9).fill(-10),'gh-700h':Array(9).fill(3000)}});

test('sparse and below-profile public guidance abstains while retaining the raw research diagnosis',()=>{
  for(const [profile,z] of [[[node(1000,-5),node(3000,-10)],1000],[[node(1000,-5),node(1800,-10)],500]]){
    assert.equal(terrainPrecipitationType(profile,z).key,'snow');
    const guidance=supportedPrecipitationType(profile,z);
    assert.equal(guidance.key,'uncertain');assert.equal(precipitationLabel(guidance),'Precipitation · type unresolved');
    assert.notEqual(conditionLabel(6,guidance),'Dry');assert.equal(snowfallInput(6,guidance,3),null);
  }
});

test('a site exactly on a sampled level is not extrapolation, and supported cold/rain types remain available',()=>{
  for(const [tw,key] of [[-5,'snow'],[5,'rain']]){
    const phase=supportedPrecipitationType([node(1000,tw),node(1500,tw),node(2000,tw)],1000);
    assert.equal(phase.key,key);assert.notEqual(phase.confidence,'low');
  }
  const borderline=supportedPrecipitationType([node(0,0.02),node(500,5),node(1000,5),node(1500,-5)],0);
  assert.equal(borderline.confidence,'medium');assert.match(precipitationLabel(borderline),/possible$/);
});

test('unresolved wet phase withholds snow amounts without losing known liquid totals or implying no wintry weather',()=>{
  const point=sparsePoint(),series=buildSnowForecast(point,1000);
  assert.equal(series.thermalPhases[0].key,'uncertain');assert.equal(series.prefix,0);
  assert.equal(snowForecastWindow(series,0,24*h).snowfallCm,null);
  assert.equal(precipitationAccumulation(point.times,series.amounts,0,24*h,series.sourcePeriods).mm,48);
  assert.equal(nextWintryEvent(point,1000,0),null);
  assert.equal(noEventMessage(point,1000,0),'Wintry outlook uncertain · precipitation type unresolved');
  assert.equal(forecastCoverage([6],[series.thermalPhases[0]],[0]).complete,false);
});

test('an event is not merged across an unresolved wet interval or called complete at its boundary',()=>{
  const point=sparsePoint(),n=point.times.length;
  point.forecast['temp-800h']=Array(n).fill(-7.5);point.forecast['dewpoint-800h']=Array(n).fill(-7.5);point.forecast['gh-800h']=Array(n).fill(2000);
  point.forecast['temp-800h'][1]=null;
  const event=nextWintryEvent(point,1000,0);
  assert.equal(event.endTime,3*h);assert.equal(event.incomplete,true);assert.equal(event.newSnowCm,9);
});

test('all-cold extrapolated WBZ is not shown as a resolved numeric snowline; snow type can still be supported',()=>{
  const profile=[node(1000,-5),node(1800,-10)];
  assert.ok(Number.isFinite(wetBulbZeroHeight(profile).snowLevelM));
  assert.equal(resolvedSnowlineM(profile),null);
  assert.equal(supportedPrecipitationType(profile,1000).key,'snow');
  assert.equal(resolvedSnowlineM([node(0,2),node(1000,-2)]),500);
  assert.equal(resolvedSnowlineM([node(0,2),node(5000,-2)]),null);
});

test('known precipitation with no usable profile remains unresolved, never a zero-snow forecast',()=>{
  const phase=supportedPrecipitationType([],1000);
  assert.equal(phase.key,'uncertain');assert.equal(snowfallInput(6,phase,3),null);
  assert.equal(supportedPrecipitationType([],NaN),null);
});

test('terrain crossing times are withheld across unresolved cold-column extrapolation',async()=>{
  const {terrainCrossingState}=await import(url('terrainCrossing'));
  assert.equal(terrainCrossingState(sparsePoint(),1000,0).crossingTime,null);
});

test('contours preserve valid regions on both sides of missing samples without bridging the gap',async()=>{
  const {contourPolylines}=await import(url('contours'));
  const grid=Array.from({length:2},(_,r)=>[0,2,null,0,2].map((value,c)=>({lat:45+r,lon:c,value})));
  const lines=contourPolylines(grid,1);
  assert.equal(lines.length,2);
  assert.ok(lines.every(line=>line.every(([,lon])=>lon<1||lon>3)));
});

test('coarse estimates preserve positive traces and distinguish unknown values from zero',()=>{
  assert.equal(formatSnow(0,'metric'),'None');assert.equal(formatSnow(null,'metric'),'Unavailable');
  assert.equal(formatSnow(.01,'metric'),'<1 cm');assert.equal(formatSnow(.7,'metric'),'<1 cm');
  assert.equal(formatSnow(7.4,'metric'),'≈ 7 cm');assert.equal(formatSnow(1,'imperial'),'<1 in');
  assert.equal(formatSnowline(2620,'metric'),'≈ 2600 m');assert.equal(formatSnowline(null,'metric'),'Unresolved');
  assert.ok(!Object.entries(PRECIP_TYPE_COLOURS).some(([key,value])=>key!=='uncertain'&&value===PRECIP_TYPE_COLOURS.uncertain));
});
