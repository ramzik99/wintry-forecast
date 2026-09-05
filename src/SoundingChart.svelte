<div class:sounding-embedded={embedded} class="sounding-shell" role="group" aria-label="Forecast sounding" bind:this={shell} style={embedded ? undefined : `left:${position.x}px;top:${position.y}px;`}>
  <div class="head" class:embedded-head={embedded}>
    {#if !embedded}<div>
      <b>Forecast sounding</b>
      <small>{placeName || 'Selected point'}</small>
      <em>{validLabel}</em>
    </div>{/if}
    <div class="actions">
      <button type="button" title="Zoom out" aria-label="Zoom out" on:click={() => zoomAtCentre(zoom / 1.25)}>−</button>
      <button class="zoom-readout" type="button" title="Fit sounding" aria-label="Fit sounding" on:click={resetZoom}>Fit</button>
      <button type="button" title="Zoom in" aria-label="Zoom in" on:click={() => zoomAtCentre(zoom * 1.25)}>+</button>
      {#if !embedded}<button class="drag" type="button" title="Drag sounding window" aria-label="Drag sounding window" on:pointerdown={startDrag}>↕</button>
      <button type="button" title="Close" aria-label="Close sounding" on:click={() => dispatch('close')}>×</button>{/if}
    </div>
  </div>

  {#if sounding}
    <div class="phase-banner" class:dry={!sounding.phaseKey} class:snow={sounding.phaseKey === 'snow'} class:wet-snow={sounding.phaseKey === 'wet-snow'} class:mix={sounding.phaseKey === 'mix'} class:rain={sounding.phaseKey === 'rain'} class:ice={sounding.phaseKey === 'ice-pellets'} class:freezing-rain={sounding.phaseKey === 'freezing-rain'}>
      <small>At terrain</small><b>{sounding.phaseLabel}</b>
    </div>

    <!-- svelte-ignore a11y-no-noninteractive-tabindex a11y-no-noninteractive-element-interactions -->
    <div class="sounding-viewport" class:zoomed={zoom > 1.001} bind:this={viewport} tabindex="0" role="application" aria-label="Zoomable forecast sounding" on:wheel|preventDefault={handleWheel} on:pointerdown={startPlotPointer} on:pointermove={movePlotPointer} on:pointerup={endPlotPointer} on:pointercancel={endPlotPointer} on:pointerleave={leavePlot} on:dblclick={resetZoom} on:keydown={handleViewportKey}>
      <svg bind:this={svgEl} viewBox="0 0 330 390" role="img" aria-label="Temperature, dew point and wet-bulb vertical profile" style={`width:${zoom * 100}%;`}>
        <rect x="48" y="22" width="262" height="320" rx="9" class="plot-bg" />
        {#each sounding.tempGrid as g}
          <line x1={g.x} x2={g.x} y1="22" y2="342" class:zero={g.value === 0} class="temp-grid" />
          <text x={g.x} y="360" text-anchor="middle" class="axis">{units === 'imperial' ? Math.round(g.value*9/5+32) : g.value}°</text>
        {/each}
        {#each sounding.pressureGrid as g}
          <line x1="48" x2="310" y1={g.y} y2={g.y} class="pressure-grid" />
          <text x="42" y={g.y + 3} text-anchor="end" class="axis">{g.label}</text>
        {/each}

        {#if sounding.terrainY !== null}
          <rect x="48" y={sounding.terrainY} width="262" height={Math.max(0, 342 - sounding.terrainY)} class="terrain-zone" />
          <line x1="48" x2="310" y1={sounding.terrainY} y2={sounding.terrainY} class="terrain-line" />
          <text x="306" y={Math.max(31, sounding.terrainY - 4)} text-anchor="end" class="terrain-text">terrain</text>
        {/if}
        {#if sounding.snowlineY !== null}
          <line x1="48" x2="310" y1={sounding.snowlineY} y2={sounding.snowlineY} class="snowline-marker" />
          <rect x="222" y={Math.max(24, sounding.snowlineY - 10)} width="84" height="12" rx="3" class="snowline-tag-bg" />
          <text x="302" y={Math.max(33, sounding.snowlineY - 1)} text-anchor="end" class="snowline-tag">Snowline {sounding.snowline}</text>
        {/if}

        <polyline points={sounding.tempPoints} class="temp-line" />
        <polyline points={sounding.dewPoints} class="dew-line" />
        <polyline points={sounding.wetBulbPoints} class="wetbulb-line" />

        {#each sounding.nodes as n}
          <circle cx={n.tx} cy={n.y} r="2.1" class="temp-dot" />
          <circle cx={n.dx} cy={n.y} r="2" class="dew-dot" />
        {/each}
        {#if hoverNode}
          <line x1="48" x2="310" y1={hoverNode.y} y2={hoverNode.y} class="hover-level" />
          <circle cx={hoverNode.tx} cy={hoverNode.y} r="4" class="hover-temp" />
          <circle cx={hoverNode.dx} cy={hoverNode.y} r="4" class="hover-dew" />
          <circle cx={hoverNode.wx} cy={hoverNode.y} r="4" class="hover-wet" />
        {/if}
      </svg>
    </div>
    {#if hoverNode}<div class="sounding-hover"><b>{Math.round(hoverNode.pressure)} hPa · {formatElevation(hoverNode.height,units)}</b><span>T {formatTemperature(hoverNode.temp,units)}</span><span>Td {formatTemperature(hoverNode.dew,units)}</span><span>Tw {formatTemperature(hoverNode.wet,units)}</span></div>{/if}

    <div class="key">
      <span><i class="t"></i>Temp</span>
      <span><i class="d"></i>Dew point</span>
      <span><i class="w"></i>Wet bulb</span>
      <span><i class="z"></i>0°C</span>
    </div>
    <div class="stats">
      <span><small>Terrain Tw</small><b>{sounding.surfaceTw}</b></span>
      <span><small>Snowline</small><b>{sounding.snowline}</b></span>
    </div>
    <div class="hint">Hover/touch for T, Td and Tw · +/- to zoom · Fit to reset</div>
  {:else}
    <div class="empty">Sounding unavailable for this forecast time.</div>
  {/if}
</div>

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import store from '@windy/store';
  import { buildProfile, wetBulbZeroHeight, type ProfilePoint } from './snowLevel';
  import { terrainPrecipitationType } from './precipType';
  import { terrainDiagnostics } from './terrainDiagnostics';
  import { precipMmAt, PRECIP_THRESHOLD_MM_H } from './precip';
  import { formatElevation, formatTemperature, type UnitSystem } from './displayUnits';

  export let point: any;
  export let terrainM: number | null = null;
  export let placeName = '';
  export let embedded = false;
  export let units: UnitSystem = 'metric';

  const dispatch = createEventDispatcher<{ close: void }>();
  let timestamp = Date.now();
  let timestampListener: number | null = null;
  let shell: HTMLDivElement | null = null;
  let svgEl: SVGSVGElement | null = null;
  let viewport: HTMLDivElement | null = null;
  let position = { x: 24, y: 64 };
  let dragPointerId: number | null = null;
  let dragOffset = { x: 0, y: 0 };
  let zoom = 1;
  let pngBusy = false;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3.5;
  const plotPointers = new Map<number, { x: number; y: number }>();
  let panPointerId: number | null = null;
  let panStart = { x: 0, y: 0, left: 0, top: 0 };
  let pinchDistance = 0;
  let hoverNode: {tx:number;dx:number;wx:number;y:number;pressure:number;height:number;temp:number;dew:number;wet:number}|null=null;

  type SoundingData = {
    tempPoints: string; dewPoints: string; wetBulbPoints: string;
    nodes: { tx:number; dx:number; wx:number; y:number; pressure:number; height:number; temp:number; dew:number; wet:number }[];
    tempGrid: { x: number; value: number }[];
    pressureGrid: { y: number; label: string }[];
    terrainY: number | null; snowlineY: number | null;
    surfaceTw: string; snowline: string; warmEnergy: string; coldEnergy: string;
    phaseLabel: string; phaseDetail: string; phaseKey: string | null;
  };

  $: sounding = buildSounding(point, terrainM, timestamp);
  $: validLabel = formatValid(point, timestamp);

  function nearestIndex(times: number[], target: number): number { let best = 0, dist = Infinity; times.forEach((t, i) => { const d = Math.abs(t - target); if (d < dist) { dist = d; best = i; } }); return best; }
  function formatValid(p: any, target: number): string {
    if (!p?.times?.length) return 'Selected forecast time';
    const t = p.times[nearestIndex(p.times, target)];
    return new Date(t).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function clampPosition(x: number, y: number) { const rect = shell?.getBoundingClientRect(); const w = rect?.width ?? 390, h = rect?.height ?? 520; return { x: Math.max(6, Math.min(window.innerWidth - w - 6, x)), y: Math.max(6, Math.min(window.innerHeight - h - 6, y)) }; }
  function startDrag(event: PointerEvent) { if (!shell) return; dragPointerId = event.pointerId; const rect = shell.getBoundingClientRect(); dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }; window.addEventListener('pointermove', dragMove); window.addEventListener('pointerup', stopDrag, { once: true }); event.preventDefault(); }
  function dragMove(event: PointerEvent) { if (event.pointerId === dragPointerId) position = clampPosition(event.clientX - dragOffset.x, event.clientY - dragOffset.y); }
  function stopDrag(event: PointerEvent) { if (event.pointerId === dragPointerId) dragPointerId = null; window.removeEventListener('pointermove', dragMove); }

  function clampZoom(value: number): number { return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)); }
  function zoomAround(value: number, clientX?: number, clientY?: number) {
    if (!viewport) { zoom = clampZoom(value); return; }
    const next = clampZoom(value), old = zoom;
    if (Math.abs(next - old) < 0.002) return;
    const rect = viewport.getBoundingClientRect();
    const anchorX = clientX === undefined ? rect.width / 2 : Math.max(0, Math.min(rect.width, clientX - rect.left));
    const anchorY = clientY === undefined ? rect.height / 2 : Math.max(0, Math.min(rect.height, clientY - rect.top));
    const contentX = (viewport.scrollLeft + anchorX) / old;
    const contentY = (viewport.scrollTop + anchorY) / old;
    zoom = next;
    requestAnimationFrame(() => {
      if (!viewport) return;
      viewport.scrollLeft = Math.max(0, contentX * next - anchorX);
      viewport.scrollTop = Math.max(0, contentY * next - anchorY);
    });
  }
  function zoomAtCentre(value: number) { zoomAround(value); }
  function resetZoom() {
    zoom = 1;
    requestAnimationFrame(() => { if (viewport) { viewport.scrollLeft = 0; viewport.scrollTop = 0; } });
  }
  function handleWheel(event: WheelEvent) {
    const factor = Math.exp(-event.deltaY * 0.00135);
    zoomAround(zoom * factor, event.clientX, event.clientY);
  }
  function pointerDistance(): number {
    const pts = [...plotPointers.values()];
    return pts.length < 2 ? 0 : Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }
  function pointerCentre(): { x: number; y: number } | null {
    const pts = [...plotPointers.values()];
    if (pts.length < 2) return null;
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }
  function startPlotPointer(event: PointerEvent) {
    if (!viewport || (event.pointerType === 'mouse' && event.button !== 0)) return;
    inspectPointer(event);
    plotPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try { viewport.setPointerCapture(event.pointerId); } catch {}
    if (plotPointers.size === 1) {
      panPointerId = event.pointerId;
      panStart = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    } else if (plotPointers.size === 2) {
      panPointerId = null;
      pinchDistance = pointerDistance();
    }
  }
  function inspectPointer(event: PointerEvent) {
    if (!svgEl || !viewport || !sounding?.nodes?.length) return;
    const rect = svgEl.getBoundingClientRect();
    const sx = (event.clientX - rect.left) / Math.max(1, rect.width) * 330;
    const sy = (event.clientY - rect.top) / Math.max(1, rect.height) * 390;
    if (sx < 48 || sx > 310 || sy < 22 || sy > 342) { if (!plotPointers.size) hoverNode = null; return; }
    let nearest = sounding.nodes[0], distance = Math.abs(nearest.y - sy);
    for (let i = 1; i < sounding.nodes.length; i++) {
      const d = Math.abs(sounding.nodes[i].y - sy);
      if (d < distance) { nearest = sounding.nodes[i]; distance = d; }
    }
    hoverNode = { ...nearest };
  }
  function leavePlot() {
    if (!plotPointers.size) hoverNode = null;
  }
  function movePlotPointer(event: PointerEvent) {
    inspectPointer(event);
    if (!viewport || !plotPointers.has(event.pointerId)) return;
    plotPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (plotPointers.size >= 2) {
      const distance = pointerDistance(), centre = pointerCentre();
      if (pinchDistance > 0 && distance > 0 && centre) zoomAround(zoom * (distance / pinchDistance), centre.x, centre.y);
      pinchDistance = distance;
      event.preventDefault();
      return;
    }
    if (panPointerId === event.pointerId && zoom > 1.001) {
      viewport.scrollLeft = panStart.left - (event.clientX - panStart.x);
      viewport.scrollTop = panStart.top - (event.clientY - panStart.y);
      event.preventDefault();
    }
  }
  function endPlotPointer(event: PointerEvent) {
    plotPointers.delete(event.pointerId);
    try { viewport?.releasePointerCapture(event.pointerId); } catch {}
    if (plotPointers.size < 2) pinchDistance = 0;
    if (panPointerId === event.pointerId) panPointerId = null;
    if (plotPointers.size === 1 && viewport) {
      const [id, p] = [...plotPointers.entries()][0];
      panPointerId = id;
      panStart = { x: p.x, y: p.y, left: viewport.scrollLeft, top: viewport.scrollTop };
    }
  }
  function handleViewportKey(event: KeyboardEvent) {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomAtCentre(zoom * 1.25); }
    else if (event.key === '-') { event.preventDefault(); zoomAtCentre(zoom / 1.25); }
    else if (event.key === '0' || event.key === 'Escape') { event.preventDefault(); resetZoom(); }
  }

  async function downloadPng() {
    if (!svgEl || pngBusy) return;
    pngBusy = true;
    try {
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '1320'); clone.setAttribute('height', '1560');
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = 'text{font-family:Arial,sans-serif}.plot-bg{fill:#0d171d;stroke:#263a46}.terrain-zone{fill:#392716;opacity:.32}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-text{fill:#ffbd75;font-size:7px}.snowline-marker{stroke:#69d4ff;stroke-width:1.5;stroke-dasharray:4 3}.snowline-tag-bg{fill:#102b36}.snowline-tag{fill:#aeeaff;font-size:7px;font-weight:700}.temp-grid{stroke:#2a3c46}.temp-grid.zero{stroke:#75caef;stroke-width:1.3}.pressure-grid{stroke:#2a3c46}.axis{fill:#94a7b1;font-size:7px}.temp-line{fill:none;stroke:#ff765f;stroke-width:2.4}.dew-line{fill:none;stroke:#72d98b;stroke-width:2.1}.wetbulb-line{fill:none;stroke:#69d4ff;stroke-width:1.7;stroke-dasharray:4 3}.temp-dot{fill:#ff765f}.dew-dot{fill:#72d98b}';
      clone.insertBefore(style, clone.firstChild);
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob), img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Sounding image failed')); img.src = url; });
      const canvas = document.createElement('canvas'); canvas.width = 1320; canvas.height = 1760; const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No canvas');
      ctx.fillStyle = '#0b141a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff'; ctx.font = '700 48px Arial'; ctx.fillText('Wintry forecast · sounding', 54, 70);
      ctx.fillStyle = '#c3d0d7'; ctx.font = '26px Arial'; ctx.fillText(placeName || 'Selected point', 54, 112);
      ctx.fillStyle = '#6ecdf2'; ctx.font = '22px Arial'; ctx.fillText(validLabel, 54, 148);
      ctx.drawImage(img, 0, 170, 1320, 1560); URL.revokeObjectURL(url);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(v => v ? resolve(v) : reject(new Error('PNG failed')), 'image/png'));
      const href = URL.createObjectURL(png), a = document.createElement('a'); a.href = href; a.download = `wintry-sounding-${(placeName || 'point').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(href), 30000);
    } catch (e) { console.warn('Wintry forecast sounding PNG failed', e); } finally { pngBusy = false; }
  }

  function buildSounding(p: any, terrain: number | null, target: number): SoundingData | null {
    if (!p?.times?.length) return null;
    const idx = nearestIndex(p.times, target);
    let profile: ProfilePoint[];
    try { profile = buildProfile(p.forecast, idx).filter(v => Number.isFinite(v.heightM) && Number.isFinite(v.tempC) && Number.isFinite(v.dewpointC) && Number.isFinite(v.wetBulbC)).sort((a, b) => a.heightM - b.heightM); } catch { return null; }
    if (profile.length < 3) return null;

    const bottomH = Math.min(...profile.map(v => v.heightM)), topH = Math.max(...profile.map(v => v.heightM));
    const temps = profile.flatMap(v => [v.tempC, v.dewpointC, v.wetBulbC]);
    let minT = Math.floor((Math.min(...temps) - 4) / 10) * 10, maxT = Math.ceil((Math.max(...temps) + 4) / 10) * 10;
    minT = Math.min(minT, -20); maxT = Math.max(maxT, 10); if (maxT - minT < 40) maxT = minT + 40;
    const x = (t: number) => 48 + (t - minT) / Math.max(1, maxT - minT) * 262;
    const y = (h: number) => 342 - (h - bottomH) / Math.max(1, topH - bottomH) * 320;
    const tempPoints = profile.map(v => `${x(v.tempC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');
    const dewPoints = profile.map(v => `${x(v.dewpointC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');
    const wetBulbPoints = profile.map(v => `${x(v.wetBulbC).toFixed(1)},${y(v.heightM).toFixed(1)}`).join(' ');
    const nodes = profile.map(v => ({ tx:x(v.tempC), dx:x(v.dewpointC), wx:x(v.wetBulbC), y:y(v.heightM), pressure:v.pressureHpa, height:v.heightM, temp:v.tempC, dew:v.dewpointC, wet:v.wetBulbC }));
    const tempGrid: { x: number; value: number }[] = []; for (let t = Math.ceil(minT / 10) * 10; t <= maxT; t += 10) tempGrid.push({ x: x(t), value: t });
    const pressureLevels = [1000, 925, 850, 700, 500, 300, 200];
    const pressureGrid = pressureLevels.map(level => {
      const nearest = [...profile].sort((a, b) => Math.abs(a.pressureHpa - level) - Math.abs(b.pressureHpa - level))[0];
      return { y: y(nearest.heightM), label: `${level}` };
    });
    const terrainY = terrain !== null && Number.isFinite(terrain) && terrain >= bottomH && terrain <= topH ? y(terrain) : null;
    const wbz = wetBulbZeroHeight(profile);
    const snowlineM = wbz.snowLevelM !== null && Number.isFinite(wbz.snowLevelM) ? wbz.snowLevelM : null;
    const snowlineY = snowlineM !== null && snowlineM >= bottomH && snowlineM <= topH ? y(snowlineM) : null;
    const precip = precipMmAt(p.forecast, idx);
    const hasPrecip = precip !== null && precip >= PRECIP_THRESHOLD_MM_H;
    const diagnostics = terrain !== null && Number.isFinite(terrain) ? terrainDiagnostics(profile, terrain) : null;
    const phase = hasPrecip && terrain !== null && Number.isFinite(terrain) ? terrainPrecipitationType(profile, terrain) : null;
    return {
      tempPoints, dewPoints, wetBulbPoints, nodes, tempGrid, pressureGrid, terrainY, snowlineY,
      surfaceTw: diagnostics ? `${diagnostics.extrapolated ? '~' : ''}${formatTemperature(diagnostics.wetBulbC,units)}` : '—',
      snowline: snowlineM === null ? 'WBZ unresolved' : formatElevation(snowlineM,units),
      warmEnergy: phase ? `${Math.round(phase.meltingDegreeMetres)} °C·m` : '—',
      coldEnergy: phase ? `${Math.round(phase.refreezingDegreeMetres)} °C·m` : '—',
      phaseLabel: phase ? `${phase.icon} ${phase.label}` : 'Dry',
      phaseDetail: phase ? phase.detail : 'No meaningful precipitation at this time',
      phaseKey: phase?.key ?? null,
    };
  }

  onMount(() => {
    if (!embedded) { const width = Math.min(390, window.innerWidth - 12); position = { x: Math.max(6, window.innerWidth - width - 16), y: window.innerWidth <= 520 ? 38 : 66 }; }
    try { const t = store.get('timestamp'); if (typeof t === 'number') timestamp = t; timestampListener = store.on('timestamp', (v: any) => { const n = Number(v); if (Number.isFinite(n)) timestamp = n; }); } catch {}
  });
  onDestroy(() => {
    plotPointers.clear();
    window.removeEventListener('pointermove', dragMove);
    if (timestampListener !== null) try { store.off(timestampListener); } catch {}
  });
</script>

<style lang="less">
  .sounding-shell{position:fixed;z-index:10025;width:min(390px,calc(100vw - 12px));padding:10px 11px;border:1px solid rgba(139,213,244,.34);border-radius:13px;background:linear-gradient(180deg,rgba(14,23,30,.995),rgba(8,15,20,.995));color:#fff;box-shadow:0 16px 42px rgba(0,0,0,.56)}
  .sounding-shell.sounding-embedded{position:relative;left:auto!important;top:auto!important;z-index:auto;width:100%;box-sizing:border-box;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
  .sounding-shell.sounding-embedded .sounding-hover{top:54px;right:10px}
  .sounding-embedded .embedded-head{justify-content:flex-end;margin-bottom:4px}
  .sounding-embedded .sounding-viewport{max-height:none;overflow:hidden;cursor:default}.sounding-embedded .sounding-viewport.zoomed{max-height:56vh;overflow:auto;cursor:grab}
  .head{display:flex;justify-content:space-between;gap:8px}.head>div:first-child{min-width:0;flex:1}.head b{display:block;font-size:14px}.head small,.head em{display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:normal}.head small{margin-top:2px;color:#a8b7c0;font-size:8px}.head em{margin-top:2px;color:#6ecdf2;font-size:7.5px}.actions{display:flex;gap:3px;align-items:flex-start}.actions button{min-width:25px;height:27px;padding:0 5px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:rgba(255,255,255,.07);color:#fff;font-size:13px;font-weight:800;cursor:pointer}.actions button:hover{background:rgba(105,212,255,.14)}.actions .png{font-size:7px;padding:0 6px}.actions .zoom-readout{min-width:43px;font-size:7px}.drag{cursor:grab!important;touch-action:none}
  .phase-banner{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:2px 8px;margin-top:5px;padding:7px 9px;border:1px solid rgba(255,255,255,.08);border-left:3px solid #82939d;border-radius:8px;background:rgba(255,255,255,.035)}.phase-banner small{grid-row:1/3;color:#7e8f99;font-size:6px;text-transform:uppercase;letter-spacing:.3px}.phase-banner b{font-size:10px}.phase-banner em{color:#a9b7bf;font-size:6.7px;font-style:normal}.phase-banner.snow{border-left-color:#f4f7fb}.phase-banner.wet-snow{border-left-color:#6bd47f}.phase-banner.mix{border-left-color:#f2d84f}.phase-banner.rain{border-left-color:#4f82ff}.phase-banner.ice{border-left-color:#a8753e}.phase-banner.freezing-rain{border-left-color:#a867e8}.phase-banner.dry{opacity:.82}
  .sounding-viewport{max-height:430px;overflow:auto;margin-top:6px;border-radius:9px;overscroll-behavior:contain;touch-action:none;cursor:grab;scrollbar-width:thin}.sounding-viewport:active{cursor:grabbing}.sounding-viewport:focus-visible{outline:1px solid rgba(105,212,255,.55);outline-offset:2px}.sounding-viewport svg{display:block;min-width:100%;height:auto;margin:0;transform-origin:top left;user-select:none;-webkit-user-select:none}.plot-bg{fill:#0d171d;stroke:#263a46}.terrain-zone{fill:rgba(255,174,86,.08)}.terrain-line{stroke:#ffae56;stroke-width:1.5;stroke-dasharray:5 4}.terrain-text{fill:#ffbd75;font-size:7px}.snowline-marker{stroke:#69d4ff;stroke-width:1.5;stroke-dasharray:4 3}.snowline-tag-bg{fill:rgba(16,43,54,.94)}.snowline-tag{fill:#aeeaff;font-size:7px;font-weight:800}.temp-grid{stroke:rgba(154,181,196,.10)}.temp-grid.zero{stroke:rgba(117,202,239,.5);stroke-width:1.3}.pressure-grid{stroke:rgba(154,181,196,.12)}.axis{fill:#758995;font-size:7px;font-family:sans-serif}.temp-line{fill:none;stroke:#ff765f;stroke-width:2.4}.dew-line{fill:none;stroke:#72d98b;stroke-width:2.1}.wetbulb-line{fill:none;stroke:#69d4ff;stroke-width:1.7;stroke-dasharray:4 3}.temp-dot{fill:#ff765f}.dew-dot{fill:#72d98b}
  .key{display:flex;flex-wrap:wrap;gap:5px 10px;margin:4px 2px 6px;color:#a0b0ba;font-size:7px}.key span{display:flex;align-items:center;gap:4px}.key i{display:inline-block;width:13px;border-top:2px solid}.key .t{border-color:#ff765f}.key .d{border-color:#72d98b}.key .w{border-color:#69d4ff;border-top-style:dashed}.key .z{border-color:#75caef}
  .stats{display:grid;grid-template-columns:repeat(2,1fr);gap:4px}.stats span{padding:5px 2px;border-radius:7px;background:rgba(255,255,255,.035);text-align:center}.stats small{display:block;color:#71838e;font-size:5.6px}.stats b{display:block;margin-top:2px;font-size:6.7px;white-space:nowrap}.hint{margin-top:5px;color:#60717b;font-size:6.2px;text-align:center}.empty{padding:30px 8px;text-align:center;color:#82939d;font-size:9px}
  @media(max-width:520px){.sounding-shell{width:calc(100vw - 12px);padding:9px}.head small,.head em{max-width:125px}.stats b{font-size:6.3px}.sounding-viewport{max-height:55vh}.actions{gap:2px}.actions button{min-width:24px;height:26px}.actions .png{display:none!important}.actions .zoom-readout{min-width:38px}.phase-banner em{font-size:6.2px}}

  .hover-level{stroke:rgba(255,255,255,.58);stroke-width:1;stroke-dasharray:2 2}.hover-temp{fill:#0d171d;stroke:#ff765f;stroke-width:2}.hover-dew{fill:#0d171d;stroke:#72d98b;stroke-width:2}.hover-wet{fill:#0d171d;stroke:#69d4ff;stroke-width:2}.sounding-hover{position:absolute;z-index:6;top:78px;right:14px;display:grid;grid-template-columns:repeat(3,auto);gap:4px 8px;width:160px;max-width:calc(100% - 28px);box-sizing:border-box;padding:7px 8px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(5,10,14,.96);box-shadow:0 8px 22px rgba(0,0,0,.48);pointer-events:none}.sounding-hover b{grid-column:1/-1;color:#eaf5fa;font-size:8px}.sounding-hover span{color:#aebcc4;font-size:7px;font-weight:750}
</style>
