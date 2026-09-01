import type { TerrainPrecipType } from './precipType';

export interface NewSnowStep {
  hourlyCm: number;
  cumulativeCm: number;
}

/**
 * Estimate forecast-created NEW snow depth.
 *
 * This is intentionally not total lying snow depth. It starts from zero and
 * converts forecast liquid precipitation into a terrain-aware fresh-snow
 * estimate, then applies simple settling and melt to that forecast-created
 * layer. The result should be treated as guidance, not model snow depth.
 *
 * Precipitation is supplied as a 3-hour liquid amount (mm/3h). The conversion
 * scales that amount by dt/3 so changing the forecast sampling interval does
 * not artificially multiply accumulation.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Fresh-snow ratio for the snow portion of the precipitation.
 *
 * Keep SLR separate from precipitation phase fraction: the previous scheme
 * used both a very low SLR and a reduced solid fraction for marginal snow,
 * effectively penalising mixed/wet snow twice.
 */
function snowToLiquidRatio(phase: TerrainPrecipType): number {
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
  // amount of precipitation assigned to that component is handled separately.
  if (phase.key === 'mix') return 6;

  // Ice pellets are wintry precipitation, but they are not "new snow".
  return 0;
}

/** Fraction of liquid-equivalent precipitation represented by falling snow. */
function snowFraction(phase: TerrainPrecipType): number {
  const tw = phase.surfaceWetBulbC;

  if (phase.key === 'snow') return 1;

  if (phase.key === 'wet-snow') {
    if (tw <= 0) return 0.95;
    if (tw <= 0.6) return 0.85;
    return 0.75;
  }

  if (phase.key === 'mix') {
    // Use the diagnosed positive wet-bulb energy to vary the snow share rather
    // than assigning every mixed event the same arbitrary fraction. A shallow
    // weak warm layer retains substantially more snow than a nearly fully
    // melting profile.
    const warmDM = Math.max(0, phase.meltingDegreeMetres);
    const fraction = 0.65 - 0.50 * clamp((warmDM - 150) / (1100 - 150), 0, 1);
    const surfaceAdjustment = tw > 0.8 ? 0.85 : 1;
    return clamp(fraction * surfaceAdjustment, 0.10, 0.65);
  }

  // Ice pellets, freezing rain and rain do not contribute to NEW SNOW depth.
  return 0;
}

export function estimateNewSnowStep(
  precipMm3h: number | null,
  phase: TerrainPrecipType | null,
  previousCm: number,
  hours = 1,
): NewSnowStep {
  const dt = Math.max(0.25, Math.min(6, Number(hours) || 1));
  let snowpack = Math.max(0, previousCm);

  if (!phase) {
    snowpack *= Math.pow(0.997, dt);
    return { hourlyCm: 0, cumulativeCm: snowpack };
  }

  const tw = phase.surfaceWetBulbC;

  // Fresh snow compacts fastest near the melting point and more slowly in a
  // colder boundary layer. This is deliberately modest because the plugin has
  // no full snowpack-energy model.
  const settlePerHour = tw >= -0.5 ? 0.010 : tw >= -3 ? 0.006 : 0.003;
  snowpack *= Math.pow(1 - settlePerHour, dt);

  // Simple temperature-dependent melt of forecast-created snow. This is not a
  // substitute for a surface-energy-balance snow model, so keep it bounded.
  if (tw > 0) {
    const meltCmH = Math.min(1.8, 0.18 + 0.22 * tw);
    snowpack = Math.max(0, snowpack - meltCmH * dt);
  }

  if (precipMm3h === null || !Number.isFinite(precipMm3h) || precipMm3h <= 0) {
    return { hourlyCm: 0, cumulativeCm: snowpack };
  }

  const slr = snowToLiquidRatio(phase);
  const fraction = snowFraction(phase);
  if (slr <= 0 || fraction <= 0) {
    return { hourlyCm: 0, cumulativeCm: snowpack };
  }

  // Convert the 3-hour liquid amount to the current dt interval before SLR.
  const liquidMm = Math.max(0, precipMm3h) * (dt / 3);
  const addedCm = liquidMm * slr * fraction / 10;
  snowpack += addedCm;

  return { hourlyCm: addedCm / dt, cumulativeCm: snowpack };
}

export function formatNewSnowCm(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value < 0.05) return 'None';
  if (value < 10) return `${value.toFixed(1).replace(/\.0$/, '')} cm`;
  return `${Math.round(value)} cm`;
}
