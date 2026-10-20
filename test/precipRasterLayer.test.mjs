import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/precipRasterLayer.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {precipRasterLayer,terrainMapTemplate,PRECIP_RASTER_OPACITY,PRECIP_RASTER_BLEND,precipitationPane}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('categorical shading uses geographic image bounds and decodes before display without changing WebGL state',async()=>{
 const previousImage=globalThis.Image;globalThis.Image=class{decode(){return Promise.resolve()}};
 let args;const expected={};
 const L={imageOverlay:(...values)=>{args=values;return expected}};
 assert.equal(precipRasterLayer(L,'data:image/png,test',{lat:48,lon:12},{lat:47,lon:13},'precip'),expected);
 assert.equal(args[0].src,'data:image/png,test');assert.deepEqual(args[1],[[47,12],[48,13]]);
 assert.equal(await expected.ready,true);globalThis.Image=previousImage;
 assert.equal(args[2].pane,'precip');assert.equal(args[2].interactive,false);
 assert.equal(args[2].opacity,PRECIP_RASTER_OPACITY);assert.equal(PRECIP_RASTER_OPACITY,1);
});
test('video uses the selected geographic template at every zoom',()=>{
 const tiles={sznmap:'outdoor',winter:'winter',graymap:'transparent labels'};
 assert.equal(terrainMapTemplate(tiles,'winter'),'winter');assert.equal(terrainMapTemplate(tiles,'unknown'),'outdoor');
 assert.match(terrainMapTemplate({},'unknown'),/outdoor/);
});

test('full-opacity colour pane retains the underlying terrain luminance',()=>{
 const pane={style:{}};let created=0;
 const map={getPane:()=>created?pane:null,createPane:()=>{created++;return pane}};
 assert.equal(precipitationPane(map,'precip'),pane);assert.equal(precipitationPane(map,'precip'),pane);
 assert.equal(created,1);assert.equal(pane.style.mixBlendMode,PRECIP_RASTER_BLEND);
 assert.equal(PRECIP_RASTER_BLEND,'color');assert.equal(pane.style.zIndex,'390');assert.equal(pane.style.pointerEvents,'none');
});
