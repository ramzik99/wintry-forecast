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
const {snowBudgetStep,snowfallInput}=await import(url('snowAccum'));
const {buildSnowForecast,snowForecastWindow,snowfallAtTime}=await import(url('snowForecast'));
const {terrainSlopes,terrainFlow}=await import(url('terrainFlow'));
const {alignPrecipIntervals}=await import(url('precipIntervals'));
const {precipitationAccumulation}=await import(url('precipAccumulation'));
const {precipMmAt,precipMmAtTime,isPrecipitating}=await import(url('precip'));
const {buildProfile,wetBulbFromDewpoint}=await import(url('snowLevel'));
const {conditionLabel,noEventMessage}=await import(url('forecastStatus'));
const {nextWintryEvent}=await import(url('eventOutlook'));
const h=3600000;
const phase=(key='snow',tw=-5)=>({key,surfaceWetBulbC:tw,meltingDegreeMetres:700});
const fixture=(step=3)=>{
  const times=Array.from({length:144/step+1},(_,i)=>i*step*h),n=times.length;
  return {times,forecast:{__precipMm3h:Array(n).fill(6),__precipPeriodsH:Array(n).fill(step),
    'temp-850h':Array(n).fill(-5),'dewpoint-850h':Array(n).fill(-5),'gh-850h':Array(n).fill(1000),
    'temp-700h':Array(n).fill(-10),'dewpoint-700h':Array(n).fill(-10),'gh-700h':Array(n).fill(3000)}};
};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('water budget: cold settling reduces depth while preserving SWE; warm dry air melts water',()=>{
  const initial={sweMm:12,depthCm:18};
  const cold=snowBudgetStep(0,phase(),initial,3);
  assert.equal(cold.complete,true);assert.equal(cold.layer.sweMm,12);assert.equal(cold.meltMm,0);
  assert.ok(cold.layer.depthCm<18);assert.equal(cold.snowfallCm,0);
  const warm=snowBudgetStep(0,phase('rain',4),initial,3);
  assert.equal(warm.complete,true);assert.ok(warm.meltMm>0);assert.ok(warm.layer.sweMm<12);
  close(warm.layer.sweMm+warm.meltMm,initial.sweMm);
  assert.deepEqual(initial,{sweMm:12,depthCm:18});
});

test('new snow + previous SWE equals remaining SWE + melt, without negative water/depth',()=>{
  for(const tw of [-15,-5,0,0.5,4,12])for(const key of ['snow','wet-snow','mix','rain','ice-pellets','freezing-rain']){
    const result=snowBudgetStep(12,phase(key,tw),{sweMm:5,depthCm:7},3);
    assert.equal(result.complete,true);assert.ok(result.layer.sweMm>=0&&result.layer.depthCm>=0);
    close(5+result.snowfallSweMm,result.layer.sweMm+result.meltMm);
    assert.ok(result.snowfallSweMm<=12);assert.ok(result.layer.depthCm<=7+result.snowfallCm);
  }
  const melted=snowBudgetStep(0,phase('rain',20),{sweMm:0.1,depthCm:0.15},3);
  assert.equal(melted.layer.sweMm,0);assert.equal(melted.layer.depthCm,0);close(melted.meltMm,0.1);
});

test('hourly versus three-hourly snow integration conserves gross snowfall and remaining layer',()=>{
  const a=buildSnowForecast(fixture(1),1000),b=buildSnowForecast(fixture(3),1000);
  for(const start of [0,1.5*h,120*h]){
    const x=snowForecastWindow(a,start,start+24*h),y=snowForecastWindow(b,start,start+24*h);
    assert.equal(x.complete,true);assert.equal(y.complete,true);
    close(x.snowfallCm,72);close(x.snowfallCm,y.snowfallCm);
    close(x.remainingSweMm,y.remainingSweMm);close(x.remainingLayerCm,y.remainingLayerCm);
  }
  const series=buildSnowForecast(fixture(),1000);
  close(snowfallAtTime(series,1.5*h),4.5);close(snowfallAtTime(series,3*h),9);
  assert.equal(snowfallAtTime(series,-1),null);
  assert.equal(snowForecastWindow(series,121*h,145*h).complete,false);
});

test('snowfall total stays cumulative through warm dry weather; remaining new layer can melt',()=>{
  const p=fixture(),f=p.forecast;f.__precipMm3h.fill(0);f.__precipMm3h[0]=6;
  for(let i=1;i<p.times.length;i++){f['temp-850h'][i]=6;f['dewpoint-850h'][i]=6;}
  const series=buildSnowForecast(p,1000),result=snowForecastWindow(series,0,24*h);
  close(result.snowfallCm,9);assert.ok(result.remainingLayerCm<9);assert.ok(result.remainingSweMm<6);
  assert.ok(series.cumulativeSnowfallCm.every((v,i,a)=>i===0||v>=a[i-1]));
});

