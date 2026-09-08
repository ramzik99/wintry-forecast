import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../src/placeAutocomplete.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {photonPlaces,autocompletePlaces} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const feature = (coordinates,properties={name:'Reading',city:'Reading',state:'England',country:'United Kingdom'}) => ({geometry:{type:'Point',coordinates},properties});
test('Photon results retain coordinate order, deduplicate and reject invalid places',()=>{
  assert.deepEqual(photonPlaces({features:[feature([-1,51]),feature([-1,51]),feature([null,51]),feature([1,100]),feature([1,2],{})]}),[{lat:51,lon:-1,primary:'Reading',secondary:'England, United Kingdom'}]);
  assert.throws(()=>photonPlaces({}),/Invalid/);
});
test('autocomplete caches repeated queries, ignores short text and does not cache failures',async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return {ok:true,json:async()=>({features:[feature([6,45])]})};});
  const signal=new AbortController().signal;
  assert.deepEqual(await autocompletePlaces('ab',signal),[]);assert.equal(calls,0);
  const result=await autocompletePlaces('Reading',signal);
  assert.deepEqual(await autocompletePlaces(' reading ',signal),result);assert.equal(calls,1);
  const cancelled=new AbortController();cancelled.abort();
  await assert.rejects(autocompletePlaces('Reading',cancelled.signal));assert.equal(calls,1);
  globalThis.fetch.mock.mockImplementation(async()=>{calls++;return {ok:false,status:503}});
  await assert.rejects(autocompletePlaces('Missing',signal));
  await assert.rejects(autocompletePlaces('Missing',signal));assert.equal(calls,3);
});
