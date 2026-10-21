<div class="point-forecast-backdrop" role="presentation" on:click|self={() => dispatch('close')}>
  <section class="point-forecast" role="dialog" aria-modal="true" aria-label="Point forecast" on:keydown={handleKey}>
    <header><div><b>Point forecast</b><small>{placeName || 'Selected point'} · ECMWF</small></div><button bind:this={closeButton} type="button" aria-label="Close point forecast" on:click={() => dispatch('close')}>×</button></header>
    <div class="forecast-tabs" role="tablist" aria-label="Point forecast view">
      <button type="button" role="tab" id="point-forecast-tab" aria-controls="point-forecast-content" aria-selected={tab === 'forecast'} tabindex={tab === 'forecast' ? 0 : -1} on:click={() => tab = 'forecast'} on:keydown={changeTab}>Forecast</button>
      <button type="button" role="tab" id="point-sounding-tab" aria-controls="point-sounding-content" aria-selected={tab === 'sounding'} tabindex={tab === 'sounding' ? 0 : -1} on:click={() => tab = 'sounding'} on:keydown={changeTab}>Sounding</button>
    </div>
    {#if loading}<p role="status">Loading forecast…</p>
    {:else if tab === 'sounding'}
      <div class="sounding-tab" id="point-sounding-content" role="tabpanel" aria-labelledby="point-sounding-tab"><SoundingChart {point} {terrainM} {placeName} embedded={true} /></div>
    {:else if rows.length}
      <div id="point-forecast-content" role="tabpanel" aria-labelledby="point-forecast-tab">
      <div class="chart" aria-label="Precipitation forecast">
        <svg viewBox="0 0 600 130" role="img" aria-label="Precipitation amounts coloured by type">
          <text x="8" y="15">Precipitation · mm per interval</text>
          <line x1="8" x2="590" y1="104" y2="104" stroke="#647986"/>
          {#each rows as row}
            {#if row.amount !== null && row.amount > 0}
              <rect x={8 + 582 * (row.time - start) / span} y={104 - 76 * row.amount / maxAmount} width={Math.max(1, 582 * (row.end - row.time) / span - 1)} height={76 * row.amount / maxAmount} fill={row.colour}><title>{formatTime(row.time)} · {row.label} · {amountText(row.amount)} mm</title></rect>
            {/if}
          {/each}
          {#each ticks as tick}<text x={8 + 582 * (tick - start) / span} y="122" text-anchor={tick === start ? 'start' : 'middle'}>{new Date(tick).toLocaleDateString(undefined,{weekday:'short',day:'numeric'})}</text>{/each}
          {#if timestamp >= start && timestamp < start + span}<line x1={8 + 582 * (timestamp - start) / span} x2={8 + 582 * (timestamp - start) / span} y1="25" y2="104" stroke="#fff" stroke-dasharray="3 3"/>{/if}
        </svg>
      </div>
      <div class="column-head"><span>Local time</span><span>Estimated type</span><span>mm</span></div>
      <div class="forecast-rows" tabindex="0" aria-label="Forecast intervals">
        {#each rows as row}
          <button type="button" class:selected={timestamp >= row.time && timestamp < row.end} aria-pressed={timestamp >= row.time && timestamp < row.end} aria-label={'Select forecast ' + formatTime(row.time)} data-time={row.time} on:click={() => store.set('timestamp',row.time)}>
            <time datetime={new Date(row.time).toISOString()}>{formatTime(row.time)}</time><span class="phase"><i style={'background:' + row.colour}></i>{row.label}</span><span>{amountText(row.amount)}</span>
          </button>
        {/each}
      </div>
      <footer>Select a time to update the map. Amounts cover each listed interval.</footer>
      </div>
    {:else}<p>Forecast unavailable for this point.</p>{/if}
  </section>
</div>
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import store from '@windy/store';
  import SoundingChart from './SoundingChart.svelte';
  import { buildProfile } from './snowLevel';
  import { supportedPrecipitationType } from './precipType';
  import { precipMmAtTime } from './precip';
  import { supportedIntervalEnd } from './forecastIntervals';
  import { PRECIP_TYPE_COLOURS } from './precipShading';

  export let point:any = null;
  export let terrainM:number|null = null;
  export let placeName = '';
  export let loading = false;
  const dispatch = createEventDispatcher<{close:void}>();
  let tab:'forecast'|'sounding' = 'forecast';
  function changeTab(event:KeyboardEvent){if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();tab=event.key==='Home'?'forecast':event.key==='End'?'sounding':tab==='forecast'?'sounding':'forecast';(event.currentTarget as HTMLElement).parentElement?.querySelector<HTMLElement>(tab==='forecast'?'#point-forecast-tab':'#point-sounding-tab')?.focus();}
  let timestamp = Number(store.get('timestamp')) || Date.now();
  let listener:number|null = null;
  let closeButton:HTMLButtonElement;
  let previousFocus:HTMLElement|null = null;
  type Row = {time:number;end:number;amount:number|null;label:string;colour:string};
  function buildRows(p:any, elevation:number|null):Row[]{
    if(!p?.times?.length)return [];
    return p.times.map((time:number,index:number)=>{
      const end=supportedIntervalEnd(p.times,index,p.forecast.__precipPeriodsH);
      const mm=end>time?precipMmAtTime(p.forecast,p.times,time):null;
      const phase=mm!==null&&mm>0&&elevation!==null?supportedPrecipitationType(buildProfile(p.forecast,index),elevation):null;
      return {time,end:Math.max(time,end),amount:mm===null?null:mm*(end-time)/10800000,label:mm===0?'Dry':phase?.label??'Unavailable',colour:phase?PRECIP_TYPE_COLOURS[phase.key]:'#84949e'};
    });
  }
  $: rows = buildRows(point,terrainM);
  $: start = rows[0]?.time ?? 0;
  $: span = Math.max(3600000,(rows.at(-1)?.end ?? start)-start);
  $: maxAmount = Math.max(1,...rows.map(row=>row.amount??0));
  $: ticks = Array.from({length:Math.floor(span/86400000)+1},(_,i)=>start+i*86400000).filter(t=>t<start+span);
  function formatTime(t:number){return new Date(t).toLocaleString(undefined,{weekday:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
  function amountText(amount:number|null){return amount===null?'—':amount===0?'0':amount<0.1?'<0.1':amount.toFixed(1);}
  function handleKey(event:KeyboardEvent){
    if(event.key==='Escape'){event.stopPropagation();dispatch('close');}
    if(event.key==='Tab'){
      const root=event.currentTarget as HTMLElement,items=[...root.querySelectorAll<HTMLElement>('button,[tabindex="0"]')];
      const first=items[0],last=items.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  }
  onMount(()=>{previousFocus=document.activeElement as HTMLElement;closeButton?.focus();listener=store.on('timestamp',()=>timestamp=Number(store.get('timestamp'))||Date.now());});
  onDestroy(()=>{if(listener!==null)store.off(listener);if(previousFocus?.isConnected)previousFocus.focus();});
</script>
<style>
  .forecast-tabs{display:flex;gap:6px;padding:0 14px 10px}.forecast-tabs button{flex:1;min-height:40px;border:1px solid #547180;border-radius:6px;background:#172e3c;color:#c7dbe7;font:inherit;cursor:pointer}.forecast-tabs button[aria-selected="true"]{background:#2c536b;color:#fff;border-color:#71d6ff}.sounding-tab{padding:0 12px 12px;max-width:370px;margin:auto}

  .point-forecast-backdrop{position:fixed;inset:0;z-index:10000;background:#0005;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;pointer-events:auto}
  .point-forecast{width:600px;max-width:100%;max-height:85dvh;overflow:auto;background:#10232f;color:#e8f1f5;border:1px solid #546b79;border-radius:12px;box-shadow:0 6px 30px #0008;font:13px/1.4 sans-serif}
  header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;gap:12px}header b{font-size:16px}header small{display:block;color:#bccdd6;overflow-wrap:anywhere}
  header button{min-width:44px;min-height:44px;background:#203c4c;color:white;border:1px solid #617785;border-radius:6px;font-size:24px;cursor:pointer}
  .chart{padding:0 10px}svg{display:block;width:100%;height:auto}svg text{fill:#bccdd6;font-size:11px}
  .column-head,.forecast-rows button{display:grid;grid-template-columns:1.15fr 1fr 44px;gap:8px;align-items:center}
  .column-head{padding:8px 14px;color:#b8cbd6;font-size:11px}.column-head span:last-child{text-align:right}
  .forecast-rows{max-height:280px;overflow:auto;overscroll-behavior:contain}
  .forecast-rows button{width:100%;min-height:44px;padding:9px 14px;border:0;border-top:1px solid #38505e;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
  .forecast-rows button.selected{background:#2c536b;box-shadow:inset 3px 0 #71d6ff}.forecast-rows button:hover{background:#284354}
  .forecast-rows button>span:last-child{text-align:right;font-variant-numeric:tabular-nums}.phase{display:flex;align-items:center;gap:6px}.phase i{width:8px;height:8px;flex:none;border:1px solid #ffffff70;border-radius:2px}
  footer,p{padding:10px 14px;margin:0;color:#bccdd6;font-size:11px}
  @media(max-width:480px){.point-forecast-backdrop{padding:8px}.point-forecast{max-height:80dvh}.forecast-rows{max-height:36dvh}.forecast-rows button{font-size:11px;gap:5px;padding:9px 10px}.column-head{padding:8px 10px}}
</style>
