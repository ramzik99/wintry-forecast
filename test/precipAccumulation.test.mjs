import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function url(name){const source=readFileSync(new URL(`../src/${name}.ts`,import.meta.url),'utf8').replace(/(['"])\.\/([A-Za-z]+)\1/g,(_,q,n)=>JSON.stringify(url(n)));return 'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');}
const {precipitationAccumulation:total}=await import(url('precipAccumulation'));
const {formatPrecip,formatPrecipTotal}=await import(url('displayUnits'));
const h=3600000,axis=step=>Array.from({length:Math.floor(144/step)+1},(_,i)=>i*step*h);
test('hourly and three-hourly representations integrate the same liquid amount',()=>{for(const step of [1,3]){const t=axis(step);assert.equal(total(t,t.map(()=>6),0,24*h).mm,48);assert.equal(total(t,t.map(()=>6),1.5*h,25.5*h).mm,48);}});
test('missing, negative and non-finite precipitation never become dry totals',()=>{for(const missing of [null,-1,NaN]){const t=axis(3),v=t.map(()=>6);v[3]=missing;assert.deepEqual(total(t,v,0,24*h),{mm:null,complete:false});}});
test('shorter source intervals cannot be stretched across unsampled periods',()=>{const t=axis(3);assert.equal(total(t,t.map(()=>6),0,24*h,t.map(()=>1)).complete,false);assert.equal(total(axis(1),axis(1).map(()=>6),0,24*h,axis(1).map(()=>3)).mm,48);});
test('gaps and malformed axes invalidate requested totals',()=>{for(const t of [[0,6*h],[0,0,3*h],[3*h,0],[]])assert.equal(total(t,t.map(()=>0),0,6*h).complete,false);});
test('dry forecasts and the horizon boundary retain honest coverage',()=>{const t=axis(3);assert.deepEqual(total(t,t.map(()=>0),0,24*h),{mm:0,complete:true});assert.equal(total(t,t.map(()=>6),120*h,144*h).mm,48);assert.equal(total(t,t.map(()=>6),121*h,145*h).complete,false);});
test('rate and accumulation formatting use distinct units',()=>{assert.equal(formatPrecip(6,'metric'),'2 mm/h');assert.equal(formatPrecip(7.62,'imperial'),'0.1 in/h');assert.equal(formatPrecipTotal(12,'metric'),'12 mm');assert.equal(formatPrecipTotal(25.4,'imperial'),'1 in');assert.equal(formatPrecipTotal(0,'metric'),'0 mm');assert.equal(formatPrecipTotal(null,'metric'),'Unavailable');});
