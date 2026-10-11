import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/shadingGrid.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {metricGrid,terrainSpacing,nearestWeatherSample}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const local={south:31.9,north:32.3,west:35.6,east:36};
test('local weather stays nominal 9 km while terrain halves beyond zoom 8',()=>{
  assert.equal(metricGrid(local,9000,225,true).metres,9000);
  assert.equal(terrainSpacing(8,32),9000);
  assert.equal(terrainSpacing(9,32),4500);
  assert.equal(terrainSpacing(10,32),2250);
  const weather=metricGrid(local,9000,225,true);
  const coarse=metricGrid(local,terrainSpacing(8,32),512),fine=metricGrid(local,terrainSpacing(10,32),512);
  assert.ok(fine.points.length>coarse.points.length);
  assert.deepEqual(metricGrid(local,9000,225,true),weather);
});
test('overview and detailed grids keep bounded work even at high latitudes',()=>{
  for(const bounds of [local,{south:-80,north:80,west:-180,east:180},{south:78,north:82,west:-20,east:40}]){
    assert.ok(metricGrid(bounds,9000,225,true).points.length<=225);
    assert.ok(metricGrid(bounds,100,512).points.length<=512);
  }
});
test('small pans reuse globally anchored weather nodes',()=>{
  const a=metricGrid(local,9000,225,true),b=metricGrid({...local,west:35.61,east:36.01},9000,225,true);
  const keys=new Set(a.points.map(p=>`${p.lat},${p.lon}`));
  assert.ok(b.points.filter(p=>keys.has(`${p.lat},${p.lon}`)).length/b.points.length>.7);
});
test('missing weather cells and out-of-coverage terrain stay blank',()=>{
  const shape=metricGrid(local,9000,225,true);
  const grid=Array.from({length:shape.rows},()=>Array(shape.cols).fill(null));
  for(const p of shape.points)grid[p.r][p.c]=p;
  const p=grid[1][1];assert.equal(nearestWeatherSample(grid,p.lat,p.lon),p);
  grid[1][1]=null;assert.equal(nearestWeatherSample(grid,p.lat,p.lon),null);
  assert.equal(nearestWeatherSample(grid,0,0),null);
});
