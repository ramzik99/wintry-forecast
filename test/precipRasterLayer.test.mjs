import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipRasterLayer,terrainMapTemplate,PRECIP_RASTER_OPACITY}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('categorical shading uses geographic image bounds and decodes before display without changing WebGL state',async()=>{
 const previousImage=globalThis.Image;globalThis.Image=class{decode(){return Promise.resolve()}};
 let args;const expected={};
 const L={imageOverlay:(...values)=>{args=values;return expected}};
 assert.equal(precipRasterLayer(L,'data:image/png,test',{lat:48,lon:12},{lat:47,lon:13},'precip'),expected);
 assert.equal(args[0].src,'data:image/png,test');assert.deepEqual(args[1],[[47,12],[48,13]]);
 assert.equal(await expected.ready,true);globalThis.Image=previousImage;
 assert.equal(args[2].pane,'precip');assert.equal(args[2].interactive,false);
 assert.equal(args[2].opacity,PRECIP_RASTER_OPACITY);assert.ok(PRECIP_RASTER_OPACITY>0&&PRECIP_RASTER_OPACITY<1);
});
test('screen and video share the selected geographic template at every zoom',()=>{
 const tiles={sznmap:'outdoor',winter:'winter',graymap:'transparent labels'};
 assert.equal(terrainMapTemplate(tiles,'winter'),'winter');assert.equal(terrainMapTemplate(tiles,'unknown'),'outdoor');
 assert.match(terrainMapTemplate({},'unknown'),/outdoor/);
});
