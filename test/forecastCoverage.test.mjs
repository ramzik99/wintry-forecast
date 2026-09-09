import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
let s=readFileSync(new URL('../src/forecastCoverage.ts',import.meta.url),'utf8').replace("import { PRECIP_THRESHOLD_MM_3H } from './precip';",'const PRECIP_THRESHOLD_MM_3H=0.1;');
s=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {forecastCoverage}=await import(`data:text/javascript;base64,${Buffer.from(s).toString('base64')}`);
test('partial dry coverage is usable without extending a snow total across missing intervals',()=>{
 const c=forecastCoverage([0,0,null,1],[null,null,null,{}],[0,3,6,9].map(h=>h*3600000));
 assert.equal(c.prefix,2);assert.equal(c.precipCount,3);assert.equal(c.complete,false);assert.equal(c.note,'Forecast has gaps');
 assert.equal(forecastCoverage([0,null],[null,null],[0,10800000]).note,'');
});
test('unknown phase and time gaps stop cumulative coverage while complete dry data needs no phase',()=>{
 assert.equal(forecastCoverage([0,1],[null,null],[0,10800000]).prefix,1);
 assert.equal(forecastCoverage([0,0],[null,null],[0,21600000]).prefix,1);
 assert.equal(forecastCoverage([0,0],[null,null],[0,10800000]).complete,true);
 assert.equal(forecastCoverage([null],[null],[0]).note,'Forecast unavailable');
});
