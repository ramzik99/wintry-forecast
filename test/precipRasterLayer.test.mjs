import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipRasterLayer}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('precipitation is opaque below geographic map and releases native resources',()=>{
 const sources=new Map(),layers=new Map();let bucket;
 const gl={addSource:(id,s)=>sources.set(id,s),addLayerToBucket:(s,b)=>{layers.set(s.id,s);bucket=b},getLayer:id=>layers.get(id),getSource:id=>sources.get(id),removeLayer:id=>layers.delete(id),removeSource:id=>sources.delete(id)};
 const layer=precipRasterLayer({Layer:class{}},'data:image/png,test',{lat:48,lon:12},{lat:47,lon:13},400,'precip');
 layer.onAdd({maplibreMap:gl});assert.equal(bucket,399);assert.equal([...layers.values()][0].paint['raster-opacity'],1);assert.deepEqual([...sources.values()][0].coordinates,[[12,48],[13,48],[13,47],[12,47]]);
 layer.onRemove({});assert.equal(layers.size,0);assert.equal(sources.size,0);
});
