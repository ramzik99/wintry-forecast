import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/precipShading.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipitationShade,dryTerrainDifference,viewportGridForZoom,sampleTileBounds,PRECIP_TYPE_COLOURS}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('exact intensity boundaries retain three shades with no dry or missing fill',()=>{
  for(const p of [null,NaN,Infinity,-1,0])assert.equal(precipitationShade(p),null);
  for(const [p,name] of [[.01,'Light'],[.499,'Light'],[.5,'Moderate'],[2.999,'Moderate'],[3,'Heavy'],[50,'Heavy']])assert.equal(precipitationShade(p).label,name);
  assert.ok(precipitationShade(.1).tone>precipitationShade(1).tone&&precipitationShade(1).tone>precipitationShade(3).tone);
  assert.equal(PRECIP_TYPE_COLOURS.rain,'#35c76f');assert.equal(PRECIP_TYPE_COLOURS.snow,'#378bff');
});
test('overview uses one tone until zoom 8 while preserving missing and dry gaps',()=>{
  assert.equal(precipitationShade(.1,7.99).tone,precipitationShade(10,7.99).tone);
  assert.ok(precipitationShade(.1,8).tone>precipitationShade(10,8).tone);
  assert.equal(precipitationShade(0,7),null);assert.equal(precipitationShade(null,8),null);
});

test('hatching excludes even light wet samples and all unknown samples',()=>{
  assert.equal(dryTerrainDifference(0,1500,1000),500);
  for(const p of [null,NaN,.001,.1,.5,3])assert.equal(dryTerrainDifference(p,1500,1000),null);
  assert.equal(dryTerrainDifference(0,null,1000),null);
  assert.equal(dryTerrainDifference(0,1500,null),null);
  assert.equal(dryTerrainDifference(0,500,1000),-500);
});
test('zoom increases shared grid resolution and sample tiles stop at grid edges',()=>{
  assert.deepEqual([4,6,8,10].map(z=>viewportGridForZoom(z).rows),[9,13,17,19]);
  const grid=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>({lat:r,lon:c})));
  assert.deepEqual(sampleTileBounds(grid,1,1),[[.5,.5],[.5,1.5],[1.5,1.5],[1.5,.5]]);
  assert.deepEqual(sampleTileBounds(grid,0,0),[[0,0],[0,.5],[.5,.5],[.5,0]]);
  grid[1][0]=null;assert.equal(sampleTileBounds(grid,1,1),null);
});
