<div class="chart-shell" role="dialog" aria-modal="false" aria-label="Wintry forecast graph" bind:this={chartShell} style={`left:${position.x}px;top:${position.y}px;transform:none;`}>
  <div class="chart-head">
    <div class="chart-title">
      <b>Wintry forecast</b>
      <small>{placeName || 'Selected point'}</small>
      <em>{chart?.validLabel ?? 'ECMWF profile · Windy terrain'}</em>
    </div>
    <div class="chart-actions">
      {#if tab === 'graph' && showNow}<button class="now-action" type="button" title="Back to now" aria-label="Back to now" on:click={resetToNow}>Now</button>{/if}
      <button class="drag-button" type="button" title="Drag graph" aria-label="Drag graph" on:pointerdown={startDrag}>↕</button>
      <button type="button" title="Close" aria-label="Close graph" on:click={() => dispatch('close')}>×</button>
    </div>
  </div>
  <div class="forecast-tabs" role="tablist" aria-label="Forecast view"><button class:active={tab === 'graph'} type="button" role="tab" aria-selected={tab === 'graph'} on:click={() => tab = 'graph'}>Forecast</button><button class:active={tab === 'sounding'} type="button" role="tab" aria-selected={tab === 'sounding'} on:click={() => tab = 'sounding'}>Sounding</button></div>

  {#if tab === 'graph'}
  {#if chart}
    <div class="plot-wrap">
      <svg bind:this={svgEl} viewBox="0 0 360 324" role="img" aria-label="Terrain-aware wintry forecast through 144 hours" on:pointermove={handlePointer} on:pointerdown={handlePointer} on:pointerleave={() => tooltip = null}>
        <text x="42" y="11" class="section-label snowline-title">SNOWLINE <tspan>{units === 'imperial' ? 'ft' : 'm'}</tspan></text>
        <rect x="42" y="18" width="306" height="112" rx="8" class="plot-bg" />
        {#if chart.terrainY !== null}
          <rect x="42" y={chart.terrainY} width="306" height={Math.max(0, 130 - chart.terrainY)} class="terrain-zone" />
          <line x1="42" x2="348" y1={chart.terrainY} y2={chart.terrainY} class="terrain-line" />
          <text x="344" y={Math.max(27, chart.terrainY - 4)} text-anchor="end" class="terrain-tag">Terrain</text>
        {/if}
        <line x1="42" x2="348" y1="18" y2="18" class="grid" />
        <line x1="42" x2="348" y1="74" y2="74" class="grid" />
        <line x1="42" x2="348" y1="130" y2="130" class="grid" />
        <text x="37" y="22" text-anchor="end" class="axis">{chart.maxLabel}</text>
        <text x="37" y="78" text-anchor="end" class="axis">{chart.midLabel}</text>
        <text x="37" y="134" text-anchor="end" class="axis">{chart.minLabel}</text>
        <polyline points={chart.points} class="snowline-line" />

        <text x="42" y="147" class="section-label precip-title">PRECIPITATION <tspan>{units === 'imperial' ? 'in/3h' : 'mm/3h'}</tspan></text>
        <rect x="42" y="153" width="306" height="36" rx="7" class="band-bg" />
        {#if chart.hasPrecip}
          <text x="37" y="159" text-anchor="end" class="axis precip-axis">{chart.precipMaxLabel}</text>
          <text x="37" y="190" text-anchor="end" class="axis">0</text>
          {#each chart.precipBars as bar}<rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx="1.1" class="precip-bar" class:wet={bar.mm >= PRECIP_THRESHOLD_MM_H} />{/each}
        {:else}
          <text x="195" y="175" text-anchor="middle" class="empty-band">Dry</text>
        {/if}

        <text x="42" y="205" class="section-label phase-title">PRECIPITATION TYPE</text>
        <rect x="42" y="211" width="306" height="25" rx="7" class="band-bg phase-base" />
        {#each chart.phaseBlocks as block}<rect x={block.x} y="212" width={block.width} height="23" rx="2.8" class={`phase-block phase-${block.key}`} />{/each}

        <g class="phase-legend-svg">
          <rect x="42" y="244" width="7" height="7" rx="1.5" class="phase-snow"/><text x="52" y="250">Snow</text>
          <rect x="88" y="244" width="7" height="7" rx="1.5" class="phase-wet-snow"/><text x="98" y="250">Wet snow</text>
          <rect x="149" y="244" width="7" height="7" rx="1.5" class="phase-mix"/><text x="159" y="250">Mix</text>
          <rect x="183" y="244" width="7" height="7" rx="1.5" class="phase-rain"/><text x="193" y="250">Rain</text>
          <rect x="218" y="244" width="7" height="7" rx="1.5" class="phase-ice-pellets"/><text x="228" y="250">Ice/sleet</text>
          <rect x="279" y="244" width="7" height="7" rx="1.5" class="phase-freezing-rain"/><text x="289" y="250">Frz rain</text>
        </g>

        <text x="42" y="268" class="section-label snow-title">NEW SNOW <tspan>{units === 'imperial' ? 'est. in' : 'est. cm'}</tspan></text>
        <rect x="42" y="274" width="306" height="28" rx="7" class="band-bg" />
        {#if chart.newSnowMax > 0.05}
          <text x="37" y="280" text-anchor="end" class="axis snow-axis">{chart.newSnowMaxLabel}</text>
          <path d={chart.newSnowArea} class="new-snow-area" />
          <polyline points={chart.newSnowPoints} class="new-snow-line" />
        {:else}
          <text x="195" y="291" text-anchor="middle" class="empty-band">{units === 'imperial' ? '0 in' : '0 cm'}</text>
        {/if}

        {#if chart.nowX !== null}
          <line x1={chart.nowX} x2={chart.nowX} y1="18" y2="302" class="now-line" />
          <rect x={Math.max(43, Math.min(322, chart.nowX - 13))} y="20" width="26" height="12" rx="3" class="now-tag-bg" />
          <text x={Math.max(56, Math.min(335, chart.nowX))} y="29" text-anchor="middle" class="now-tag">Now</text>
        {/if}
        {#if chart.currentX !== null && chart.currentY !== null}
          <line x1={chart.currentX} x2={chart.currentX} y1="18" y2="302" class="cursor" />
          <circle cx={chart.currentX} cy={chart.currentY} r="4.2" class="current-dot" />
        {/if}
        {#if tooltip}<line x1={tooltip.x} x2={tooltip.x} y1="18" y2="302" class="inspect-line" />{/if}

        <text x="42" y="320" text-anchor="start" class="axis">{chart.startLabel}</text>
        <text x="195" y="320" text-anchor="middle" class="axis">+72 h</text>
        <text x="348" y="320" text-anchor="end" class="axis">+144 h</text>
      </svg>

      {#if tooltip}
        <div class="tooltip" style={`left:${tooltip.cssX}px;top:${tooltip.cssY}px;`}>
          <b>{tooltip.timeLabel}</b>
          {#if tooltip.phase}<strong class={`text-${tooltip.phase.key}`}><i class={`tip-phase-dot phase-${tooltip.phase.key}`}></i>{tooltip.phase.label}</strong>{/if}
          <div class="tip-grid">
            <span>SL <b>{formatElevation(tooltip.snowline, units)}</b></span>
            <span>Precip <b>{formatPrecip(tooltip.precip, units)}</b></span>
            <span>New snow <b>{formatSnow(tooltip.newSnow, units)}</b></span>
            {#if terrainM !== null}<span>Terrain <b>{formatElevation(terrainM, units)}</b></span>{/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="current-card" class:active-snow={chart.currentPhase?.key === 'snow'} class:active-wet-snow={chart.currentPhase?.key === 'wet-snow'} class:active-mix={chart.currentPhase?.key === 'mix'} class:active-rain={chart.currentPhase?.key === 'rain'} class:active-ice-pellets={chart.currentPhase?.key === 'ice-pellets'} class:active-freezing-rain={chart.currentPhase?.key === 'freezing-rain'}>
      <div class="current-type">
        <b>{#if chart.currentPhase}<i class={`current-phase-dot phase-${chart.currentPhase.key}`}></i>{chart.currentPhase.label}{:else}Dry{/if}</b>
        {#if chart.currentPosition}<strong>{chart.currentPosition}</strong>{/if}
      </div>
      <div class="metrics">
        <span><small>Snowline</small><b>{formatElevation(chart.currentSnowline, units)}</b></span>
        <span><small>Precip</small><b>{formatPrecip(chart.currentPrecip, units)}</b></span>
      </div>
    </div>

    <div class="outlook24 event-intelligence">
      <b>{event?.activeNow ? 'Current wintry period' : 'Next wintry period'}</b>
      {#if event}
        <span>{event.dominantPhase.icon} {event.dominantPhase.label} · {formatEventRange(event.startTime, event.endTime)}{#if event.newSnowCm > 0.05} · est. {formatSnow(event.newSnowCm, units)}{/if}</span>
        {#if !event.activeNow}<button type="button" title="Jump to event start" on:click={jumpToEvent}>Go to event →</button>{/if}
      {:else}
        <span>No wintry precipitation through +144 h.</span>
      {/if}
    </div>
    <div class="hint">Tap chart to select time · Sounding follows selection</div>
  {:else}
    <div class="empty">Wintry forecast unavailable.</div>
  {/if}
  {:else}
    <SoundingChart {point} {terrainM} {placeName} units={units} embedded={true} />
  {/if}
</div>

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import store from '@windy/store';
  import { buildProfile, wetBulbZeroHeight } from './snowLevel';
  import { precipMmAt, formatPrecipMm, PRECIP_THRESHOLD_MM_H } from './precip';
  import { terrainPrecipitationType, type TerrainPrecipType, type TerrainPrecipTypeKey } from './precipType';
  import { terrainCrossingState } from './terrainCrossing';
  import { estimateNewSnowStep } from './snowAccum';
  import { nextWintryEvent } from './eventOutlook';
  import { formatElevation, formatPrecip, formatSnow, type UnitSystem } from './displayUnits';
  import SoundingChart from './SoundingChart.svelte';

  export let point: any;
  export let terrainM: number | null = null;
  export let placeName = '';
  export let tab: 'graph' | 'sounding' = 'graph';
  export let units: UnitSystem = 'metric';

  const dispatch = createEventDispatcher<{ close: void }>();
  let timestamp = Date.now();
  let realNow = Date.now();
  let timestampListener: number | null = null;
  let realNowTimer: ReturnType<typeof setInterval> | null = null;
  let pngBusy = false;
  let chartShell: HTMLDivElement | null = null;
  let svgEl: SVGSVGElement | null = null;
  let position = { x: 24, y: 60 };
  let dragPointerId: number | null = null;
  let dragOffset = { x: 0, y: 0 };
  let tooltip: Tooltip | null = null;

  type Bar = { x: number; y: number; width: number; height: number; mm: number };
  type Block = { x: number; width: number; key: TerrainPrecipTypeKey };
  type Tooltip = { x: number; cssX: number; cssY: number; snowline: number | null; precip: number | null; phase: TerrainPrecipType | null; newSnow: number; timeLabel: string };
  type ChartData = {
    points: string; terrainY: number | null; currentX: number | null; currentY: number | null; nowX: number | null; crossingX: number | null; min24X: number | null; min24Y: number | null;
    minLabel: string; midLabel: string; maxLabel: string; startLabel: string; currentSnowline: number | null; currentTerrainDifference: number | null; currentPosition: string;
    currentPrecip: number | null; currentPhase: TerrainPrecipType | null; currentNewSnow: number; precipBars: Bar[]; hasPrecip: boolean; precipMaxLabel: string;
    minScale: number; maxScale: number; validLabel: string; phaseBlocks: Block[]; phaseSummary: string; newSnowPoints: string; newSnowArea: string; newSnowMax: number; newSnowMaxLabel: string; cumulativeNewSnow: number[];
    min24Snowline: number | null; newSnow24h: number; nextChangeLabel: string; nextChangeTime: number | null;
  };

  $: crossing = terrainCrossingState(point, terrainM, timestamp);
  $: event = nextWintryEvent(point, terrainM, timestamp);
  $: chart = buildChart(point, terrainM, timestamp, crossing?.crossingTime ?? null, realNow);
  $: showNow = Math.abs(timestamp - realNow) > 90 * 60_000;

  function nearestIndex(times: number[], target: number): number { let best = 0, dist = Infinity; times.forEach((t, i) => { const d = Math.abs(t - target); if (d < dist) { dist = d; best = i; } }); return best; }
  function snowlineAt(p: any, index: number): number | null { try { const v = wetBulbZeroHeight(buildProfile(p.forecast, index)).snowLevelM; return v !== null && Number.isFinite(v) ? v : null; } catch { return null; } }
  function phaseAt(p: any, terrain: number | null, index: number): TerrainPrecipType | null { if (terrain === null || !Number.isFinite(terrain)) return null; const precip = precipMmAt(p.forecast, index); if (precip === null || precip < PRECIP_THRESHOLD_MM_H) return null; return terrainPrecipitationType(buildProfile(p.forecast, index), terrain); }
  function formatTooltipTime(time: number): string { return new Date(time).toLocaleString(undefined, { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function formatShortTime(time: number): string { return new Date(time).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }); }
  function formatRun(time: number | null): string { if (!Number.isFinite(Number(time))) return 'ECMWF'; return `ECMWF ${String(new Date(Number(time)).getUTCHours()).padStart(2, '0')}Z`; }
  function phaseName(key: TerrainPrecipTypeKey | null): string { if (!key) return 'Dry'; const labels: Record<TerrainPrecipTypeKey,string> = { snow:'Snow','wet-snow':'Wet snow',mix:'Mix',rain:'Rain','ice-pellets':'Ice pellets','freezing-rain':'Freezing rain' }; return labels[key]; }
  function terrainPosition(difference: number | null): string { if (difference === null) return ''; const value = formatElevation(Math.abs(difference), units); if (difference > 100) return `${value} above snowline`; if (difference < -100) return `${value} below snowline`; return 'Terrain near snowline'; }
  function compactElevationRows(rows:ElevationOutlookRow[],terrain:number|null){if(terrain===null||!rows.length)return rows.slice(0,5);return [...rows].sort((a,b)=>Math.abs(a.elevationM-terrain)-Math.abs(b.elevationM-terrain)).slice(0,5).sort((a,b)=>a.elevationM-b.elevationM)}

  function clampPosition(x: number, y: number) { const rect = chartShell?.getBoundingClientRect(); const w = rect?.width ?? 430, h = rect?.height ?? 590; return { x: Math.max(6, Math.min(window.innerWidth - w - 6, x)), y: Math.max(6, Math.min(window.innerHeight - h - 6, y)) }; }
  function startDrag(event: PointerEvent) { if (!chartShell) return; dragPointerId = event.pointerId; const rect = chartShell.getBoundingClientRect(); dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }; window.addEventListener('pointermove', dragMove); window.addEventListener('pointerup', stopDrag, { once: true }); event.preventDefault(); }
  function dragMove(event: PointerEvent) { if (event.pointerId === dragPointerId) position = clampPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y); }
  function stopDrag(event: PointerEvent) { if (event.pointerId === dragPointerId) dragPointerId = null; window.removeEventListener('pointermove', dragMove); }
  function setTimeline(time: number) { if (!Number.isFinite(time)) return; try { (store as any).set('timestamp', time); timestamp = time; tooltip = null; } catch {} }
  function jumpToCrossing(time: number) { setTimeline(time); }
  function jumpToNextChange() { const time = chart?.nextChangeTime; if (time !== null && time !== undefined) setTimeline(time); }
  function jumpToEvent() { if (event?.startTime) setTimeline(event.startTime); }
  function formatEventRange(start:number,end:number){const a=formatShortTime(start),b=new Date(end).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});return start===end?a:`${a}–${b}`; }
  function resetToNow() { if (!point?.times?.length) return; realNow = Date.now(); setTimeline(point.times[nearestIndex(point.times, realNow)]); }

  function buildBlocks(p: any, phases: (TerrainPrecipType | null)[], x: (t: number) => number, spacing: number): Block[] {
    const blocks: Block[] = []; let start = -1; let key: TerrainPrecipTypeKey | null = null;
    for (let i = 0; i <= phases.length; i++) {
      const next = i < phases.length ? phases[i]?.key ?? null : null;
      if (next !== key) {
        if (key !== null && start >= 0) {
          const end = i - 1, x1 = Math.max(42, x(p.times[start]) - spacing * .48), x2 = Math.min(348, x(p.times[end]) + spacing * .48);
          blocks.push({ x: x1, width: Math.max(2.2, x2 - x1), key });
        }
        start = next === null ? -1 : i; key = next;
      }
    }
    return blocks;
  }

  function phaseSummary(phases: (TerrainPrecipType | null)[], precip: (number | null)[], newSnow: number[]): string {
    const amounts: Record<TerrainPrecipTypeKey, number> = { snow: 0, 'wet-snow': 0, mix: 0, rain: 0, 'ice-pellets': 0, 'freezing-rain': 0 }; let total = 0;
    phases.forEach((phase, i) => { const mm = precip[i]; if (!phase || mm === null || mm < PRECIP_THRESHOLD_MM_H) return; amounts[phase.key] += mm; total += mm; });
    const finalSnow = newSnow.length ? newSnow[newSnow.length - 1] : 0;
    if (total < PRECIP_THRESHOLD_MM_H) return 'Dry forecast · no meaningful precipitation.';
    const ranked = (Object.entries(amounts) as [TerrainPrecipTypeKey, number][]).sort((a, b) => b[1] - a[1]); const [key, amount] = ranked[0], pct = Math.round(amount / total * 100);
    return `${phaseName(key)} ${pct}% · new snow est. ${formatSnow(finalSnow, units)}`;
  }

  function buildChart(p: any, terrain: number | null, target: number, crossingTime: number | null, now: number): ChartData | null {
    if (!p?.times?.length) return null;
    const entries = p.times.map((time: number, i: number) => ({ time, value: snowlineAt(p, i) })).filter((v: any) => v.value !== null && Number.isFinite(v.value)); if (entries.length < 2) return null;
    const snow = entries.map((v: any) => Number(v.value)), scaleValues = terrain !== null && Number.isFinite(terrain) ? [...snow, terrain] : snow;
    let min = Math.floor((Math.min(...scaleValues) - 150) / 100) * 100, max = Math.ceil((Math.max(...scaleValues) + 150) / 100) * 100; if (max - min < 600) { const mid = (min + max) / 2; min = Math.floor((mid - 300) / 100) * 100; max = Math.ceil((mid + 300) / 100) * 100; }
    const left = 42, right = 348, top = 18, bottom = 130, t0 = p.times[0], t1 = p.times[p.times.length - 1];
    const x = (t: number) => left + (t - t0) / Math.max(1, t1 - t0) * (right - left), y = (v: number) => bottom - (v - min) / Math.max(1, max - min) * (bottom - top);
    const points = entries.map((v: any) => `${x(v.time).toFixed(1)},${y(v.value).toFixed(1)}`).join(' '), currentIndex = nearestIndex(p.times, target), currentValue = snowlineAt(p, currentIndex), currentTime = p.times[currentIndex];
    const currentTerrainDifference = currentValue !== null && terrain !== null ? Math.round((terrain - currentValue) / 10) * 10 : null;
    const precipValues = p.times.map((_: number, i: number) => precipMmAt(p.forecast, i)), validPrecip = precipValues.filter((v: number | null): v is number => v !== null && Number.isFinite(v)), precipMax = validPrecip.length ? Math.max(PRECIP_THRESHOLD_MM_H, ...validPrecip) : 0;
    const spacing = (right - left) / Math.max(1, p.times.length - 1), barWidth = Math.max(1.1, Math.min(4.5, spacing * .78));
    const precipBars = precipValues.map((mm: number | null, i: number) => { const value = mm ?? 0, height = precipMax > 0 ? Math.min(30, value / precipMax * 30) : 0; return { x: x(p.times[i]) - barWidth / 2, y: 188 - height, width: barWidth, height, mm: value }; }).filter((b: Bar) => b.height > .1);
    const phases = p.times.map((_: number, i: number) => phaseAt(p, terrain, i));

    const cumulativeNewSnow: number[] = []; let running = 0;
    for (let i = 0; i < p.times.length; i++) {
      const dt = i === 0 ? 1 : Math.max(.25, Math.min(3, (p.times[i] - p.times[i - 1]) / 3600_000));
      running = estimateNewSnowStep(precipValues[i], phases[i], running, dt).cumulativeCm;
      cumulativeNewSnow.push(running);
    }
    const newSnowMax = Math.max(0, ...cumulativeNewSnow), snowTop = 285, snowBottom = 311;
    const snowY = (v: number) => snowBottom - (newSnowMax > 0 ? v / newSnowMax * (snowBottom - snowTop) : 0);
    const newSnowPoints = cumulativeNewSnow.map((v, i) => `${x(p.times[i]).toFixed(1)},${snowY(v).toFixed(1)}`).join(' ');
    const newSnowArea = cumulativeNewSnow.length ? `M ${x(p.times[0]).toFixed(1)} ${snowBottom} L ${newSnowPoints.replace(/,/g, ' ')} L ${x(p.times[p.times.length - 1]).toFixed(1)} ${snowBottom} Z` : '';

    const end24 = currentTime + 24 * 3600_000;
    const windowIndices = p.times.map((time: number, i: number) => ({ time, i })).filter((v: any) => v.time >= currentTime - 60_000 && v.time <= end24 + 60_000).map((v: any) => v.i);
    const minEntry = windowIndices.map((i: number) => ({ i, value: snowlineAt(p, i) })).filter((v: any) => v.value !== null && Number.isFinite(v.value)).sort((a: any, b: any) => a.value - b.value)[0] ?? null;
    const min24Snowline = minEntry ? Math.round(Number(minEntry.value) / 10) * 10 : null;
    let newSnow24h = 0;
    for (const i of windowIndices) {
      const dt = i === currentIndex ? 1 : Math.max(.25, Math.min(3, (p.times[i] - p.times[Math.max(currentIndex, i - 1)]) / 3600_000));
      newSnow24h = estimateNewSnowStep(precipValues[i], phases[i], newSnow24h, dt).cumulativeCm;
    }
    const currentKey = phases[currentIndex]?.key ?? null;
    let nextChangeLabel = '';
    let nextChangeTime:number|null = null;
    for (let i = currentIndex + 1; i < p.times.length && p.times[i] <= end24; i++) {
      const candidate = phases[i]?.key ?? null;
      if (candidate === currentKey) continue;
      const check = [i, i + 1, i + 2].filter(j => j < p.times.length && p.times[j] <= end24);
      if (!check.length || !check.every(j => (phases[j]?.key ?? null) === candidate)) continue;
      nextChangeLabel = `${phaseName(currentKey)} → ${phaseName(candidate)} · ${formatShortTime(p.times[i])}`;
      nextChangeTime = p.times[i];
      break;
    }

    return {
      points, terrainY: terrain !== null ? Math.max(top, Math.min(bottom, y(terrain))) : null, currentX: x(currentTime), currentY: currentValue !== null ? y(currentValue) : null,
      nowX: now >= t0 && now <= t1 ? x(now) : null, crossingX: crossingTime !== null ? x(crossingTime) : null,
      min24X: minEntry ? x(p.times[minEntry.i]) : null, min24Y: minEntry ? y(Number(minEntry.value)) : null,
      minLabel: formatElevation(min, units), midLabel: formatElevation((min + max) / 2, units), maxLabel: formatElevation(max, units), startLabel: new Date(t0).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      currentSnowline: currentValue !== null ? Math.round(currentValue / 10) * 10 : null, currentTerrainDifference, currentPosition: terrainPosition(currentTerrainDifference), currentPrecip: precipValues[currentIndex] ?? null,
      currentPhase: phases[currentIndex], currentNewSnow: cumulativeNewSnow[currentIndex] ?? 0, precipBars, hasPrecip: validPrecip.some(v => v >= PRECIP_THRESHOLD_MM_H),
      precipMaxLabel: precipMax ? formatPrecip(precipMax, units).replace(/\s*(mm|in)\/3h$/, '') : '—', minScale: min, maxScale: max, validLabel: `Valid ${formatTooltipTime(currentTime)} · ${formatRun(p.runTime)}`,
      phaseBlocks: buildBlocks(p, phases, x, spacing), phaseSummary: phaseSummary(phases, precipValues, cumulativeNewSnow), newSnowPoints, newSnowArea, newSnowMax, newSnowMaxLabel: formatSnow(newSnowMax, units), cumulativeNewSnow,
      min24Snowline, newSnow24h: Math.max(0, newSnow24h), nextChangeLabel, nextChangeTime,
    };
  }

  function handlePointer(event: PointerEvent) {
    if (!svgEl || !chart || !point?.times?.length) return;
    const rect = svgEl.getBoundingClientRect(), vx = (event.clientX - rect.left) / rect.width * 360;
    if (vx < 42 || vx > 348) { tooltip = null; return; }
    const t0 = point.times[0], t1 = point.times[point.times.length - 1], idx = nearestIndex(point.times, t0 + (vx - 42) / 306 * (t1 - t0)), time = point.times[idx], x = 42 + (time - t0) / Math.max(1, t1 - t0) * 306;
    if (event.type === 'pointerdown') setTimeline(time);
    tooltip = { x, cssX: Math.max(92, Math.min(rect.width - 92, x / 360 * rect.width)), cssY: 44, snowline: (() => { const v = snowlineAt(point, idx); return v === null ? null : Math.round(v / 10) * 10; })(), precip: precipMmAt(point.forecast, idx), phase: phaseAt(point, terrainM, idx), newSnow: chart.cumulativeNewSnow[idx] ?? 0, timeLabel: formatTooltipTime(time) };
  }

  async function downloadPng() {
    if (!svgEl || !chart || pngBusy || window.innerWidth <= 520) return;
    pngBusy = true;
    try {
      const clone = svgEl.cloneNode(true) as SVGSVGElement; clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', '1080'); clone.setAttribute('height', '1002');
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = 'text{font-family:Arial,sans-serif}.plot-bg,.band-bg{fill:#101b22;stroke:#29404d}.terrain-zone{fill:#17313a}.grid{stroke:#29404d}.axis{fill:#9fb0ba;font-size:8px}.section-label{fill:#dce8ee;font-size:7px;font-weight:700}.section-label tspan{fill:#72838d}.snowline-line{fill:none;stroke:#67d7ff;stroke-width:2.7}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-tag{fill:#ffbd75;font-size:6px}.min24-line{stroke:#9fe9ff;stroke-dasharray:2 3}.min24-dot{fill:#0d151b;stroke:#9fe9ff;stroke-width:2}.min24-tag{fill:#bdefff;font-size:6px}.precip-bar{fill:#3794b8}.precip-bar.wet{fill:#64d4f5}.phase-snow{fill:#f4f7fb}.phase-wet-snow{fill:#6bd47f}.phase-mix{fill:#f2d84f}.phase-rain{fill:#4f82ff}.phase-ice-pellets{fill:#a8753e}.phase-freezing-rain{fill:#a867e8}.phase-block{opacity:.94}.phase-legend-svg text{fill:#aebcc4;font-size:5.5px}.new-snow-line{fill:none;stroke:#82e398;stroke-width:2}.new-snow-area{fill:#82e398;opacity:.18}.now-line{stroke:#ff6759}.now-tag-bg{fill:#ff6759}.now-tag{fill:#fff;font-size:7px}.cursor{stroke:#dce8ee;stroke-dasharray:2 3}.current-dot{fill:#fff;stroke:#67d7ff;stroke-width:2}.crossing-line{stroke:#ffe05b;stroke-dasharray:3 3}.crossing-dot{fill:#111;stroke:#ffe05b;stroke-width:2}.empty-band{fill:#8596a2;font-size:7px}';
      clone.insertBefore(style, clone.firstChild);
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }), url = URL.createObjectURL(blob), img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); img.src = url; });
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1360; const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No canvas');
      ctx.fillStyle = '#0d151b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff'; ctx.font = '700 44px Arial'; ctx.fillText('Wintry forecast', 52, 62);
      ctx.fillStyle = '#cbd7de'; ctx.font = '24px Arial'; ctx.fillText(placeName || 'Selected point', 52, 100);
      ctx.fillStyle = '#72cef4'; ctx.font = '20px Arial'; ctx.fillText(chart.validLabel, 52, 132);
      ctx.drawImage(img, 45, 155, 1110, 1030); URL.revokeObjectURL(url);
      let y = 1217; ctx.fillStyle = '#ffffff'; ctx.font = '700 29px Arial'; ctx.fillText(chart.currentPhase ? `${chart.currentPhase.label}${chart.currentPhase.confidence === 'low' ? ' ~' : ''}` : 'Dry', 52, y);
      y += 34; ctx.fillStyle = '#b8c8d1'; ctx.font = '22px Arial';
      ctx.fillText(`Snowline ${formatElevation(chart.currentSnowline, units)}   ·   Precip ${formatPrecip(chart.currentPrecip, units)}`, 52, y);
      y += 38; ctx.fillStyle = '#dfeaf0'; ctx.font = '700 21px Arial'; ctx.fillText(`Next 24 h · min snowline ${formatElevation(chart.min24Snowline, units)} · new snow ${formatSnow(chart.newSnow24h, units)}`, 52, y);
      if (chart.nextChangeLabel) { y += 30; ctx.fillStyle = '#e5cf7c'; ctx.font = '700 20px Arial'; ctx.fillText(chart.nextChangeLabel, 52, y); }
      y += 30; ctx.fillStyle = '#8799a4'; ctx.font = '18px Arial'; ctx.fillText('New snow is a terrain-aware forecast estimate from precipitation type and wet-bulb profile; it is not total pre-existing snowpack.', 52, y);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('PNG failed')), 'image/png'));
      const href = URL.createObjectURL(png), a = document.createElement('a'); a.href = href; a.download = `wintry-forecast-${(placeName || 'point').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(href), 30000);
    } catch (e) { console.warn('Wintry forecast PNG export failed', e); } finally { pngBusy = false; }
  }

  onMount(() => {
    const width = Math.min(430, window.innerWidth - 16); position = { x: Math.max(6, (window.innerWidth - width) / 2), y: window.innerWidth <= 520 ? 34 : 54 };
    realNow = Date.now(); realNowTimer = setInterval(() => realNow = Date.now(), 30000);
    try { const t = store.get('timestamp'); if (typeof t === 'number') timestamp = t; timestampListener = store.on('timestamp', (v: any) => { const n = Number(v); if (Number.isFinite(n)) timestamp = n; }); } catch {}
  });
  onDestroy(() => { if (realNowTimer) clearInterval(realNowTimer); window.removeEventListener('pointermove', dragMove); if (timestampListener !== null) try { store.off(timestampListener); } catch {} });
</script>

<style lang="less">
  .chart-shell{position:fixed;z-index:10020;width:min(430px,calc(100vw - 16px));padding:11px 12px 10px;border:1px solid rgba(98,213,255,.35);border-radius:14px;background:linear-gradient(180deg,rgba(15,24,31,.99),rgba(9,17,23,.99));color:white;box-shadow:0 16px 42px rgba(0,0,0,.56);backdrop-filter:blur(6px)}
  .chart-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.chart-title{min-width:0;flex:1}.chart-title b{display:block;font-size:15px}.chart-title small,.chart-title em{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.chart-title small{margin-top:3px;color:#a5b4bd;font-size:9px}.chart-title em{margin-top:2px;color:#70cef4;font-size:8px}.chart-actions{display:flex;gap:4px}.chart-actions button{height:26px;min-width:26px;padding:0 7px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(255,255,255,.075);color:#fff;font-size:12px;font-weight:800;cursor:pointer}.chart-actions button:hover{background:rgba(98,213,255,.15)}.png-button{font-size:8px!important}.drag-button{cursor:grab!important;touch-action:none}
  .forecast-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px;padding:3px;border-radius:8px;background:rgba(255,255,255,.035)}.forecast-tabs button{height:27px;border:0;border-radius:6px;background:transparent;color:#82939d;font-size:9px;font-weight:800;cursor:pointer}.forecast-tabs button.active{background:rgba(98,213,255,.13);color:#eaf7fc;box-shadow:inset 0 0 0 1px rgba(98,213,255,.22)}
  .plot-wrap{position:relative;margin-top:5px}svg{display:block;width:100%;height:auto;overflow:visible;touch-action:none}.plot-bg,.band-bg{fill:rgba(255,255,255,.022);stroke:rgba(104,151,177,.22);stroke-width:1}.terrain-zone{fill:rgba(55,190,232,.085)}.grid{stroke:rgba(160,196,216,.13)}.axis{fill:#8fa1ac;font-size:8px;font-family:sans-serif}.section-label{fill:#cbd8df;font-size:6.8px;font-family:sans-serif;font-weight:800;letter-spacing:.35px}.section-label tspan{fill:#657681;font-weight:500}.snowline-title{fill:#cfeefb}.precip-title,.precip-axis{fill:#64d4f5}.phase-title{fill:#d9c75e}.snow-title,.snow-axis{fill:#82e398}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-tag{fill:#ffbd75;font-size:6px;font-family:sans-serif}.snowline-line{fill:none;stroke:#65d5ff;stroke-width:2.7;stroke-linecap:round;stroke-linejoin:round}.min24-line{stroke:#9fe9ff;stroke-width:1;stroke-dasharray:2 3}.min24-dot{fill:#0d151b;stroke:#9fe9ff;stroke-width:2}.min24-tag{fill:#bdefff;font-size:5.8px;font-family:sans-serif;font-weight:800}.now-line{stroke:#ff6658;stroke-width:1.25}.now-tag-bg{fill:#ff6658}.now-tag{fill:#fff;font-size:7px;font-family:sans-serif;font-weight:800}.cursor{stroke:#b9c6cd;stroke-width:1;stroke-dasharray:2 3}.current-dot{fill:#fff;stroke:#65d5ff;stroke-width:2.3}.crossing-line{stroke:#ffe05b;stroke-width:1.3;stroke-dasharray:3 3;cursor:pointer}.crossing-dot{fill:#12191f;stroke:#ffe05b;stroke-width:2.1;cursor:pointer}.inspect-line{stroke:#83939d}.precip-bar{fill:#3f9fbe;opacity:.72}.precip-bar.wet{fill:#67d6f5;opacity:.96}.phase-base{fill:#0b1419}.phase-block{opacity:.94}.phase-snow{fill:#f4f7fb}.phase-wet-snow{fill:#6bd47f}.phase-mix{fill:#f2d84f}.phase-rain{fill:#4f82ff}.phase-ice-pellets{fill:#a8753e}.phase-freezing-rain{fill:#a867e8}.phase-legend-svg text{fill:#aebcc4;font-size:5.5px;font-family:sans-serif}.new-snow-area{fill:#82e398;opacity:.16}.new-snow-line{fill:none;stroke:#82e398;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.empty-band{fill:#778993;font-size:7px;font-family:sans-serif}
  .tooltip{position:absolute;z-index:4;min-width:176px;transform:translateX(-50%);padding:7px 9px;border-radius:9px;background:rgba(5,12,17,.99);border:1px solid rgba(98,213,255,.25);box-shadow:0 7px 20px rgba(0,0,0,.44);pointer-events:none}.tooltip>b{display:block;font-size:8.8px}.tooltip>strong{display:flex;align-items:center;gap:5px;margin:4px 0 5px;font-size:9.2px}.tip-phase-dot,.current-phase-dot{display:inline-block;width:8px;height:8px;border-radius:2px;flex:0 0 auto}.tip-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 9px}.tip-grid span{font-size:7.3px;color:#8fa0aa}.tip-grid b{color:#eaf3f7;font-weight:800}.text-snow{color:#f4f7fb}.text-wet-snow{color:#6bd47f}.text-mix{color:#f2d84f}.text-rain{color:#4f82ff}.text-ice-pellets{color:#c08a50}.text-freezing-rain{color:#bf83f4}
  .current-card{margin-top:3px;padding:7px;border:1px solid rgba(255,255,255,.07);border-left:3px solid rgba(255,255,255,.28);border-radius:9px;background:rgba(255,255,255,.028)}.active-snow{border-left-color:#f4f7fb}.active-wet-snow{border-left-color:#6bd47f}.active-mix{border-left-color:#f2d84f}.active-rain{border-left-color:#4f82ff}.active-ice-pellets{border-left-color:#a8753e}.active-freezing-rain{border-left-color:#a867e8}.current-type{text-align:center}.current-type b{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px}.current-type strong{display:block;margin-top:3px;color:#81dfff;font-size:7.3px}.metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-top:6px}.metrics span{padding:5px 2px;border-radius:7px;background:rgba(255,255,255,.035);text-align:center;min-width:0}.metrics small{display:block;color:#7f909a;font-size:5.8px}.metrics b{display:block;margin-top:1px;font-size:7px;white-space:nowrap}
  .outlook24{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;margin-top:6px;padding:6px 8px;border-radius:8px;background:rgba(98,213,255,.06);border:1px solid rgba(98,213,255,.11)}.outlook24>b{grid-row:1/3;color:#8fdfff;font-size:7px;text-transform:uppercase;letter-spacing:.3px}.outlook24 span{color:#dceaf0;font-size:7.5px;font-weight:700}.outlook24 button{justify-self:start;padding:2px 0;border:0;background:transparent;color:#f1d67d;font-size:7px;font-weight:800;cursor:pointer}.outlook24 button:hover{color:#fff2ae;text-decoration:underline}
  .note{margin-top:4px;color:#d7bc4e;font-size:7.2px;text-align:center}.hint{margin-top:5px;color:#66757e;font-size:6.7px;text-align:center}.empty{padding:25px 8px;text-align:center;color:#8a9aa4;font-size:10px}
  @media(max-width:520px){.chart-shell{width:calc(100vw - 12px);padding:9px;border-radius:12px}.png-button{display:none!important}.chart-title small,.chart-title em{max-width:180px}.metrics{gap:3px}.metrics small{font-size:5.3px}.metrics b{font-size:6.4px}.tooltip{min-width:158px}.outlook24 span,.outlook24 button{font-size:6.6px}}

  .event-head,.elevation-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.confidence{padding:2px 5px;border-radius:8px;font-size:6.5px;font-style:normal;font-weight:850}.confidence-high{background:rgba(96,211,139,.12);color:#87e5aa}.confidence-medium{background:rgba(255,209,84,.12);color:#f5d76d}.confidence-low{background:rgba(255,136,104,.12);color:#ffad96}.event-hazard{border-color:rgba(193,132,255,.38)!important;box-shadow:inset 3px 0 rgba(193,132,255,.8)}.event-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:3px}.event-timeline span{padding:4px;border-radius:6px;background:rgba(255,255,255,.035);font-size:7px;font-weight:800;text-align:center}.event-timeline small{display:block;margin-bottom:2px;color:#71838d;font-size:5.8px;text-transform:uppercase}.elevation-impact{margin-top:6px;padding:7px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.025)}.elevation-head b{font-size:8px}.elevation-head span,.impact-band{color:#87a7b7;font-size:6.8px}.impact-band{margin-top:3px}.elevation-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-top:5px}.elevation-grid span{padding:4px 2px;border-radius:6px;background:rgba(255,255,255,.035);text-align:center}.elevation-grid span.terrain-row{outline:1px solid rgba(255,190,112,.48);background:rgba(255,174,86,.07)}.elevation-grid b,.elevation-grid small,.elevation-grid em{display:block}.elevation-grid b{font-size:7px}.elevation-grid small{margin-top:2px;color:#9aabb4;font-size:5.7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.elevation-grid em{margin-top:2px;color:#dfeaf0;font-size:6.5px;font-style:normal;font-weight:800}
</style>

