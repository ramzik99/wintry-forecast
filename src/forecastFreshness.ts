export const PROFILE_CACHE_TTL_MS = 15 * 60_000;

export function isOlderRun(run: number | null, activeRun: number | null): boolean {
  return run !== null && activeRun !== null && run < activeRun - 60_000;
}

export function profileIsFresh(fetchedAt: number, run: number | null, activeRun: number | null, now = Date.now()): boolean {
  return Number.isFinite(fetchedAt) && now >= fetchedAt && now - fetchedAt < PROFILE_CACHE_TTL_MS &&
    (activeRun === null || (run !== null && Math.abs(run - activeRun) < 60_000));
}
