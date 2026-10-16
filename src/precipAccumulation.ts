import { forecastSlices } from './forecastIntervals';

/** Integrate three-hour-equivalent amounts over supported, non-overlapping intervals.
 * Liquid totals do not require a known precipitation phase. Unknown time coverage
 * invalidates the requested total rather than silently substituting zero. */
export function precipitationAccumulation(times:number[],amounts:(number|null)[],start:number,end:number,sourcePeriods?:unknown){
  const unavailable={mm:null as number|null,complete:false};
  const slices=forecastSlices(times,start,end,sourcePeriods);
  if(!slices)return unavailable;
  let total=0;
  for(const slice of slices){
    const value=amounts[slice.index];
    if(value===null||value===undefined||!Number.isFinite(value)||value<0)return unavailable;
    total+=value*slice.hours/3;
  }
  return {mm:total,complete:true};
}
