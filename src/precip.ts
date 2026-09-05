import { valueAt } from './snowLevel';

/**
 * Windy's precipitation feed used by this plugin is normalized onto a 3-hour
 * accumulation-equivalent basis internally. Prefer the explicit past-3-hour field and
 * keep the returned value as a 3-hour-equivalent amount rather than presenting
 * it internally as an hourly rate.
 */
const EXACT_KEYS = [
  'past3hprecip-surface',
  'past1hprecip-surface',
  'precip-surface',
  'rain-surface',
  'precipitation-surface',
  'precipitation',
  'precip',
  'rain',
  'tp',
] as const;

const METRE_WATER_KEYS = new Set([
  'past3hprecip-surface',
  'past1hprecip-surface',
]);

/** Minimum normalized 3-hour-equivalent amount used for ptype diagnosis. */
export const PRECIP_THRESHOLD_MM_3H = 0.1;

/** @deprecated Use PRECIP_THRESHOLD_MM_3H; retained for source compatibility. */
export const PRECIP_THRESHOLD_MM_H = PRECIP_THRESHOLD_MM_3H;

type PrecipField = { key: string; field: unknown };
const precipFieldCache = new WeakMap<object, PrecipField | null>();

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[_\s]/g, '-');
}

function isPrecipKey(key: string): boolean {
  const normalized = normalizedKey(key);
  if ((EXACT_KEYS as readonly string[]).includes(normalized)) return true;
  return (normalized.includes('precip') || normalized === 'rain' || normalized.startsWith('rain-') || normalized === 'tp')
    && !normalized.includes('type')
    && !normalized.includes('snow');
}

function looksArrayLike(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (ArrayBuffer.isView(value as any)) return Number((value as any)?.length) > 0;
  return !!value && typeof value === 'object' && Number.isFinite(Number((value as any)?.length));
}

function findPrecipFieldUncached(value: unknown, depth = 0): PrecipField | null {
  if (!value || typeof value !== 'object' || depth > 5) return null;
  const object = value as Record<string, unknown>;

  for (const wanted of EXACT_KEYS) {
    for (const [key, field] of Object.entries(object)) {
      if (normalizedKey(key) === wanted && looksArrayLike(field)) return { key, field };
    }
  }

  // Compatibility fallback for unfamiliar precipitation aliases. Windy's
  // displayed precipitation values are treated as 3-hour-equivalent amounts.
  for (const [key, field] of Object.entries(object)) {
    if (isPrecipKey(key) && looksArrayLike(field)) return { key, field };
  }

  for (const child of Object.values(object)) {
    if (child && typeof child === 'object' && !looksArrayLike(child)) {
      const found = findPrecipFieldUncached(child, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function findPrecipField(data: Record<string, unknown>): PrecipField | null {
  const cached = precipFieldCache.get(data);
  if (cached !== undefined) return cached;
  const found = findPrecipFieldUncached(data);
  precipFieldCache.set(data, found);
  return found;
}

function toThreeHourlyMillimetres(key: string, raw: number): number {
  const normalized = normalizedKey(key);
  const millimetres = METRE_WATER_KEYS.has(normalized) ? raw * 1000 : raw;
  // If only Windy's explicit one-hour field is available, convert it to a
  // three-hour-equivalent amount so the rest of the UI keeps one unit.
  return normalized === 'past1hprecip-surface' ? millimetres * 3 : millimetres;
}

/** Precipitation amount in millimetres per 3-hour-equivalent period. */
export function precipMmAt(data: Record<string, unknown>, index: number): number | null {
  if ('__precipMm3h' in data) return valueAt(data.__precipMm3h,index);
  const found = findPrecipField(data);
  if (!found) return null;
  const raw = valueAt(found.field, index);
  if (raw === null || !Number.isFinite(raw)) return null;
  return Math.max(0, toThreeHourlyMillimetres(found.key, raw));
}

export function precipFieldName(data: Record<string, unknown>): string | null {
  return findPrecipField(data)?.key ?? null;
}

/** Human-readable source period; a rate conversion does not create hourly detail. */
export function precipPeriodLabel(data: Record<string, unknown>): string {
  if ('__precipPeriodsH' in data) {
    const periods=(data.__precipPeriodsH as (number|null)[]).filter(v=>v!==null);
    return periods.length===0?'Precipitation unavailable':periods.every(v=>v===3)?'Precipitation: 3-hour totals':'Precipitation: 3-hour equivalent';
  }
  const key = precipFieldName(data);
  if (key === null) return 'Precipitation unavailable';
  return normalizedKey(key) === 'past1hprecip-surface'
    ? 'Precipitation: 3-hour equivalent'
    : 'Precipitation: 3-hour totals';
}

export function formatPrecipMm(mm: number): string {
  if (mm < 0.005) return '0';
  if (mm < 0.1) return mm.toFixed(2).replace(/0$/, '');
  if (mm < 1) return mm.toFixed(1);
  if (mm < 10) return mm.toFixed(1).replace(/\.0$/, '');
  return String(Math.round(mm));
}
