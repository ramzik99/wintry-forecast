<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import store from '@windy/store';
  export let times: number[] = [];
  let timestamp = Date.now();
  let listener: number | null = null;
  $: available = [...new Set(times.filter(Number.isFinite))].sort((a,b) => a-b);
  $: index = available.reduce((best,t,i) => Math.abs(t-timestamp) < Math.abs(available[best]-timestamp) ? i : best, 0);
  $: days = available.filter((t,i) => i === 0 || new Date(t).toDateString() !== new Date(available[i-1]).toDateString());
  $: label = new Date(timestamp).toLocaleString([], {weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  function select(time: number) { if(Number.isFinite(time)) { store.set('timestamp',time); timestamp=time; } }
  function now() { if(available.length) select(available.reduce((a,b) => Math.abs(b-Date.now()) < Math.abs(a-Date.now()) ? b : a)); }
  onMount(() => { timestamp=Number(store.get('timestamp')) || Date.now(); listener=store.on('timestamp',(t: number) => timestamp=Number(t)); });
  onDestroy(() => { if(listener !== null) store.off(listener); });
</script>

{#if available.length}
<section aria-label="Forecast time" class="time-nav">
  <div class="time-heading"><div><small>FORECAST TIME · DEVICE LOCAL</small><strong>{label}</strong></div><button on:click={now} type="button">Now</button></div>
  <div class="scrub"><button aria-label="Previous forecast step" type="button" disabled={index === 0} on:click={() => select(available[index-1])}>‹</button><input aria-label="Forecast time" aria-valuetext={label} type="range" min="0" max={available.length-1} step="1" value={index} on:input={(event) => select(available[Number(event.currentTarget.value)])}/><button aria-label="Next forecast step" type="button" disabled={index === available.length-1} on:click={() => select(available[index+1])}>›</button></div>
  <div class="days" aria-label="Choose forecast day">{#each days as day}<button type="button" class:active={new Date(day).toDateString() === new Date(timestamp).toDateString()} on:click={() => select(day)}><span>{new Date(day).toLocaleDateString([], {weekday:'short'})}</span><b>{new Date(day).getDate()}</b></button>{/each}</div>
</section>
{/if}

<style>
  .time-nav{margin-top:12px;padding-top:12px;border-top:1px solid #304655;color:#edf8ff}.time-heading{display:flex;justify-content:space-between;gap:8px;align-items:center}small{display:block;font-size:9px;letter-spacing:.7px;color:#a4bccb}strong{display:block;font-size:14px;margin-top:4px}button{min-width:36px;min-height:36px;border:1px solid #344d5d;border-radius:9px;background:#172b39;color:#e6f4fc;cursor:pointer;font:inherit}button:disabled{opacity:.35;cursor:default}button:focus-visible,input:focus-visible{outline:2px solid #8de4ff;outline-offset:2px}.scrub{display:flex;align-items:center;gap:8px;margin:8px 0}.scrub button{font-size:22px}input{width:100%;min-width:0;height:32px;accent-color:#81dfff;cursor:pointer}.days{display:flex;gap:4px;overflow-x:auto;padding-bottom:3px}.days button{flex:1;min-width:33px;padding:5px 2px}.days span{display:block;font-size:10px;color:#a4bccb}.days b{display:block;font-size:13px;margin-top:3px}.days .active{background:#245268;border-color:#81dfff}
</style>
