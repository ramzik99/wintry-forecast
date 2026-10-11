import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=name=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
const rasterURL=compile('shadingRaster');
const {weatherInterpolator,weightedScalar,blendedProfile,tileLocation,tilePosition,visibleRasterTiles}=await import(rasterURL);
const terrainJS=ts.transpileModule(readFileSync(new URL('../src/terrainTiles.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("'./shadingRaster'",JSON.stringify(rasterURL));
const {decodeTerrarium,terrainTileZoom,TerrainTiles}=await import('data:text/javascript;base64,'+Buffer.from(terrainJS).toString('base64'));

test('weather amounts are continuous across sample ownership boundaries',()=>{
  const grid=[[{lat:0,lon:0,v:0},{lat:0,lon:1,v:4}],[{lat:1,lon:0,v:0},{lat:1,lon:1,v:4}]],sample=weatherInterpolator(grid);
  for(const lon of [.1,.499,.5,.501,.9])assert.ok(Math.abs(weightedScalar(sample(.5,lon),p=>p.v)-4*lon)<1e-9);
  assert.equal(weightedScalar(sample(0,0),p=>p.v),0);
  grid[1][1]=null;assert.equal(sample(.5,.5),null);assert.equal(sample(-1,.5),null);
  assert.equal(weightedScalar([{value:{v:NaN},weight:1}],p=>p.v),null);
});
test('interpolate T/Td before Tw and retain only pressure levels shared by all corners',()=>{
  const p=(t,td,h,level='850h')=>({level,pressureHpa:850,heightM:h,tempC:t,dewpointC:td,wetBulbC:-99});
  const result=blendedProfile([{value:[p(2,1,1500),p(1,0,1000,'900h')],weight:.25},{value:[p(6,3,1700)],weight:.75}],(t,td)=>t+td);
  assert.equal(result.length,1);assert.equal(result[0].tempC,5);assert.equal(result[0].dewpointC,2.5);assert.equal(result[0].heightM,1650);assert.equal(result[0].wetBulbC,7.5);
});
test('raster tiles are globally anchored and cover the date line without an oversized viewport grid',()=>{
  for(const z of [0,4,9,17]){const p=tilePosition(32,182,z),a=tileLocation(p.x,p.y,z);assert.ok(Math.abs(a.lat-32)<1e-10);assert.ok(Math.abs(a.lon-182)<1e-10);}
  const b={south:31,north:33,west:179,east:183},a=visibleRasterTiles(b,5),c=visibleRasterTiles({...b,west:179.01,east:183.01},5);
  assert.ok(a.some(v=>v.x>=32));assert.ok(a.some(v=>c.some(w=>w.x===v.x&&w.y===v.y)));assert.ok(a.length<10);
});
test('Terrarium decode retains negative elevations and fractions, with bounded terrain zoom',()=>{
  assert.equal(decodeTerrarium(128,0,0),0);assert.equal(decodeTerrarium(127,255,128),-.5);assert.equal(decodeTerrarium(137,219,68),2523.265625);
  assert.equal(terrainTileZoom(0),0);assert.equal(terrainTileZoom(9),7);assert.equal(terrainTileZoom(22),14);
});
test('terrain tiles share pending requests, reuse cached data, and preserve zero elevations',async()=>{
  const original={fetch:globalThis.fetch,document:globalThis.document,createImageBitmap:globalThis.createImageBitmap};let requests=0,active=0,peak=0;
  globalThis.fetch=async()=>{requests++;active++;peak=Math.max(active,peak);await new Promise(r=>setTimeout(r,3));active--;return{ok:true,blob:async()=>({})}};
  globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
  const rgba=new Uint8ClampedArray(256*256*4);for(let i=0;i<rgba.length;i+=4){rgba[i]=128;rgba[i+3]=255;}
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({drawImage(){},getImageData:()=>({data:rgba})})})};
  const dem=new TerrainTiles(),b={south:31.9,north:32.1,west:35.9,east:36.1};
  try{await Promise.all([dem.ensure(b,9,()=>true,()=>{}),dem.ensure(b,9,()=>true,()=>{})]);const first=requests;assert.ok(first>0);assert.ok(peak<=4);
    assert.equal(dem.sample(32,36,9),0);await dem.ensure(b,9,()=>true,()=>{});assert.equal(requests,first);assert.equal(dem.sample(-70,0,9),null);
  }finally{dem.destroy();Object.assign(globalThis,original);}
});
