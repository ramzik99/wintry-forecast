import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../src/preparedMapCache.ts',import.meta.url),'utf8'),
  {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {PreparedMapCache}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

function fixture(t){
  const previous=globalThis.indexedDB,opens=[];
  const state={closed:0,aborted:0,tx:null,request:null,throwPut:false};
  const db={close(){state.closed++;},transaction(){
    const tx={error:null,abort(){state.aborted++;tx.onabort?.();},objectStore(){return{
      get(){return state.request={result:{value:{dry:true}}};},
      clear(){return state.request={result:undefined};},
      put(){if(state.throwPut)throw new DOMException('Quota exceeded','QuotaExceededError');return state.request={result:'frame'};},
    };}};state.tx=tx;return tx;
  }};
  globalThis.indexedDB={open(){const request={result:db};opens.push(request);return request;}};
  t.mock.timers.enable({apis:['setTimeout']});
  t.after(()=>{if(previous===undefined)delete globalThis.indexedDB;else globalThis.indexedDB=previous;});
  return {state,opens,cache:new PreparedMapCache()};
}

test('a stalled local database open times out and closes a late connection',async t=>{
  const {state,opens,cache}=fixture(t),pending=cache.get('frame');
  const rejected=assert.rejects(pending,/storage timed out/);
  t.mock.timers.tick(10000);await rejected;
  opens[0].onsuccess();assert.equal(state.closed,1);cache.close();
});

test('a stalled local storage transaction rejects and aborts rather than freezing preparation',async t=>{
  const {state,opens,cache}=fixture(t),pending=cache.get('frame');
  const rejected=assert.rejects(pending,/storage timed out/);
  opens[0].onsuccess();await Promise.resolve();
  t.mock.timers.tick(10000);await rejected;assert.equal(state.aborted,1);cache.close();
});

test('completed frame reads retain dry values and release their deadline',async t=>{
  const {state,opens,cache}=fixture(t),pending=cache.get('frame');
  opens[0].onsuccess();await Promise.resolve();state.tx.oncomplete();
  assert.deepEqual(await pending,{dry:true});t.mock.timers.tick(20000);assert.equal(state.aborted,0);cache.close();
});

test('a synchronous quota failure is surfaced and clears the transaction deadline',async t=>{
  const {state,opens,cache}=fixture(t);state.throwPut=true;
  const pending=cache.put('frame',{data:1}),rejected=assert.rejects(pending,{name:'QuotaExceededError'});
  opens[0].onsuccess();await rejected;assert.equal(state.aborted,1);
  t.mock.timers.tick(20000);assert.equal(state.aborted,1);cache.close();
});

test('a blocked database fails promptly and can be retried after closing the cache',async t=>{
  const {state,opens,cache}=fixture(t),pending=cache.get('frame');
  const rejected=assert.rejects(pending,/storage is busy/);opens[0].onblocked();await rejected;
  cache.close();const retry=cache.get('frame');assert.equal(opens.length,2);
  opens[1].onsuccess();await Promise.resolve();state.tx.oncomplete();assert.deepEqual(await retry,{dry:true});
  cache.close();t.mock.timers.tick(20000);assert.equal(state.aborted,0);
});
