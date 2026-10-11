import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/thunderstorms.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {hasForecastLightning,stormSpacing}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
test('raw lightning threshold excludes missing, invalid, negative and weak signals',()=>{
  for(const v of [null,undefined,'1',NaN,Infinity,-1,0,.0249])assert.equal(hasForecastLightning(v),false);
  for(const v of [.025,.1,2])assert.equal(hasForecastLightning(v),true);
});
test('lightning spacing stays decluttered and never refines below model scale',()=>{
  assert.ok(stormSpacing(6,32)>stormSpacing(8,32));
  assert.equal(stormSpacing(14,32),9000);
});
