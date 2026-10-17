import type { TerrainPrecipType } from './precipType';

/** Forecast-created layer only; no initial snow cover is assumed. */
export interface SnowLayer { sweMm: number; depthCm: number }
export interface SnowBudgetStep {
  layer: SnowLayer;
  snowfallCm: number;
  snowfallSweMm: number;
  meltMm: number;
  complete: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Fresh-snow ratio for the snow portion of the precipitation.
 *
 * SLR is kept separate from precipitation phase fraction so mixed/wet snow is
 * not penalised twice.
 */
export function snowToLiquidRatio(phase: TerrainPrecipType): number {
  const tw = phase.surfaceWetBulbC;

  if (phase.key === 'snow') {
    if (tw <= -8) return 18;
    if (tw <= -5) return 15;
    if (tw <= -3) return 12;
    if (tw <= -1) return 9;
    return 7;
  }

  if (phase.key === 'wet-snow') {
    if (tw <= -0.5) return 7.5;
    if (tw <= 0.2) return 6;
    return 4.5;
  }

  // For a rain/snow mix this is the ratio of the snow component only. The
  // amount assigned to that component is handled separately below.
  if (phase.key === 'mix') return 6;

  // Ice pellets are wintry precipitation, but they are not "new snow".
  return 0;
}

/** Fraction of liquid-equivalent precipitation represented by falling snow. */
export function snowFraction(phase: TerrainPrecipType): number {
  const tw = phase.surfaceWetBulbC;

  if (phase.key === 'snow') return 1;

  if (phase.key === 'wet-snow') {
    if (tw <= 0) return 0.95;
    if (tw <= 0.6) return 0.85;
    return 0.75;
  }

  if (phase.key === 'mix') {
    // Use the diagnosed positive wet-bulb energy to vary the snow share. A
    // shallow/weak warm layer retains more snow than a nearly fully melting
    // profile.
    const warmDM = Math.max(0, phase.meltingDegreeMetres);
    const fraction = 0.65 - 0.50 * clamp((warmDM - 150) / (1100 - 150), 0, 1);
    const surfaceAdjustment = tw > 0.8 ? 0.85 : 1;
    return clamp(fraction * surfaceAdjustment, 0.10, 0.65);
  }

  // Ice pellets, freezing rain and rain do not contribute to NEW SNOW depth.
  return 0;
}

/** Gross snowfall, independent of subsequent settling/melt. Ratios are heuristics. */
export function snowfallInput(precipMm3h: number | null, phase: TerrainPrecipType | null, hours: number) {
  if (!Number.isFinite(hours) || hours <= 0 || hours > 3 || precipMm3h === null ||
    !Number.isFinite(precipMm3h) || precipMm3h < 0) return null;
  if (precipMm3h === 0) return { sweMm: 0, depthCm: 0 };
  if (!phase || phase.confidence === 'low' || !Number.isFinite(phase.surfaceWetBulbC)) return null;
  const fraction = snowFraction(phase), ratio = snowToLiquidRatio(phase);
  if (![fraction, ratio].every(Number.isFinite)) return null;
  const sweMm = precipMm3h * hours / 3 * fraction;
  return { sweMm, depthCm: sweMm * ratio / 10 };
}

/**
 * Lightweight sensitivity estimate, not a surface-energy-balance snow model.
 * Settling changes volume only; melt removes equal water from SWE and outflow.
 * Local wet-bulb temperature is a melt proxy even in dry weather. Radiation,
 * ground heat, drifting, liquid retention and existing snow are not represented.
 * Fixed quarter-hour substeps keep hourly/three-hourly inputs consistent.
 */
export function snowBudgetStep(precipMm3h: number | null, phase: TerrainPrecipType | null,
  previous: SnowLayer, hours: number): SnowBudgetStep {
  const input = snowfallInput(precipMm3h, phase, hours);
  const validState = [previous.sweMm, previous.depthCm].every(v => Number.isFinite(v) && v >= 0) &&
    ((previous.sweMm === 0) === (previous.depthCm === 0));
  const invalid = { layer: { ...previous }, snowfallCm: 0, snowfallSweMm: 0, meltMm: 0, complete: false };
  if (!input || !validState) return invalid;
  // A missing thermal profile cannot support evolution of a non-empty layer.
  if ((!phase || !Number.isFinite(phase.surfaceWetBulbC)) && previous.sweMm > 0) return invalid;
  let sweMm = previous.sweMm, depthCm = previous.depthCm, meltMm = 0;
  const tw = phase?.surfaceWetBulbC ?? 0;
  const settle = tw >= -0.5 ? 0.010 : tw >= -3 ? 0.006 : 0.003;
  // Provisional degree-hour coefficient in mm SWE / (degree C hour).
  const meltRate = Math.min(2, 0.25 * Math.max(0, tw));
  const n = Math.ceil(hours / 0.25), dt = hours / n;
  for (let i = 0; i < n; i++) {
    sweMm += input.sweMm / n;
    depthCm += input.depthCm / n;
    const melt = Math.min(sweMm, meltRate * dt);
    if (sweMm > 0) depthCm *= (sweMm - melt) / sweMm;
    sweMm -= melt; meltMm += melt;
    depthCm *= Math.exp(-settle * dt);
    // Bound compaction at 450 kg/m³; it must never destroy water mass.
    depthCm = sweMm > 0 ? Math.max(depthCm, sweMm * 100 / 450) : 0;
  }
  return { layer: { sweMm, depthCm }, snowfallCm: input.depthCm,
    snowfallSweMm: input.sweMm, meltMm, complete: true };
}

export function formatNewSnowCm(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value < 0.05) return 'None';
  if (value < 10) return `${value.toFixed(1).replace(/\.0$/, '')} cm`;
  return `${Math.round(value)} cm`;
}
