export const AUTO_REFRESH_MS = 15 * 60_000;
export const RETRY_REFRESH_MS = 2 * 60_000;

export function automaticRefreshDue(state: {
  enabled: boolean; busy: boolean; hidden: boolean; online: boolean;
  failed: boolean; lastAttempt: number;
}, now = Date.now()): boolean {
  if (!state.enabled || state.busy || state.hidden || !state.online) return false;
  const elapsed = now - state.lastAttempt;
  return elapsed < 0 || elapsed >= (state.failed ? RETRY_REFRESH_MS : AUTO_REFRESH_MS);
}
