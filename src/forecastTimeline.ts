import { valueAt } from './snowLevel';
import { forecastIntervalHours } from './forecastTime';

const HOUR = 3600_000;

/** Reject malformed axes instead of shifting weather values onto other times. */
export function buildForecastTimes(data: Record<string, unknown>, refTime: number | null): number[] {
  const length = Number((data.hours as any)?.length);
  if (!Number.isInteger(length) || length <= 0) return [];
  const times: number[] = [];
  for (let i = 0; i < length; i++) {
    const raw = valueAt(data.hours, i);
    if (raw === null) return [];
    const time = raw > 1e12 ? raw : raw > 1e9 ? raw * 1000 : refTime === null ? NaN : refTime + raw * HOUR;
    if (!Number.isFinite(time) || (i > 0 && time <= times[i - 1])) return [];
    times.push(time);
  }
  return times.filter(time => time <= times[0] + 144 * HOUR);
}

export function intervalEnd(times: number[], index: number): number {
  return Math.min(times[0] + 144 * HOUR, times[index] + forecastIntervalHours(times, index) * HOUR);
}

/** A total for a requested window requires continuous, known intervals. */
export function coversWindow(times: number[], known: boolean[], start: number, end: number): boolean {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return false;
  let covered = start;
  for (let i = 0; i < times.length && times[i] < end; i++) {
    const until = intervalEnd(times, i);
    if (until <= start) continue;
    if (times[i] > covered || !known[i]) return false;
    covered = Math.max(covered, until);
    if (covered >= end) return true;
  }
  return false;
}
