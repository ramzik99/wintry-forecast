<div class="v21-panel">
  <div class="meta-row">
    <div class="units" role="group" aria-label="Display units">
      <button type="button" class:active={unitSystem === 'metric'} on:click={() => setUnits('metric')}>Metric</button>
      <button type="button" class:active={unitSystem === 'imperial'} on:click={() => setUnits('imperial')}>Imperial</button>
    </div>
    <span class="freshness">{freshnessLabel}</span>
    <button class="refresh" type="button" on:click={() => dispatch('refresh')} disabled={busy} title={checkedLabel} aria-label="Refresh forecast">{busy ? 'Updating…' : 'Refresh'}</button>
  </div>
</div>

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { saveUnitSystem, type UnitSystem } from './displayUnits';

  export let unitSystem: UnitSystem = 'metric';
  export let activeRunTime: number | null = null;

  export let lastChecked: number | null = null;
  export let busy = false;
  const dispatch = createEventDispatcher<{refresh:void}>();
  let now = Date.now();
  $: checkedLabel = lastChecked === null ? 'Check for the latest forecast' : 'Checked '+Math.max(0,Math.floor((now-lastChecked)/60000))+' minutes ago';
  let timer: ReturnType<typeof setInterval> | null = null;

  $: freshnessLabel = runFreshness(activeRunTime, now);

  function setUnits(value: UnitSystem) {
    unitSystem = value;
    saveUnitSystem(value);
  }

  function runFreshness(run: number | null, reference: number) {
    if (run === null || !Number.isFinite(run)) return 'ECMWF';
    const d = new Date(run);
    const cycle = `${String(d.getUTCHours()).padStart(2, '0')}Z`;
    const age = Math.max(0, (reference - run) / 3600_000);
    return `ECMWF ${cycle} · ${age < 1 ? '<1 h' : `${Math.round(age)} h`}`;
  }

  onMount(() => {
    timer = setInterval(() => now = Date.now(), 60_000);
    return () => {
      if (timer) clearInterval(timer);
    };
  });
</script>

<style lang="less">
  .v21-panel { margin-top: 6px; }
  .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .units { display: flex; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; }
  .units button { height: 23px; padding: 0 7px; border: 0; background: rgba(255,255,255,.04); color: #8898a2; font-size: 7.5px; font-weight: 800; cursor: pointer; }
  .units button.active { background: rgba(80,190,255,.16); color: #dff7ff; }
  .freshness { color: #788a94; font-size: 7.2px; font-weight: 700; white-space: nowrap; }
  .refresh{height:30px;padding:0 7px;background:rgba(80,190,255,.12);border:1px solid rgba(80,190,255,.3);border-radius:6px;color:#dff7ff;font-size:10px;cursor:pointer}.refresh:disabled{opacity:.6;cursor:default}
  .freshness{font-size:9px}.units button{height:30px;font-size:9px}.meta-row{gap:5px;flex-wrap:wrap}
</style>
