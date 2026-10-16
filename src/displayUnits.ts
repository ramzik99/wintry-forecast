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
  if (cm === null || !Number.isFinite(cm) || cm < 0) return 'Unavailable';
  if (cm === 0) return 'None';
  if (units === 'imperial') {
    const value = cmToInches(cm);
    return value < 1 ? '<1 in' : `≈ ${Math.round(value)} in`;
  }
  return cm < 1 ? '<1 cm' : `≈ ${Math.round(cm)} cm`;
}

/** Display precision only; this rounding is not an uncertainty interval. */
export function formatSnowline(m: number | null, units: UnitSystem): string {
  if (m === null || !Number.isFinite(m)) return 'Unresolved';
  return units === 'imperial' ? `≈ ${Math.round(metresToFeet(m) / 500) * 500} ft`
    : `≈ ${Math.round(m / 100) * 100} m`;
}

export function formatPrecip(mm3h: number | null, units: UnitSystem): string {
  if (mm3h === null || !Number.isFinite(mm3h)) return '—';
  if(mm3h<0)return '—';
  const hourly = mm3h/3;
  if (units === 'imperial') {
    const value = mmToInches(hourly);
    if(value>0&&value<0.001)return '<0.001 in/h';
    return `${value.toFixed(value<0.1?3:2).replace(/\.?0+$/, '')} in/h`;
  }
  if(hourly>0&&hourly<0.01)return '<0.01 mm/h';
  return `${hourly < 10 ? hourly.toFixed(2).replace(/\.?0+$/, '') : Math.round(hourly)} mm/h`;
}

export function formatPrecipTotal(mm:number|null,units:UnitSystem):string{
  if(mm===null||!Number.isFinite(mm)||mm<0)return 'Unavailable';
  const value=units==='imperial'?mmToInches(mm):mm;
  if(value>0&&value<(units==='imperial'?0.01:0.1))return units==='imperial'?'<0.01 in':'<0.1 mm';
  return `${value.toFixed(units==='imperial'?2:1).replace(/\.?0+$/, '')} ${units==='imperial'?'in':'mm'}`;
}

export function formatTemperature(c: number | null, units: UnitSystem, digits = 1): string {
  if (c === null || !Number.isFinite(c)) return '—';
  const value = units === 'imperial' ? cToF(c) : c;
  return `${value.toFixed(digits)}°${units === 'imperial' ? 'F' : 'C'}`;
}
