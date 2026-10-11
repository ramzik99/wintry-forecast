import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/thunderstorms.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {hasForecastLightning,stormSpacing,stormSamplePoint}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('raw lightning threshold excludes missing, invalid, negative and weak signals',()=>{
  for(const v of [null,undefined,'1',NaN,Infinity,-1,0,.0249])assert.equal(hasForecastLightning(v),false);
  for(const v of [.025,.1,2])assert.equal(hasForecastLightning(v),true);
});
test('lightning display spacing adapts continuously without changing raw forecast data',()=>{
  assert.ok(stormSpacing(6,32)>stormSpacing(8,32));
  for(const z of [4,8,12,17])assert.equal(stormSpacing(z+1,32),stormSpacing(z,32)/2);
});

const gridJs=ts.transpileModule(readFileSync(new URL('../src/shadingGrid.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {metricGrid}=await import('data:text/javascript;base64,'+Buffer.from(gridJs).toString('base64'));
test('high zoom lightning samples remain inside a viewport smaller than a 9 km cell',()=>{

  for(const [lat,lon] of [[31.7,36.2],[37.95,23.71],[-33.8,151.2],[10,181]]){
    for(const half of [.02,.001,.00001]){
      const b={south:lat-half,north:lat+half,west:lon-half,east:lon+half};
      const cells=metricGrid(b,9000,80).points;
      assert.ok(cells.length>0&&cells.length<=80);
      for(const cell of cells){

        const p=stormSamplePoint(cell.bounds);
        assert.ok(p.lat>=b.south&&p.lat<=b.north&&p.lon>=b.west&&p.lon<=b.east);
      }
    }
  }

});
