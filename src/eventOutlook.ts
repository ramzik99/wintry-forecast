import { buildProfile, wetBulbZeroHeight } from './snowLevel';
import { isPrecipitating } from './precip';
import { type TerrainPrecipConfidence, type TerrainPrecipType, type TerrainPrecipTypeKey } from './precipType';
import { buildSnowForecast, snowForecastWindow } from './snowForecast';
import { supportedIntervalEnd } from './forecastIntervals';
import { forecastIntervalHours } from './forecastTime';

export type EventConfidence = 'high' | 'medium' | 'low';

export interface WintryEventSummary {
  startTime: number;
  endTime: number;
  peakTime: number;
  peakPrecipMm3h: number;
  minSnowlineM: number | null;
  newSnowCm: number;
  dominantPhase: TerrainPrecipType;
  confidence: EventConfidence;
  activeNow: boolean;
  incomplete: boolean;
}

const MAX_EVENT_GAP_HOURS = 3;
const WINTRY_KEYS = new Set<TerrainPrecipTypeKey>(['snow', 'wet-snow', 'mix', 'ice-pellets', 'freezing-rain']);
const CONFIDENCE_SCORE: Record<TerrainPrecipConfidence, number> = { low: 1, medium: 2, high: 3 };

function aggregateConfidence(event: Array<{ precip: number; phase: TerrainPrecipType }>): EventConfidence {
  let weight = 0;
  let score = 0;
  let lowWeight = 0;
  for (const step of event) {
    const w = step.precip;
    weight += w;
    score += CONFIDENCE_SCORE[step.phase.confidence] * w;
    if (step.phase.confidence === 'low') lowWeight += w;
  }
  if (!weight) return 'low';
  const mean = score / weight;
  if (lowWeight / weight >= 0.35 || mean < 1.65) return 'low';
  if (mean >= 2.55) return 'high';
  return 'medium';
}

/** Summarise the next terrain-relevant wintry precipitation event. */
export function nextWintryEvent(
  point: any,
  terrainM: number | null,
  fromTime: number,
  horizonHours = 144,
): WintryEventSummary | null {
  if (!point?.times?.length || terrainM === null || !Number.isFinite(terrainM)) return null;

  const times: number[] = point.times;
  const series = buildSnowForecast(point, terrainM);
  const horizonEnd = Math.min(times[0] + 144 * 3600_000,
    times.at(-1)! + forecastIntervalHours(times, times.length - 1) * 3600_000,
    fromTime + horizonHours * 3600_000);
  const qualifying: Array<{ index: number; time: number; precip: number; phase: TerrainPrecipType; liquidMm: number }> = [];

  for (let i = 0; i < times.length && times[i] < horizonEnd; i++) {
    const intervalEnd = supportedIntervalEnd(times, i, series.sourcePeriods);
    if (intervalEnd <= fromTime) continue;
    const precip = series.amounts[i];
    if (!isPrecipitating(precip)) continue;
    const phase = series.thermalPhases[i];
    if (!phase || !WINTRY_KEYS.has(phase.key)) continue;
    const hours = Math.max(0, Math.min(horizonEnd, intervalEnd) - Math.max(fromTime, times[i])) / 3600_000;
    if (hours > 0) qualifying.push({ index: i, time: times[i], precip, phase, liquidMm: precip * hours / 3 });
  }

  if (!qualifying.length) return null;

  const event = [qualifying[0]];
  for (let i = 1; i < qualifying.length; i++) {
    const gapH = (qualifying[i].time - event[event.length - 1].time) / 3600_000;
    if (gapH > MAX_EVENT_GAP_HOURS) break;
    event.push(qualifying[i]);
  }

  const startTime = event[0].time;
  const last = event[event.length - 1];
  const endTime = Math.min(horizonEnd, supportedIntervalEnd(times, last.index, series.sourcePeriods));
  let peak = event[0];
  let minSnowlineM: number | null = null;
  const phaseWeights = new Map<TerrainPrecipTypeKey, { weight: number; phase: TerrainPrecipType }>();

  for (const step of event) {
    if (step.precip > peak.precip) peak = step;
    const snowline = wetBulbZeroHeight(buildProfile(point.forecast, step.index)).snowLevelM;
    if (snowline !== null && Number.isFinite(snowline)) minSnowlineM = minSnowlineM === null ? snowline : Math.min(minSnowlineM, snowline);
    const current = phaseWeights.get(step.phase.key);
    phaseWeights.set(step.phase.key, { weight: (current?.weight ?? 0) + step.liquidMm, phase: current?.phase ?? step.phase });
  }

  let dominant = event[0].phase;
  let dominantWeight = -1;
  for (const value of phaseWeights.values()) {
    if (value.weight > dominantWeight) {
      dominantWeight = value.weight;
      dominant = value.phase;
    }
  }

  const snow = snowForecastWindow(series, Math.max(fromTime, startTime), endTime);

  return {
    startTime,
    endTime,
    peakTime: peak.time,
    peakPrecipMm3h: peak.precip,
    minSnowlineM: minSnowlineM === null ? null : Math.round(minSnowlineM / 10) * 10,
    newSnowCm: snow.snowfallCm ?? 0,
    dominantPhase: dominant,
    confidence: aggregateConfidence(event.map(step => ({ precip: step.liquidMm, phase: step.phase }))),
    activeNow: fromTime >= startTime && fromTime < endTime,
    incomplete: !snow.complete,
  };
}
