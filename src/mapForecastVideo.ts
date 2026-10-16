import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, canEncodeVideo } from 'mediabunny';

export type MovieTime = { time:number; timestamp:number; duration:number };

/** Include hourly contour times and source-interval ends so missing gaps go blank. */
export function forecastMovieTimes(axes:number[][]){
  const valid=axes.filter(a=>a.length&&a.every((t,i)=>Number.isFinite(t)&&(i===0||t>a[i-1])));
  if(!valid.length)return [];
  const hour=3600_000,first=Math.min(...valid.map(a=>a[0])),last=Math.min(first+144*hour,Math.max(...valid.map(a=>a.at(-1)!)));
  const targets=new Set<number>([last]);
  for(let t=first;t<=last;t+=hour)targets.add(t);
  for(const axis of valid)axis.forEach((t,i)=>{
    if(t>=first&&t<=last)targets.add(t);
    const span=i+1<axis.length?axis[i+1]-t:i>0?t-axis[i-1]:3*hour,end=t+Math.min(3*hour,span);
    if(end>=first&&end<=last)targets.add(end);
  });
  return [...targets].sort((a,b)=>a-b);
}

/** Forecast hours have a constant playback speed; coarse source steps are held longer. */
export function movieTimeline(times:number[]):MovieTime[]{
  if(!times.length||times.some((t,i)=>!Number.isFinite(t)||(i>0&&t<=times[i-1])))throw new Error('Invalid forecast video times');
  const origin=times[0],hour=3600_000;
  return times.map((time,i)=>({time,timestamp:(time-origin)/hour/5,
    duration:(i+1<times.length?times[i+1]-time:Math.min(hour,i>0?time-times[i-1]:hour))/hour/5}));
}

export function videoSize(width:number,height:number){
  if(!(width>0&&height>0&&Number.isFinite(width)&&Number.isFinite(height)))throw new Error('Map size unavailable');
  const scale=Math.min(1,1280/Math.max(width,height));
  return {width:Math.max(2,Math.floor(width*scale/2)*2),height:Math.max(2,Math.floor(height*scale/2)*2)};
}

export async function checkMp4Support(width:number,height:number){
  if(typeof VideoEncoder==='undefined'||!await canEncodeVideo('avc',{width,height,bitrate:4_000_000})){
    throw new Error('MP4 export is unavailable in this browser. Try an updated Chrome, Edge or Safari browser.');
  }
}

/** One decoded canvas at a time; source rendering speed never changes video timing. */
export async function encodeMapForecast(canvas:HTMLCanvasElement,times:number[],draw:(time:number)=>Promise<void>,
  signal:AbortSignal,progress:(done:number,total:number)=>void){
  const timeline=movieTimeline(times),target=new BufferTarget();
  const output=new Output({format:new Mp4OutputFormat({fastStart:'in-memory'}),target});
  const source=new CanvasSource(canvas,{codec:'avc',bitrate:4_000_000});
  output.addVideoTrack(source);
  let finished=false;
  const cancel=()=>{if(!finished)void output.cancel().catch(()=>{});};
  signal.addEventListener('abort',cancel,{once:true});
  try{
    signal.throwIfAborted();
    await output.start();
    for(let i=0;i<timeline.length;i++){
      signal.throwIfAborted();
      const frame=timeline[i];await draw(frame.time);signal.throwIfAborted();
      await source.add(frame.timestamp,frame.duration);signal.throwIfAborted();
      progress(i+1,timeline.length);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    await output.finalize();signal.throwIfAborted();finished=true;
    if(!target.buffer?.byteLength)throw new Error('MP4 encoder returned an empty video');
    return new Blob([target.buffer],{type:'video/mp4'});
  }finally{
    signal.removeEventListener('abort',cancel);
    if(!finished)await output.cancel().catch(()=>{});
  }
}

export function videoImage(url:string,signal:AbortSignal):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{
    signal.throwIfAborted();const image=new Image();image.crossOrigin='anonymous';
    const finish=()=>{clearTimeout(timer);image.onload=null;image.onerror=null;signal.removeEventListener('abort',abort);};
    const abort=()=>{finish();image.src='';reject(new DOMException('Video export cancelled','AbortError'));};
    const timer=setTimeout(()=>{finish();image.src='';reject(new Error('Video map image timed out'));},15000);
    signal.addEventListener('abort',abort,{once:true});
    image.onload=()=>{finish();resolve(image);};
    image.onerror=()=>{finish();reject(new Error('Video map image unavailable'));};image.src=url;
  });
}
