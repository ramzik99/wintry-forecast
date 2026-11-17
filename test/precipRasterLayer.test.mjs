import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {PRECIP_RASTER_ID,createPrecipRaster,drawPrecipRaster,terrainIllumination}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

test('weather cover follows shading and restores Windy particle and radar visibility',()=>{
 const previous=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>null})};
 try{
  const listeners=new Map(),layers=new Map([['gl-particles','visible'],['radar-coverage','none'],['raster-basemap','visible']]);
  const canvas={addEventListener(){},removeEventListener(){}};
  const map={
   on:(event,handler)=>listeners.set(event,handler),off:event=>listeners.delete(event),
   getCanvas:()=>canvas,getZoom:()=>8,
   getLayer:id=>layers.has(id),removeLayer:id=>layers.delete(id),
   getLayoutProperty:id=>layers.get(id),setLayoutProperty:(id,_prop,value)=>layers.set(id,value),
   getLayersOrder:()=>[...layers.keys()].sort((a,b)=>(a==='raster-basemap')-(b==='raster-basemap')),
   addLayer:(layer,before)=>{assert.equal(before,'raster-basemap');layers.set(layer.id,'visible')},
  };
  const raster=createPrecipRaster(map);
  raster.setActive(true);
  assert.equal(layers.get(PRECIP_RASTER_ID),'visible');
  assert.equal(layers.get('gl-particles'),'none');
  layers.delete(PRECIP_RASTER_ID);
  listeners.get('styledata')();
  assert.equal(layers.get(PRECIP_RASTER_ID),'visible');
  raster.setActive(false);
  assert.equal(layers.has(PRECIP_RASTER_ID),false);
  assert.equal(layers.get('gl-particles'),'visible');
  assert.equal(layers.get('radar-coverage'),'none');
  assert.equal(listeners.size,0);
 }finally{globalThis.document=previous}
});

test('neutral base covers the viewport immediately and shared tile edges stay aligned',()=>{
 const calls=[],ctx={
  canvas:{width:15,height:10},
  fillRect:(...args)=>calls.push(args),
  drawImage:(...args)=>calls.push([ctx.globalCompositeOperation,...args]),
  globalCompositeOperation:'source-over',
 };
 const bounds=(west,east)=>({nw:{lat:0,lon:west},se:{lat:10,lon:east}});
 const project=([lng,lat])=>({x:lng,y:lat});
 drawPrecipRaster(ctx,[
  {...bounds(0,7.8),terrain:'relief',phase:'wet'},
  {...bounds(7.8,14.2),terrain:'dry relief',phase:null},
 ],project);
 assert.deepEqual(calls,[
  [0,0,15,10],['multiply','relief',0,0,8,10],['source-over','wet',0,0,8,10],
  ['multiply','dry relief',8,0,6,10],
 ]);
 assert.equal(ctx.imageSmoothingEnabled,false);
});

test('elevation relief stays bounded and neutral for missing neighbours',()=>{
 assert.equal(terrainIllumination(0,0,0,0,30),235);
 assert.equal(terrainIllumination(NaN,0,0,0,30),235);
 for(const slope of [-10000,-100,0,100,10000]){const v=terrainIllumination(0,slope,0,-slope,30);assert.ok(v>=100&&v<=255)}
});
