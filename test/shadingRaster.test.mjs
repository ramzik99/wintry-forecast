import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=name=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
const rasterURL=compile('shadingRaster');
const {weatherInterpolator,weightedScalar,wetCoverage,blendedProfile,tileLocation,tilePosition,visibleRasterTiles,viewportRasterZoom,RASTER_SAMPLES,rasterSampleLocation}=await import(rasterURL);
const {supportedPrecipitationType}=await import(compile('precipType'));
const terrainJS=ts.transpileModule(readFileSync(new URL('../src/terrainTiles.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("'./shadingRaster'",JSON.stringify(rasterURL));
const {decodeTerrarium,terrainTileZoom,TerrainTiles}=await import('data:text/javascript;base64,'+Buffer.from(terrainJS).toString('base64'));

test('viewport geometry keeps diagnosis pixels fine despite wrapper zoom and fractional zoom',()=>{
  for(const physical of [3,5.25,9.25,12.5,17]){
    const width=1536,span=width*360/(256*2**physical),z=viewportRasterZoom(width,10,10+span,2);
    const tilePixels=256*2**(physical-z);
    assert.ok(tilePixels/RASTER_SAMPLES<=4.001);assert.ok(z>=physical-1e-8);
  }
  assert.equal(viewportRasterZoom(0,10,10,8),8);
});

test('weather amounts are continuous across sample ownership boundaries',()=>{
  const grid=[[{lat:0,lon:0,v:0},{lat:0,lon:1,v:4}],[{lat:1,lon:0,v:0},{lat:1,lon:1,v:4}]],sample=weatherInterpolator(grid);
  for(const lon of [.1,.499,.5,.501,.9])assert.ok(Math.abs(weightedScalar(sample(.5,lon),p=>p.v)-4*lon)<1e-9);
  assert.equal(weightedScalar(sample(0,0),p=>p.v),0);
  grid[1][1]=null;assert.equal(sample(.5,.5),null);assert.equal(sample(-1,.5),null);
  assert.equal(weightedScalar([{value:{v:NaN},weight:1}],p=>p.v),null);
});
test('wet coverage fades smoothly into dry cells and preserves unknown coverage',()=>{
  const sample=weatherInterpolator([[{lat:0,lon:0,v:0},{lat:0,lon:1,v:1}],[{lat:1,lon:0,v:0},{lat:1,lon:1,v:1}]]);
  for(const lon of [0,.1,.5,.9,1])assert.ok(Math.abs(wetCoverage(sample(.5,lon),p=>p.v)-lon)<1e-9);
  assert.equal(wetCoverage([{value:null,weight:1}],p=>p),null);
});

test('interpolate T/Td before Tw and qualify pressure levels with partial horizontal support',()=>{
  const p=(t,td,h,level='850h')=>({level,pressureHpa:850,heightM:h,tempC:t,dewpointC:td,wetBulbC:-99});
  const result=blendedProfile([{value:[p(2,1,1500),p(1,0,1000,'900h')],weight:.25},{value:[p(6,3,1700)],weight:.75}],(t,td)=>t+td);
  assert.equal(result.length,2);
  const shared=result.find(p=>p.level==='850h'),partial=result.find(p=>p.level==='900h');
  assert.equal(shared.tempC,5);assert.equal(shared.dewpointC,2.5);assert.equal(shared.heightM,1650);assert.equal(shared.wetBulbC,7.5);assert.equal(shared.spatialSupport,1);
  assert.equal(partial.tempC,1);assert.equal(partial.spatialSupport,.25);
});

test('a mountain corner cannot erase the warm valley column and turn an entire wet cell into snow',()=>{
  const p=(level,z,t)=>({level,pressureHpa:Number(level.slice(0,-1)),heightM:z,tempC:t,dewpointC:t,wetBulbC:t});
  const upper=[p('400h',7000,-20),p('300h',9000,-35)];
  const valley=[p('850h',1500,10),p('700h',3000,3),p('500h',5500,-10),...upper];
  const corners=[{value:valley,weight:.75},{value:upper,weight:.25}];
  const mixed=blendedProfile(corners,t=>t),rain=supportedPrecipitationType(mixed,2000);
  assert.equal(rain.key,'rain');assert.equal(rain.confidence,'low');
  assert.equal(supportedPrecipitationType(mixed,8000).key,'snow');
  assert.deepEqual(blendedProfile([...corners].reverse(),t=>t),mixed);
  assert.deepEqual(blendedProfile([{value:valley,weight:.75},{value:[],weight:.25}],t=>t),[]);
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

test('adjacent shading tiles use one regular global pixel lattice at every zoom',()=>{
 for(const z of [0,5,8,14,19]){
  const left=rasterSampleLocation(2,3,z,RASTER_SAMPLES-1,50),right=rasterSampleLocation(3,3,z,0,50);
  const a=tilePosition(left.lat,left.lon,z),b=tilePosition(right.lat,right.lon,z);
  assert.ok(Math.abs((b.x-a.x)-1/RASTER_SAMPLES)<1e-8);
  assert.ok(Math.abs(b.y-a.y)<1e-8);
  const upper=rasterSampleLocation(2,3,z,50,RASTER_SAMPLES-1),lower=rasterSampleLocation(2,4,z,50,0);
  const c=tilePosition(upper.lat,upper.lon,z),d=tilePosition(lower.lat,lower.lon,z);
  // Polar clamping is separate from tile sampling; compare rows within the valid Mercator domain.
  if(upper.lat>-85&&upper.lat<85&&lower.lat>-85&&lower.lat<85)assert.ok(Math.abs((d.y-c.y)-1/RASTER_SAMPLES)<1e-8);
 }
});
