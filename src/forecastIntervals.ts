import { forecastIntervalHours } from './forecastTime';

export const HOUR_MS = 3600_000;

/** End of actual support, not the next available value across a gap. */
export function supportedIntervalEnd(times: number[], index: number, sourcePeriods?: unknown): number {
  const represented = forecastIntervalHours(times, index);
  const source = Array.isArray(sourcePeriods) ? sourcePeriods[index] : represented;
  if (typeof source !== 'number' || !Number.isFinite(source) || source <= 0 || source > 3) return times[index];
  return Math.min(times[0] + 144 * HOUR_MS, times[index] + Math.min(represented, source) * HOUR_MS);
}

export interface ForecastSlice { index: number; from: number; to: number; hours: number }

/** Continuous non-overlapping support for an exact window; never shorten a day. */
export function forecastSlices(times: number[], start: number, end: number, sourcePeriods?: unknown): ForecastSlice[] | null {
  if (!times.length || !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
    times.some((t, i) => !Number.isFinite(t) || (i > 0 && t <= times[i - 1]))) return null;
  const slices: ForecastSlice[] = [];
  let covered = start;
  for (let i = 0; i < times.length && times[i] < end; i++) {
    const until = supportedIntervalEnd(times, i, sourcePeriods);
    if (until <= start) continue;
    if (times[i] > covered) return null;
    const from = Math.max(start, covered, times[i]), to = Math.min(end, until);
    if (to > from) slices.push({ index: i, from, to, hours: (to - from) / HOUR_MS });
    covered = Math.max(covered, to);
    if (covered >= end) return slices;
  }
  return null;
}
