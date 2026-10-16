import { buildProfile } from './snowLevel';
import { supportedPrecipitationType, type TerrainPrecipType } from './precipType';
import { precipMmAt } from './precip';
import { forecastSlices, supportedIntervalEnd, HOUR_MS } from './forecastIntervals';
import { snowfallInput, snowBudgetStep, type SnowLayer } from './snowAccum';

type Point = { times: number[]; forecast: Record<string, unknown> };
export interface SnowForecast {
  times: number[];
  amounts: (number | null)[];
  /** Includes dry profiles for thermal evolution, unlike the visible type band. */
  thermalPhases: (TerrainPrecipType | null)[];
  sourcePeriods: unknown;
  cumulativeSnowfallCm: number[];
  prefix: number;
  ends: number[];
}

// Derived only once per forecast object / terrain; time-slider changes need no new profiles.
const cache = new WeakMap<object, Map<number, SnowForecast>>();

export function buildSnowForecast(point: Point, terrainM: number | null): SnowForecast {
  const key = terrainM !== null && Number.isFinite(terrainM) ? terrainM : NaN;
  let terrains = cache.get(point.forecast);
  const existing = terrains?.get(key);
  if (existing && existing.times === point.times) return existing;
  const amounts = point.times.map((_, i) => precipMmAt(point.forecast, i));
  const thermalPhases = point.times.map((_, i) => Number.isFinite(key)
    ? supportedPrecipitationType(buildProfile(point.forecast, i), key) : null);
  const sourcePeriods = point.forecast.__precipPeriodsH;
  const ends = point.times.map((_, i) => supportedIntervalEnd(point.times, i, sourcePeriods));
  const cumulativeSnowfallCm: number[] = [];
  let prefix = 0, running = 0;
  for (let i = 0; i < point.times.length; i++) {
    const hours = (ends[i] - point.times[i]) / HOUR_MS;
    const input = snowfallInput(amounts[i], thermalPhases[i], hours);
    if (i !== prefix || !input || !Number.isFinite(point.times[i]) ||
      (i > 0 && (point.times[i] <= point.times[i - 1] || point.times[i] > ends[i - 1]))) break;
    running += input.depthCm;
    cumulativeSnowfallCm.push(running);
    prefix++;
  }
  const result = { times: point.times, amounts, thermalPhases, sourcePeriods, cumulativeSnowfallCm, prefix, ends };
  if (!terrains) { terrains = new Map(); cache.set(point.forecast, terrains); }
  terrains.set(key, result);
  while (terrains.size > 4) terrains.delete(terrains.keys().next().value!);
  return result;
}

/** Shared by graph, event and exports. Snowfall and remaining layer are distinct. */
export function snowForecastWindow(series: SnowForecast, start: number, end: number) {
  const missing = { snowfallCm: null, snowfallSweMm: null, remainingLayerCm: null,
    remainingSweMm: null, meltMm: null, complete: false };
  const slices = forecastSlices(series.times, start, end, series.sourcePeriods);
  if (!slices) return missing;
  let snowfallCm = 0, snowfallSweMm = 0, meltMm = 0;
  let layer: SnowLayer = { sweMm: 0, depthCm: 0 }, retentionKnown = true;
  for (const slice of slices) {
    const p = series.amounts[slice.index], phase = series.thermalPhases[slice.index];
    const input = snowfallInput(p, phase, slice.hours);
    if (!input) return missing;
    snowfallCm += input.depthCm; snowfallSweMm += input.sweMm;
    if (retentionKnown) {
      const step = snowBudgetStep(p, phase, layer, slice.hours);
      retentionKnown = step.complete;
      if (retentionKnown) { layer = step.layer; meltMm += step.meltMm; }
    }
  }
  return { snowfallCm, snowfallSweMm, remainingLayerCm: retentionKnown ? layer.depthCm : null,
    remainingSweMm: retentionKnown ? layer.sweMm : null, meltMm: retentionKnown ? meltMm : null, complete: true };
}

/** Cumulative gross snowfall at the inspected time, without future interval leakage. */
export function snowfallAtTime(series: SnowForecast, time: number): number | null {
  if (!series.times.length || !Number.isFinite(time) || time < series.times[0]) return null;
  if (time === series.times[0]) return series.prefix ? 0 : null;
  return snowForecastWindow(series, series.times[0], time).snowfallCm;
}
