import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/precipShading.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipitationShade,dryTerrainDifference,viewportGridForZoom,sampleTileBounds,PRECIP_TYPE_COLOURS,writePrecipitationPixel}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('one type colour is retained at every positive amount with no dry or missing fill',()=>{
  for(const p of [null,NaN,Infinity,-1,0])assert.equal(precipitationShade(p),null);
  for(const p of [.01,.499,.5,2.999,3,50])assert.equal(precipitationShade(p).tone,0);
  assert.equal(precipitationShade(.1),precipitationShade(50));
  assert.equal(PRECIP_TYPE_COLOURS.rain,'#0099b6');assert.equal(PRECIP_TYPE_COLOURS.snow,'#b2b2b2');
});
test('the same type tone applies at every zoom while preserving missing and dry gaps',()=>{
  assert.equal(precipitationShade(.1,7.99).tone,precipitationShade(10,7.99).tone);
  assert.equal(precipitationShade(.1,8).tone,precipitationShade(10,8).tone);
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

test('categorical shading uses exact legend colours with no decorative brightness or blended types',()=>{
 for(const [key,hex] of Object.entries(PRECIP_TYPE_COLOURS)){
  const data=new Uint8ClampedArray(8);
  assert.equal(writePrecipitationPixel(data,4,key),true);
  assert.deepEqual([...data.slice(4)],[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255]);
  assert.deepEqual([...data.slice(0,4)],[0,0,0,0]);
 }
 const unknown=new Uint8ClampedArray(4);assert.equal(writePrecipitationPixel(unknown,0,'unknown'),false);
 assert.deepEqual([...unknown],[0,0,0,0]);
});
