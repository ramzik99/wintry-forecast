import { buildProfile, wetBulbZeroHeight } from './snowLevel';
import { precipMmAt, PRECIP_THRESHOLD_MM_H } from './precip';
import { terrainPrecipitationType, type TerrainPrecipConfidence, type TerrainPrecipType, type TerrainPrecipTypeKey } from './precipType';
import { estimateNewSnowStep } from './snowAccum';

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
}

const MAX_EVENT_GAP_HOURS = 3;
const WINTRY_KEYS = new Set<TerrainPrecipTypeKey>(['snow', 'wet-snow', 'mix', 'ice-pellets', 'freezing-rain']);
const CONFIDENCE_SCORE: Record<TerrainPrecipConfidence, number> = { low: 1, medium: 2, high: 3 };

function nearestIndex(times: number[], target: number): number {
  let best = 0;
  let dist = Infinity;
  times.forEach((t, i) => {
    const d = Math.abs(t - target);
    if (d < dist) {
      best = i;
      dist = d;
    }
  });
  return best;
}

function diagnosedPhase(point: any, index: number, terrainM: number): TerrainPrecipType | null {
  const precip = precipMmAt(point.forecast, index);
  if (precip === null || precip < PRECIP_THRESHOLD_MM_H) return null;
  return terrainPrecipitationType(buildProfile(point.forecast, index), terrainM);
}

function aggregateConfidence(event: Array<{ precip: number; phase: TerrainPrecipType }>): EventConfidence {
  let weight = 0;
  let score = 0;
  let lowWeight = 0;
  for (const step of event) {
    const w = Math.max(step.precip, PRECIP_THRESHOLD_MM_H);
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
  const horizonEnd = Math.min(times[times.length - 1], fromTime + horizonHours * 3600_000);
  const first = Math.max(0, nearestIndex(times, fromTime));
  const qualifying: Array<{ index: number; time: number; precip: number; phase: TerrainPrecipType }> = [];

  for (let i = first; i < times.length && times[i] <= horizonEnd + 60_000; i++) {
    if (times[i] < fromTime - 90 * 60_000) continue;
    const precip = precipMmAt(point.forecast, i);
    if (precip === null || precip < PRECIP_THRESHOLD_MM_H) continue;
    const phase = diagnosedPhase(point, i, terrainM);
    if (!phase || !WINTRY_KEYS.has(phase.key)) continue;
    qualifying.push({ index: i, time: times[i], precip, phase });
  }

  if (!qualifying.length) return null;

  const event = [qualifying[0]];
  for (let i = 1; i < qualifying.length; i++) {
    const gapH = (qualifying[i].time - event[event.length - 1].time) / 3600_000;
    if (gapH > MAX_EVENT_GAP_HOURS) break;
    event.push(qualifying[i]);
  }

  const startTime = event[0].time;
  const endTime = event[event.length - 1].time + 3 * 3600_000;
  let peak = event[0];
  let minSnowlineM: number | null = null;
  const phaseWeights = new Map<TerrainPrecipTypeKey, { weight: number; phase: TerrainPrecipType }>();

  for (const step of event) {
    if (step.precip > peak.precip) peak = step;
    const snowline = wetBulbZeroHeight(buildProfile(point.forecast, step.index)).snowLevelM;
    if (snowline !== null && Number.isFinite(snowline)) minSnowlineM = minSnowlineM === null ? snowline : Math.min(minSnowlineM, snowline);
    const current = phaseWeights.get(step.phase.key);
    phaseWeights.set(step.phase.key, { weight: (current?.weight ?? 0) + Math.max(step.precip, PRECIP_THRESHOLD_MM_H), phase: current?.phase ?? step.phase });
  }

  let dominant = event[0].phase;
  let dominantWeight = -1;
  for (const value of phaseWeights.values()) {
    if (value.weight > dominantWeight) {
      dominantWeight = value.weight;
      dominant = value.phase;
    }
  }

  let snowpack = 0;
  const startIndex = event[0].index;
  const endIndex = event[event.length - 1].index;
  for (let i = startIndex; i <= endIndex; i++) {
    const phase = diagnosedPhase(point, i, terrainM);
    const precip = precipMmAt(point.forecast, i);
    const dt = 3;
    snowpack = estimateNewSnowStep(precip, phase, snowpack, dt).cumulativeCm;
  }

  return {
    startTime,
    endTime,
    peakTime: peak.time,
    peakPrecipMm3h: peak.precip,
    minSnowlineM: minSnowlineM === null ? null : Math.round(minSnowlineM / 10) * 10,
    newSnowCm: snowpack,
    dominantPhase: dominant,
    confidence: aggregateConfidence(event),
    activeNow: fromTime >= startTime - 90 * 60_000 && fromTime <= endTime + 90 * 60_000,
  };
}
