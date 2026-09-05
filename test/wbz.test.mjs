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

test('interpolates above local terrain and is independent of input order', () => {
  const r = wetBulbZeroHeight([point(2000,-2), point(1000,2), point(0,6)], 800);
  assert.equal(r.status,'resolved'); assert.equal(r.snowLevelM,1500);
  assert.equal(r.lower.heightM,1000);
});
test('a below-ground warm level cannot manufacture a resolved crossing', () => {
  const p=[point(0,2),point(1000,-2),point(2000,-8)];
  assert.equal(wetBulbZeroHeight(p,0).snowLevelM,500);
  const r=wetBulbZeroHeight(p,800);
  assert.equal(r.snowLevelM,null); assert.equal(r.status,'below-lowest-level');
  assert.equal(r.upperBoundM,1000);
});
test('valid terrain below sea level is retained', () => {
  assert.equal(wetBulbZeroHeight([point(-300,2),point(100,-2)],-400).snowLevelM,-100);
});
test('unknown terrain never silently falls back to an unmasked calculation', () => {
  for(const terrain of [null,undefined,NaN,Infinity]) {
    assert.equal(wetBulbZeroHeight([point(0,2),point(1000,-2)],terrain).status,'terrain-unavailable');
  }
});
test('an exact zero on terrain is resolved, while an already cold column is not', () => {
  assert.equal(wetBulbZeroHeight([point(800,0)],800).snowLevelM,800);
  assert.equal(wetBulbZeroHeight([point(800,-1),point(1800,-5)],800).snowLevelM,null);
});
test('missing, all-masked, warm-only and duplicate-height profiles produce no fabricated WBZ', () => {
  assert.equal(wetBulbZeroHeight([],0).status,'insufficient-profile');
  assert.equal(wetBulbZeroHeight([point(0,2),point(100,-2)],200).status,'insufficient-profile');
  assert.equal(wetBulbZeroHeight([point(0,2),point(1000,1)],0).status,'no-crossing');
  assert.equal(wetBulbZeroHeight([point(1000,2),point(1000,-2)],0).snowLevelM,null);
  assert.equal(wetBulbZeroHeight([point(NaN,1),point(1000,NaN)],0).snowLevelM,null);
});
test('raw forecast heights stay in metres and feed the terrain-aware calculation', () => {
  const profile=buildProfile({'temp-850h':[275.15],'dewpoint-850h':[275.15],'gh-850h':[1500],
    'temp-700h':[271.15],'dewpoint-700h':[271.15],'gh-700h':[3000]},0);
  assert.equal(wetBulbZeroHeight(profile,1000).snowLevelM,2250);
  assert.equal(wetBulbZeroHeight(profile,2000).snowLevelM,null);
});
test('terrain timing cannot bridge an unresolved forecast interval', () => {
  const p={times:[0,3600000,7200000],forecast:{
    'temp-850h':[2,-2,2], 'dewpoint-850h':[2,-2,2], 'gh-850h':[1000,1000,1000],
    'temp-700h':[-2,-4,-2], 'dewpoint-700h':[-2,-4,-2], 'gh-700h':[2000,2000,2000]}};
  const r=terrainCrossingState(p,800,0);
  assert.equal(r.summary,'Terrain crossing unresolved'); assert.equal(r.crossingTime,null);
});
