/** Match interval-start timestamps to profile times. Canonical internal amounts
 * remain three-hour equivalents so existing snow integration retains its units. */
export function alignPrecipIntervals(times: number[], amounts: unknown[], targets: number[]) {
  const values:(number|null)[]=[], periods:(number|null)[]=[];
  for(const time of targets){
    let index=-1;
    for(let i=0;i<times.length;i++){if(times[i]<=time)index=i;else break;}
    const dt=index>=0?(index+1<times.length?times[index+1]-times[index]:index>0?times[index]-times[index-1]:NaN)/3600000:NaN;
    const raw=index>=0?amounts[index]:null;
    const mm=typeof raw==='number'?raw:typeof raw==='string'&&raw.trim()?Number(raw):NaN;
    if(!Number.isFinite(dt)||dt<=0||dt>3||time>=times[index]+dt*3600000||!Number.isFinite(mm)){
      values.push(null);periods.push(null);continue;
    }
    values.push(Math.max(0,mm)*3/dt);periods.push(dt);
  }
  return { '__precipMm3h':values, '__precipPeriodsH':periods };
}
