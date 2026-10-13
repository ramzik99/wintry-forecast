import { forecastIntervalHours } from './forecastTime';

/** Integrate three-hour-equivalent amounts over supported, non-overlapping intervals.
 * Liquid totals do not require a known precipitation phase. Unknown time coverage
 * invalidates the requested total rather than silently substituting zero. */
export function precipitationAccumulation(times:number[],amounts:(number|null)[],start:number,end:number,sourcePeriods?:unknown){
  const unavailable={mm:null as number|null,complete:false};
  if(!times.length||!Number.isFinite(start)||!Number.isFinite(end)||end<=start||times.some((t,i)=>!Number.isFinite(t)||(i>0&&t<=times[i-1])))return unavailable;
  const periods=Array.isArray(sourcePeriods)?sourcePeriods:null;
  let covered=start,total=0;
  for(let i=0;i<times.length&&times[i]<end;i++){
    const represented=forecastIntervalHours(times,i),source=periods?periods[i]:represented;
    if(typeof source!=='number'||!Number.isFinite(source)||source<=0||source>3){if(times[i]>=start)return unavailable;continue;}
    const until=Math.min(times[0]+144*3600_000,times[i]+Math.min(represented,source)*3600_000);
    if(until<=start)continue;
    const value=amounts[i];
    if(times[i]>covered||value===null||value===undefined||!Number.isFinite(value)||value<0)return unavailable;
    const from=Math.max(start,covered,times[i]),to=Math.min(end,until);
    if(to>from)total+=value*(to-from)/(3*3600_000);
    covered=Math.max(covered,to);
    if(covered>=end)return {mm:total,complete:true};
  }
  return unavailable;
}
