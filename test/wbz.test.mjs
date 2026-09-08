import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function moduleUrl(name, replacements = []) {
  let source = readFileSync(new URL(`../src/${name}.ts`, import.meta.url), 'utf8');
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
}
const coreUrl = moduleUrl('snowLevel');
const { wetBulbZeroHeight, buildProfile } = await import(coreUrl);
const { terrainCrossingState } = await import(moduleUrl('terrainCrossing', [["'./snowLevel'", JSON.stringify(coreUrl)]]));
const point = (heightM, wetBulbC) => ({heightM, wetBulbC, pressureHpa:850, level:'850h', tempC:wetBulbC, dewpointC:wetBulbC});

test('interpolates the atmospheric crossing and is independent of input order', () => {
  const r = wetBulbZeroHeight([point(2000,-2), point(1000,2), point(0,6)]);
  assert.equal(r.status,'resolved'); assert.equal(r.snowLevelM,1500);
  assert.equal(r.lower.heightM,1000);
});
test('WBZ remains below local mountain terrain for a snow comparison', () => {
  const p=[point(0,2),point(1000,-2),point(2000,-8)];
  assert.equal(wetBulbZeroHeight(p).snowLevelM,500);
});
test('valid terrain below sea level is retained', () => {
  assert.equal(wetBulbZeroHeight([point(-300,2),point(100,-2)]).snowLevelM,-100);
});
test('an exact zero level resolves and an already cold column stays finite below the profile', () => {
  assert.equal(wetBulbZeroHeight([point(800,0)]).snowLevelM,800);
  const cold=wetBulbZeroHeight([point(800,-1),point(1800,-5)]);
  assert.equal(cold.status,'below-lowest-level');
  assert.equal(cold.snowLevelM,550);
  assert.equal(cold.upperBoundM,800);
  assert.equal(cold.extrapolated,true);
});
test('cold-column fallback remains finite with a shallow or inverted resolved gradient', () => {
  const shallow=wetBulbZeroHeight([point(100,-2),point(1100,-2.2)]);
  const inversion=wetBulbZeroHeight([point(100,-2),point(1100,-1)]);
  assert.ok(Number.isFinite(shallow.snowLevelM));
  assert.ok(Number.isFinite(inversion.snowLevelM));
  assert.ok(shallow.snowLevelM < 100);
  assert.ok(inversion.snowLevelM < 100);
});
test('missing, warm-only and duplicate-height profiles produce no fabricated WBZ', () => {
  assert.equal(wetBulbZeroHeight([]).status,'insufficient-profile');
  
  assert.equal(wetBulbZeroHeight([point(0,2),point(1000,1)]).status,'no-crossing');
  assert.equal(wetBulbZeroHeight([point(1000,2),point(1000,-2)]).snowLevelM,null);
  assert.equal(wetBulbZeroHeight([point(NaN,1),point(1000,NaN)]).snowLevelM,null);
});
test('raw forecast heights stay in metres and feed the terrain-aware calculation', () => {
  const profile=buildProfile({'temp-850h':[275.15],'dewpoint-850h':[275.15],'gh-850h':[1500],
    'temp-700h':[271.15],'dewpoint-700h':[271.15],'gh-700h':[3000]},0);
  assert.equal(wetBulbZeroHeight(profile).snowLevelM,2250);
  assert.equal(wetBulbZeroHeight(profile).snowLevelM,2250);
});
test('terrain timing stays continuous through a fully cold forecast interval', () => {
  const p={times:[0,3600000,7200000],forecast:{
    'temp-850h':[2,-2,2], 'dewpoint-850h':[2,-2,2], 'gh-850h':[1000,1000,1000],
    'temp-700h':[-2,-4,-2], 'dewpoint-700h':[-2,-4,-2], 'gh-700h':[2000,2000,2000]}};
  const r=terrainCrossingState(p,800,0);
  assert.equal(r.direction,'below');
  assert.ok(r.crossingTime !== null);
});

const { terrainHatchSegments } = await import(moduleUrl('terrainHatching'));
const { terrainPrecipitationType } = await import(moduleUrl('precipType'));
const grid=(values)=>values.map((row,r)=>row.map((difference,c)=>({x:c*100,y:r*100,difference})));
test('hatching covers positive terrain differences only',()=>{
  const lines=terrainHatchSegments(grid([[-100,100],[-100,100]]),10);
  assert.ok(lines.length>0);
  for(const line of lines) for(const [x,y] of line){assert.ok(x>=50-1e-8&&x<=100);assert.ok(y>=0&&y<=100);}
});
test('equal, lower and missing terrain remain unhatchable',()=>{
  for(const values of [[[0,0],[0,0]],[[-1,-2],[-3,-4]],[[100,null],[100,100]]])
    assert.equal(terrainHatchSegments(grid(values)).length,0);
});
test('hatching follows a changed forecast snowline',()=>{
  assert.ok(terrainHatchSegments(grid([[100,100],[100,100]])).length>0);
  assert.equal(terrainHatchSegments(grid([[-100,-100],[-100,-100]])).length,0);
});
test('cold mountain profile still diagnoses snow above the atmospheric WBZ',()=>{
  const p=[point(0,2),point(1000,-2),point(1800,-5),point(2600,-8)];
  assert.equal(wetBulbZeroHeight(p).snowLevelM,500);
  assert.equal(terrainPrecipitationType(p,1200).key,'snow');
});

