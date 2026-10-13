<div class:v21-panel={!settingsOnly} class:mobile-settings={settingsOnly}>
  <div class="meta-row">
    <div class="units" role="group" aria-label="Display units">
      <button type="button" aria-pressed={unitSystem === 'metric'} class:active={unitSystem === 'metric'} on:click={() => setUnits('metric')}>Metric</button>
      <button type="button" aria-pressed={unitSystem === 'imperial'} class:active={unitSystem === 'imperial'} on:click={() => setUnits('imperial')}>Imperial</button>
    </div>
    {#if !settingsOnly}<span class="freshness" title={freshnessLabel}>{freshnessLabel}</span>{/if}
  </div>
  {#if !settingsOnly}<div class="release-row"><span title="Plugin version">v{config.version}</span></div>{/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import config from './pluginConfig';
  import { saveUnitSystem, type UnitSystem } from './displayUnits';

  export let unitSystem: UnitSystem = 'metric';
  export let activeRunTime: number | null = null;
  export let settingsOnly = false;

  let now = Date.now();
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
    if (settingsOnly) return;
    timer = setInterval(() => now = Date.now(), 60_000);
    return () => {
      if (timer) clearInterval(timer);
    };
  });
</script>

<style lang="less">
  .release-row { display:flex; justify-content:space-between; margin-top:4px; color:#a8b6bf; font-size:9px; line-height:12px; }
  .v21-panel { margin-top: 5px; }
  .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
  .units { display: flex; flex-shrink: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; }
  .units button { height: 26px; padding: 0 4px; border: 0; background: rgba(255,255,255,.04); color: #a8b6bf; font-size: 9px; font-weight: 800; cursor: pointer; }
  .units button.active { background: rgba(80,190,255,.16); color: #dff7ff; }
  .freshness { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: #a8b6bf; font-size: 9px; font-weight: 700; white-space: nowrap; }
  .units button{height:32px;font-size:11px;padding:0 7px}.freshness{font-size:11px}.release-row{font-size:10px;margin-top:6px}
  .mobile-settings{display:none}
  :global(#device-mobile) .mobile-settings{display:block;margin-top:7px}
  :global(#device-mobile) .mobile-settings .units button{height:44px;padding-inline:10px}
  :global(#device-mobile) .v21-panel .units{display:none}
  :global(#device-mobile) .v21-panel{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:2px}
  :global(#device-mobile) .release-row{margin-top:0;font-size:9px}
  :global(#device-mobile) .freshness{font-size:10px}
</style>
