import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../src/boundedRequest.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {boundedRequest}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

test('a non-responsive provider cannot leave the caller waiting indefinitely',async()=>{
  let signal;
  await assert.rejects(boundedRequest(s=>{signal=s;return new Promise(()=>{})},15),{name:'AbortError'});
  assert.equal(signal.aborted,true);
});
test('caller cancellation discards a late response from a provider ignoring abort',async()=>{
  const parent=new AbortController();let finish,signal;
  const pending=boundedRequest(s=>{signal=s;return new Promise(resolve=>finish=resolve)},1000,parent.signal);
  parent.abort();await assert.rejects(pending,{name:'AbortError'});
  finish({precip:12});assert.equal(signal.aborted,true);
});
test('completed requests release their timeout and parent listener',async()=>{
  const parent=new AbortController();let signal;
  assert.deepEqual(await boundedRequest(async s=>{signal=s;return {precip:0}},10,parent.signal),{precip:0});
  parent.abort();await new Promise(r=>setTimeout(r,20));assert.equal(signal.aborted,false);
});
test('an already cancelled caller never starts the provider request',async()=>{
  const parent=new AbortController();parent.abort();let calls=0;
  await assert.rejects(boundedRequest(async()=>{calls++;return {}},100,parent.signal),{name:'AbortError'});
  assert.equal(calls,0);
});
