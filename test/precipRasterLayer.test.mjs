import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipRasterLayer,precipitationPane,terrainIllumination}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('raster uses geographic image overlays at full opacity and waits for decoding',async()=>{
 const previous=globalThis.Image;let resolveDecode,call;
 globalThis.Image=class{decode(){return new Promise(resolve=>resolveDecode=resolve)}};
 try{
  const overlay={};const L={imageOverlay:(image,bounds,options)=>{call={image,bounds,options};return overlay}};
  const layer=precipRasterLayer(L,'data:image/png,test',{lat:48,lon:12},{lat:47,lon:13},'precip');
  assert.equal(layer,overlay);assert.equal(call.image.src,'data:image/png,test');
  assert.deepEqual(call.bounds,[[47,12],[48,13]]);assert.equal(call.options.opacity,1);
  assert.equal(call.options.interactive,false);assert.equal(call.options.pane,'precip');
  let ready=false;layer.ready.then(()=>ready=true);await Promise.resolve();assert.equal(ready,false);
  resolveDecode();assert.equal(await layer.ready,true);
 }finally{globalThis.Image=previous}
});
test('failed image decoding is reported before a frame replaces the visible map',async()=>{
 const previous=globalThis.Image;globalThis.Image=class{decode(){return Promise.reject(new Error('decode'))}};
 try{const layer=precipRasterLayer({imageOverlay:()=>({})},'bad',{lat:1,lon:0},{lat:0,lon:1},'precip');assert.equal(await layer.ready,false)}
 finally{globalThis.Image=previous}
});
test('shading pane remains below Leaflet contours and ignores pointer input',()=>{
 const pane={style:{}};assert.equal(precipitationPane({getPane:()=>pane},'precip'),pane);
 assert.equal(pane.style.zIndex,'390');assert.equal(pane.style.pointerEvents,'none');
});
test('elevation relief stays bounded and neutral for missing neighbours',()=>{
 assert.equal(terrainIllumination(0,0,0,0,30),235);
 assert.equal(terrainIllumination(NaN,0,0,0,30),235);
 for(const slope of [-10000,-100,0,100,10000]){const v=terrainIllumination(0,slope,0,-slope,30);assert.ok(v>=100&&v<=255)}
});