test('unknown wet phase/precipitation and unsupported time cannot become zero snow',()=>{
  for(const value of [null,-1,NaN]){
    const p=fixture();p.forecast.__precipMm3h[2]=value;
    const series=buildSnowForecast(p,1000);assert.equal(series.prefix,2);
    assert.equal(snowForecastWindow(series,0,24*h).snowfallCm,null);
    assert.equal(snowfallAtTime(series,7*h),null);
    assert.equal(snowForecastWindow(series,9*h,33*h).complete,true);
  }
  const p=fixture();delete p.forecast['temp-700h'];
  assert.equal(snowForecastWindow(buildSnowForecast(p,1000),0,24*h).complete,false);
  const dry=fixture();dry.forecast.__precipMm3h.fill(0);delete dry.forecast['temp-700h'];
  assert.equal(snowForecastWindow(buildSnowForecast(dry,1000),0,24*h).snowfallCm,0);
  const gaps=fixture();gaps.forecast.__precipPeriodsH.fill(1);
  assert.equal(snowForecastWindow(buildSnowForecast(gaps,1000),0,24*h).complete,false);
  assert.equal(nextWintryEvent(gaps,1000,0).incomplete,true);
  assert.equal(noEventMessage({...gaps,forecast:{...gaps.forecast,__precipMm3h:gaps.times.map(()=>0)}},1000,0),'No wintry precipitation for 1 h');
});

test('a missing dry thermal profile leaves gross snowfall known but retained snow unknown',()=>{
  const p=fixture();p.forecast.__precipMm3h.fill(0);p.forecast.__precipMm3h[0]=6;
  p.forecast['temp-700h'][1]=null;
  const result=snowForecastWindow(buildSnowForecast(p,1000),0,24*h);
  assert.equal(result.complete,true);close(result.snowfallCm,9);assert.equal(result.remainingLayerCm,null);
  assert.equal(snowBudgetStep(0,null,{sweMm:5,depthCm:7},3).complete,false);
  for(const bad of [null,NaN,-1])assert.equal(snowfallInput(bad,phase(),3),null);
});

test('a storm ending at a missing interval is qualified rather than called a complete event total',()=>{
  const p=fixture();p.forecast.__precipMm3h[2]=null;
  const event=nextWintryEvent(p,1000,0);
  assert.equal(event.endTime,6*h);assert.equal(event.incomplete,true);
});

test('source interval support ends at the source boundary even when target starts inside it',()=>{
  const aligned=alignPrecipIntervals([0,3*h,6*h],[6,0,0],[2*h,5*h]);
  assert.deepEqual(aligned.__precipPeriodsH,[1,1]);
  const totals=precipitationAccumulation([2*h,5*h],aligned.__precipMm3h,2*h,5*h,aligned.__precipPeriodsH);
  assert.equal(totals.complete,false);
  assert.equal(precipMmAtTime(aligned,[2*h,5*h],2.5*h),6);
  assert.equal(precipMmAtTime(aligned,[2*h,5*h],3*h),null);
  for(const source of [[0,0,3*h],[3*h,0,6*h],[0,NaN,6*h]])assert.ok(alignPrecipIntervals(source,[1,2,3],[0,h]).__precipMm3h.every(v=>v===null));
  assert.equal(alignPrecipIntervals([0,3*h],[-1,0],[0]).__precipMm3h[0],null);
});

test('positive traces are wet consistently; negative source values stay unavailable',()=>{
  for(const value of [0.001,0.01,0.1,1]){
    assert.equal(isPrecipitating(value),true);assert.notEqual(conditionLabel(value,phase()),'Dry');
    const p=fixture();p.forecast.__precipMm3h.fill(value);
    assert.ok(nextWintryEvent(p,1000,0));assert.ok(snowForecastWindow(buildSnowForecast(p,1000),0,24*h).snowfallCm>0);
  }
  assert.equal(conditionLabel(0,null),'Dry');
  for(const field of ['__precipMm3h','past3hprecip-surface','precip'])assert.equal(precipMmAt({[field]:[-1]},0),null);
});

test('below-model-terrain levels are masked only with explicit model terrain metadata',()=>{
  const p=fixture();p.forecast.__modelTerrainM=1500;
  assert.deepEqual(buildProfile(p.forecast,0).map(v=>v.heightM),[3000]);
  delete p.forecast.__modelTerrainM;
  assert.deepEqual(buildProfile(p.forecast,0).map(v=>v.heightM),[1000,3000]);
  assert.ok(Number.isNaN(wetBulbFromDewpoint(NaN,0,850)));
  assert.ok(Number.isNaN(wetBulbFromDewpoint(0,-2,-1)));
});

test('terrain exposure reverses with wind and ignores below-terrain winds; does not modify amounts',()=>{
  const slopes=terrainSlopes(1000,1400,1000,1000),p=fixture(),f=p.forecast;
  f['wind_u-850h']=[100];f['wind_v-850h']=[0];f['wind_u-700h']=[10];f['wind_v-700h']=[0];
  const before=structuredClone(f.__precipMm3h);
  const upslope=terrainFlow(f,0,1500,slopes);
  assert.equal(upslope.direction,'Upslope');assert.equal(upslope.level,'700h');close(upslope.upliftProxyMs,1);
  f['wind_u-700h'][0]=-10;
  const downslope=terrainFlow(f,0,1500,slopes);close(downslope.upliftProxyMs,-1);assert.equal(downslope.direction,'Downslope');
  assert.deepEqual(f.__precipMm3h,before);
  assert.equal(terrainFlow(f,0,1500,null),null);
  assert.equal(terrainSlopes(null,1000,1000,1000),null);
  assert.equal(terrainSlopes(1000,1400,1000,1000,100),null);
  delete f['wind_u-700h'];assert.equal(terrainFlow(f,0,1500,slopes),null);
});
