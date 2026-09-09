import { PRECIP_THRESHOLD_MM_3H } from './precip';

/** A cumulative estimate is supported only up to the first unknown interval. */
export function forecastCoverage(precip: (number|null)[], phases: unknown[], times: number[]) {
  const known = precip.map((value,i)=>value!==null&&Number.isFinite(value)&&value>=0&&Number.isFinite(times[i])&&
    (value<PRECIP_THRESHOLD_MM_3H||phases[i]!=null));
  let prefix=0;
  while(prefix<known.length&&known[prefix]&&(prefix===0||times[prefix]>times[prefix-1]&&times[prefix]-times[prefix-1]<=3*3600_000))prefix++;
  const complete=known.length>0&&prefix===known.length;
  const precipCount=precip.filter(value=>value!==null&&Number.isFinite(value)).length;
  const note=complete?'':known.slice(prefix).some(Boolean)?'Forecast has gaps':'';
  return {known,prefix,complete,precipCount,note:precipCount===0?'Forecast unavailable':note};
}
