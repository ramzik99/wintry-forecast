import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipRasterLayer,terrainBackgroundLayer,terrainMapTemplate,PRECIP_RASTER_OPACITY}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
function nativeHost(){
 const sources=new Map(),layers=new Map(),buckets=new Map();
 // Windy's actual API puts ordered insertion on the host, not on MapLibre.
 const gl={addSource:(id,s)=>sources.set(id,s),getLayer:id=>layers.get(id),getSource:id=>sources.get(id),removeLayer:id=>layers.delete(id),removeSource:id=>sources.delete(id)};
 const host={maplibreMap:gl,addMapLibreOrderedLayerToBucket:(s,b)=>{layers.set(s.id,s);buckets.set(s.id,b)},removeMapLibreOrderedLayer:id=>{layers.delete(id);buckets.delete(id)}};
 return{host,sources,layers,buckets};
}
test('real Windy host API uses native raster above both geographic map layers and releases resources',()=>{
 const {host,sources,layers,buckets}=nativeHost();
 const layer=precipRasterLayer({Layer:class{}},'data:image/png,test',{lat:48,lon:12},{lat:47,lon:13},400,'precip');
 layer.onAdd(host);
 assert.equal([...buckets.values()][0],402);assert.equal([...layers.values()][0].paint['raster-opacity'],PRECIP_RASTER_OPACITY);
 assert.ok(PRECIP_RASTER_OPACITY>0&&PRECIP_RASTER_OPACITY<1);
 assert.deepEqual([...sources.values()][0].coordinates,[[12,48],[13,48],[13,47],[12,47]]);
 layer.onRemove(host);assert.equal(layers.size,0);assert.equal(sources.size,0);assert.equal(buckets.size,0);
});
test('terrain background is a single continuous tiled source below precipitation, independent of wet masks',()=>{
 const {host,sources,layers,buckets}=nativeHost();
 const layer=terrainBackgroundLayer({Layer:class{}},'https://tiles.test/{z}/{x}/{y}.png',400,'background');layer.onAdd(host);
 assert.equal(sources.size,1);const source=[...sources.values()][0];assert.equal(source.type,'raster');assert.equal(source.tileSize,256);assert.equal(source.maxzoom,16);
 assert.equal([...buckets.values()][0],399);assert.equal([...layers.values()][0].paint['raster-opacity'],1);
 layer.onRemove(host);assert.equal(layers.size,0);assert.equal(sources.size,0);
});
test('screen and video share the selected geographic template at every zoom',()=>{
 const tiles={sznmap:'outdoor',winter:'winter',graymap:'transparent labels'};
 assert.equal(terrainMapTemplate(tiles,'winter'),'winter');assert.equal(terrainMapTemplate(tiles,'unknown'),'outdoor');
 assert.match(terrainMapTemplate({},'unknown'),/outdoor/);
});
