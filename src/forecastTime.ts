const HOUR_MS = 3600_000;

/** Profile timestamps represent interval starts, never the nearest future slot. */
export function forecastIntervalHours(times: number[], index: number): number {
  if (index < 0 || index >= times.length) return 0;
  const difference = index + 1 < times.length
    ? times[index + 1] - times[index]
    : index > 0 ? times[index] - times[index - 1] : 3 * HOUR_MS;
  return Number.isFinite(difference) && difference > 0 ? Math.min(3, difference / HOUR_MS) : 0;
}

export function forecastIntervalIndex(times: number[], target: number): number {
  if (!Number.isFinite(target)) return -1;
  for (let i = times.length - 1; i >= 0; i--) {
    if (times[i] <= target) {
      return target < times[i] + forecastIntervalHours(times, i) * HOUR_MS ? i : -1;
    }
  }
  return -1;
}
