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
test('an exact zero level is resolved, while an already cold column is not', () => {
  assert.equal(wetBulbZeroHeight([point(800,0)]).snowLevelM,800);
  assert.equal(wetBulbZeroHeight([point(800,-1),point(1800,-5)]).snowLevelM,null);
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
test('terrain timing cannot bridge an unresolved forecast interval', () => {
  const p={times:[0,3600000,7200000],forecast:{
    'temp-850h':[2,-2,2], 'dewpoint-850h':[2,-2,2], 'gh-850h':[1000,1000,1000],
    'temp-700h':[-2,-4,-2], 'dewpoint-700h':[-2,-4,-2], 'gh-700h':[2000,2000,2000]}};
  const r=terrainCrossingState(p,800,0);
  assert.equal(r.summary,'Terrain crossing unresolved'); assert.equal(r.crossingTime,null);
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
