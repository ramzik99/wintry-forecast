import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync(new URL('../src/automaticRefresh.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {automaticRefreshDue,AUTO_REFRESH_MS,RETRY_REFRESH_MS}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const state={enabled:true,busy:false,hidden:false,online:true,failed:false,lastAttempt:1000};
test('automatic refresh respects cadence and retries initial failures sooner',()=>{
 assert.equal(automaticRefreshDue(state,1000+AUTO_REFRESH_MS-1),false);
 assert.equal(automaticRefreshDue(state,1000+AUTO_REFRESH_MS),true);
 assert.equal(automaticRefreshDue({...state,failed:true},1000+RETRY_REFRESH_MS),true);
 assert.equal(automaticRefreshDue({...state,failed:true},1000+RETRY_REFRESH_MS-1),false);
});
test('automatic refresh pauses while hidden, offline, disabled or busy and resumes when overdue',()=>{
 for(const change of [{enabled:false},{busy:true},{hidden:true},{online:false}])assert.equal(automaticRefreshDue({...state,...change},2*AUTO_REFRESH_MS),false);
 assert.equal(automaticRefreshDue(state,2*AUTO_REFRESH_MS),true);
 assert.equal(automaticRefreshDue(state,999),true);
});
