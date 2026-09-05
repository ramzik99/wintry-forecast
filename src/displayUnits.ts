export type UnitSystem = 'metric' | 'imperial';

export const UNITS_STORAGE_KEY = 'wintry:units:v1';

export function loadUnitSystem(): UnitSystem {
  try { return localStorage.getItem(UNITS_STORAGE_KEY) === 'imperial' ? 'imperial' : 'metric'; }
  catch { return 'metric'; }
}

export function saveUnitSystem(units: UnitSystem): void {
  try { localStorage.setItem(UNITS_STORAGE_KEY, units); } catch {}
}

export function metresToFeet(m: number): number { return m * 3.280839895; }
export function cmToInches(cm: number): number { return cm / 2.54; }
export function mmToInches(mm: number): number { return mm / 25.4; }
export function cToF(c: number): number { return c * 9 / 5 + 32; }

export function formatElevation(m: number | null, units: UnitSystem, stepM = 10): string {
  if (m === null || !Number.isFinite(m)) return '—';
  if (units === 'imperial') return `${Math.round(metresToFeet(m) / 50) * 50} ft`;
  return `${Math.round(m / stepM) * stepM} m`;
}

export function formatSnow(cm: number | null, units: UnitSystem): string {
  if (cm === null || !Number.isFinite(cm)) return '—';
  if (cm < 0.05) return 'None';
  if (units === 'imperial') {
    const value = cmToInches(cm);
    return value < 4 ? `${value.toFixed(1).replace(/\.0$/, '')} in` : `${Math.round(value)} in`;
  }
  return cm < 10 ? `${cm.toFixed(1).replace(/\.0$/, '')} cm` : `${Math.round(cm)} cm`;
}

export function formatPrecip(mm3h: number | null, units: UnitSystem): string {
  if (mm3h === null || !Number.isFinite(mm3h)) return '—';
  const hourly = mm3h;
  if (units === 'imperial') {
    const value = mmToInches(hourly);
    return `${value < 0.1 ? value.toFixed(2) : value.toFixed(1)} in/3h`;
  }
  return `${hourly < 10 ? hourly.toFixed(2).replace(/\.?0+$/, '') : Math.round(hourly)} mm/3h`;
}

export function formatTemperature(c: number | null, units: UnitSystem, digits = 1): string {
  if (c === null || !Number.isFinite(c)) return '—';
  const value = units === 'imperial' ? cToF(c) : c;
  return `${value.toFixed(digits)}°${units === 'imperial' ? 'F' : 'C'}`;
}
