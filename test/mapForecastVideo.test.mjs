import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=ts.transpileModule(readFileSync(new URL('../src/mapForecastVideo.ts',import.meta.url),'utf8'),{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},
}).outputText.replace("'mediabunny'",JSON.stringify(import.meta.resolve('mediabunny')));
const {movieTimeline,forecastMovieTimes,videoSize,checkMp4Support,canExportMapForecast,videoImage}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('movie includes missing-interval boundaries and hourly contours without extending a short forecast',()=>{
  const hour=3600_000;
  assert.deepEqual(forecastMovieTimes([[0,hour,7*hour]]),Array.from({length:8},(_,i)=>i*hour));
  assert.ok(forecastMovieTimes([[0,.5*hour,4*hour]]).includes(3.5*hour));
  assert.equal(forecastMovieTimes([[0,200*hour]]).at(-1),144*hour);
  assert.deepEqual(forecastMovieTimes([[],[2,1],[NaN]]),[]);
});

test('video includes a fractional source-coverage boundary without extending the forecast',()=>{
  const hour=3600_000,times=forecastMovieTimes([[0,3*hour,6*hour]],[[.5*hour,4*hour,NaN,12*hour]]);
  assert.ok(times.includes(.5*hour));assert.equal(times.at(-1),6*hour);
  const frames=movieTimeline(times),short=frames.find(frame=>frame.time===0);
  assert.equal(short.duration,.1);
});

test('video timing preserves hourly and three-hourly forecast spacing independently of rendering speed',()=>{
  const hour=3600_000,start=Date.UTC(2026,0,1);
  const timeline=movieTimeline([start,start+hour,start+4*hour]);
  assert.deepEqual(timeline.map(f=>f.timestamp),[0,.2,.8]);
  assert.deepEqual(timeline.map(f=>f.duration),[.2,.6,.2]);
  assert.equal(movieTimeline([start])[0].duration,.2);
  for(const times of [[],[NaN],[2,2],[3,1]])assert.throws(()=>movieTimeline(times),/Invalid/);
});

test('video dimensions keep map aspect, even encoder sizes and a bounded canvas',()=>{
  assert.deepEqual(videoSize(1920,1080),{width:1280,height:720});
  assert.deepEqual(videoSize(375,1001),{width:374,height:1000});
  assert.deepEqual(videoSize(800,2400),{width:426,height:1280});
  for(const size of [[0,1],[1,NaN],[-1,2],[Infinity,2]])assert.throws(()=>videoSize(...size));
});

test('unsupported browsers disable export without rejecting map preparation',async()=>{
  const previous=globalThis.VideoEncoder;
  try{delete globalThis.VideoEncoder;await assert.rejects(checkMp4Support(640,480),/MP4 export is unavailable/);assert.equal(await canExportMapForecast(640,480),false);}
  finally{if(previous)globalThis.VideoEncoder=previous;}
});

test('cancelling an image decode settles promptly and releases the image source',async()=>{
  const previous=globalThis.Image;let image;
  globalThis.Image=class{constructor(){image=this;}src='';};
  try{
    const abort=new AbortController(),pending=videoImage('data:image/png;test',abort.signal);abort.abort();
    await assert.rejects(pending,{name:'AbortError'});assert.equal(image.src,'');assert.equal(image.onload,null);
    await assert.rejects(videoImage('unused',abort.signal),{name:'AbortError'});
  }finally{globalThis.Image=previous;}
});
