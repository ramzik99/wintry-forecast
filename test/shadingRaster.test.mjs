import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const compile=name=>{
 let js=ts.transpileModule(readFileSync(new URL('../src/'+name+'.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 for(const m of [...js.matchAll(/from ['"](\.\/[^'"]+)['"]/g)])js=js.replace(m[0],'from '+JSON.stringify(compile(m[1].slice(2))));
 return 'data:text/javascript;base64,'+Buffer.from(js).toString('base64');
};
const rasterURL=compile('shadingRaster');
const {weatherInterpolator,weightedScalar,wetCoverage,blendedProfile,tileLocation,tilePosition,visibleRasterTiles,viewportRasterZoom,RASTER_SAMPLES,continuousProfileBlender}=await import(rasterURL);
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

test('mountain/valley profiles stay continuous across weather-cell edges',()=>{
 const p=(level,heightM,t)=>({level,heightM,tempC:t,dewpointC:t,wetBulbC:t,pressureHpa:Number(level.slice(0,-1))});
 const valley=[p('1000h',0,6),p('950h',500,4),p('900h',1000,2),p('850h',1500,-1),p('700h',3000,-10),p('500h',5500,-25)];
 const mountain=valley.slice(3);
 const grid=[[{lat:0,lon:0,profile:mountain},{lat:0,lon:1,profile:valley},{lat:0,lon:2,profile:valley}],
             [{lat:1,lon:0,profile:mountain},{lat:1,lon:1,profile:valley},{lat:1,lon:2,profile:valley}]];
 const locate=weatherInterpolator(grid),blend=continuousProfileBlender();
 const values=lon=>locate(.5,lon).map(v=>({value:v.value.profile,weight:v.weight}));
 const left=values(1-1e-7),right=values(1+1e-7);
 const oldA=blendedProfile(left,t=>t),oldB=blendedProfile(right,t=>t);
 assert.ok(Math.abs(oldA[0].wetBulbC-oldB[0].wetBulbC)>5,'Fixture reproduces the released rectangular jump');
 const a=blend(left),b=blend(right);
 assert.ok(Math.abs(a[0].wetBulbC-b[0].wetBulbC)<.00001);
 assert.ok(Math.abs(a[0].heightM-b[0].heightM)<.001);
 assert.equal(blend([{value:[],weight:1}]).length,0,'Unknown profiles remain blank');
 const atMountain=blend([{value:mountain,weight:1}]);
 assert.equal(atMountain[0].heightM,1500,'Endpoint repetition never creates air beneath model ground');
 assert.equal(atMountain[0].pressureHpa,850);
 for(let i=1;i<a.length;i++)assert.ok(a[i].heightM>=a[i-1].heightM);
});
test('direct DEM raster matches geographic sampling across DEM tile seams',()=>{
 const dem=new TerrainTiles(),z=3;
 for(let ty=0;ty<4;ty++)for(let tx=0;tx<4;tx++){
  const pixels=new Float32Array(256*256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++)pixels[y*256+x]=tx*256+x+(ty*256+y)/100;
  dem.cache.set(z+'/'+tx+'/'+ty,{pixels,width:256,height:256});
 }
 const size=32,padding=1,side=size+2,tile={x:7,y:10,z:5},pixels=dem.raster(tile.x,tile.y,tile.z,size,padding);
 for(let y=0;y<side;y+=3)for(let x=0;x<side;x+=3){
  const p=tileLocation(tile.x+(x-padding+.5)/size,tile.y+(y-padding+.5)/size,tile.z);
  assert.ok(Math.abs(pixels[y*side+x]-dem.sample(p.lat,p.lon,tile.z))<.001);
 }
 dem.destroy();
});

test('borrowed map profiles preserve numeric results while reusing storage and extra levels',()=>{
 const p=(level,heightM,t)=>({level,heightM,tempC:t,dewpointC:t-1,wetBulbC:t-.5,pressureHpa:Number(level.slice(0,-1))});
 const profile=[p('975h',200,4),p('850h',1500,-2),p('100h',16000,-55)];
 const levels=['1000h','975h','850h','700h','100h'];
 const normal=continuousProfileBlender({levels}),fast=continuousProfileBlender({levels,reuseResult:true});
 const values=[{value:profile,weight:1}];
 const a=fast(values);assert.deepEqual(a,normal(values));
 const copy=structuredClone(a);
 const b=fast(values);assert.equal(a,b);assert.deepEqual(b,copy);
 assert.ok(b.some(p=>p.level==='975h'));assert.ok(b.some(p=>p.level==='100h'));
});