const { contourPolylines } = await import(moduleUrl('contours'));
test('contours bridge a missing viewport sample instead of breaking around it',()=>{
  const missing={lat:0,lon:0,value:null};
  const field=[
    [{lat:70,lon:0,value:0},missing,{lat:70,lon:2,value:4}],
    [{lat:71,lon:0,value:0},missing,{lat:71,lon:2,value:4}],
    [{lat:72,lon:0,value:0},missing,{lat:72,lon:2,value:4}],
  ];
  const lines=contourPolylines(field,1);
  assert.equal(lines.length,1);
  assert.ok(lines[0].length>=3);
  assert.ok(lines[0].every(([lat,lon])=>lat>=70&&lat<=72&&lon>=0&&lon<=2));
});

const { alignPrecipIntervals } = await import(moduleUrl('precipIntervals'));
const { formatPrecip } = await import(moduleUrl('displayUnits'));
const { estimateNewSnowStep } = await import(moduleUrl('snowAccum'));
const precipUrl=moduleUrl('precip',[["'./snowLevel'",JSON.stringify(coreUrl)]]);
const {precipMmAt}=await import(precipUrl);
const {nextWintryEvent}=await import(moduleUrl('eventOutlook',[["'./snowLevel'",JSON.stringify(coreUrl)],["'./precip'",JSON.stringify(precipUrl)],["'./precipType'",JSON.stringify(moduleUrl('precipType'))],["'./snowAccum'",JSON.stringify(moduleUrl('snowAccum'))]]));
test('three-hour source totals align by interval start, with no missing-value invention',()=>{
 const h=3600000;
 const data=alignPrecipIntervals([0,3*h,6*h],[6,null,9],[-h,0,2*h,3*h,6*h,9*h]);
 assert.deepEqual(data.__precipMm3h,[null,6,6,null,9,null]);
 assert.equal(precipMmAt(data,0),null);
 assert.equal(precipMmAt(data,1),6);
 assert.equal(formatPrecip(6,'metric'),'6 mm/3h');
});
test('three-hour snowfall uses the full liquid amount',()=>{
 const phase={key:'snow',surfaceWetBulbC:-5};
 assert.equal(estimateNewSnowStep(6,phase,0,3).cumulativeCm,9);
});
test('a single three-hour snow interval contributes a full interval to event totals',()=>{
 const h=3600000;
 const p={times:[0,3*h,6*h],forecast:{__precipMm3h:[6,0,0],
 'temp-850h':[-5,-5,-5],'dewpoint-850h':[-5,-5,-5],'gh-850h':[1000,1000,1000],
 'temp-700h':[-8,-8,-8],'dewpoint-700h':[-8,-8,-8],'gh-700h':[3000,3000,3000]}};
 const e=nextWintryEvent(p,1000,0);
 assert.ok(e);assert.equal(e.endTime,3*h);assert.equal(e.newSnowCm,9);
});

const { prepareSnowlineContours } = await import(moduleUrl('snowlineContours'));
const contourGrid = values => values.map((row, r) => row.map((value, c) => ({lat:70+r,lon:c,value})));

test('contour display floors cold diagnostics at -500 m without changing raw terrain values',()=>{
  const cold=wetBulbZeroHeight([point(100,-12),point(1100,-18)]);
  assert.equal(cold.snowLevelM,-1900);
  assert.equal(cold.status,'below-lowest-level');
  const raw=contourGrid([[cold.snowLevelM,-500,-430],[-100,0,1000]]);
  const original=structuredClone(raw);
  const {field,levels}=prepareSnowlineContours(raw,100);
  assert.deepEqual(field.map(row=>row.map(p=>p.value)),[[-500,-500,-430],[-100,0,1000]]);
  assert.deepEqual(raw,original);
  assert.equal(levels[0],-500);
  assert.equal(levels.at(-1),1000);
  assert.equal(cold.snowLevelM,-1900);
});

test('all zoom intervals respect the contour floor and retain zero and major levels',()=>{
  for(const interval of [100,200,500]){
    const {field,levels}=prepareSnowlineContours(contourGrid([[-1900,1200],[-800,1200]]),interval);
    assert.equal(levels[0],-500);
    assert.ok(levels.includes(0));
    assert.ok(levels.includes(1000));
    assert.ok(levels.every(level=>level>=-500));
    assert.ok(levels.slice(1).every(level=>level%interval===0));
    for(const level of [-2000,-1000,-600]) assert.deepEqual(contourPolylines(field,level),[]);
    assert.ok(contourPolylines(field,0).length>0);
  }
  const {levels}=prepareSnowlineContours(contourGrid([[-430,0],[-430,0]]),200);
  assert.deepEqual(levels,[-500,-400,-200,0]);
});

test('contour floor keeps missing samples missing and handles entirely cold or absent fields',()=>{
  const {field,levels}=prepareSnowlineContours(contourGrid([[-1900,null],[NaN,Infinity]]),100);
  assert.deepEqual(field.map(row=>row.map(p=>p.value)),[[-500,null],[null,null]]);
  assert.deepEqual(levels,[-500]);
  assert.deepEqual(contourPolylines(field,-600),[]);
  assert.deepEqual(prepareSnowlineContours(contourGrid([[null,NaN]]),200).levels,[]);
  assert.deepEqual(prepareSnowlineContours([],500),{field:[],levels:[]});
});
