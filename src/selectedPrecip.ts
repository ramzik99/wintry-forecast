import { alignPrecipIntervals } from './precipIntervals';
import { getPointForecastData } from '@windy/fetch';

export type SnowForecastModel = 'ecmwf';

function isNumericArrayLike(value: unknown): boolean {
  if (ArrayBuffer.isView(value as any)) return Number((value as any)?.length) > 0;
  if (!Array.isArray(value) || !value.length) return false;
  return value.some(item => typeof item === 'number' || typeof item === 'string');
}

function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/[_\s]/g, '-');
}

function isPrecipKey(key: string): boolean {
  const keyNormalised = normaliseKey(key);
  return (keyNormalised.includes('precip') || keyNormalised === 'rain' || keyNormalised.startsWith('rain-') || keyNormalised === 'tp')
    && !keyNormalised.includes('type')
    && !keyNormalised.includes('snow');
}

function collectFromRecordArray(items: unknown[], out: Record<string, unknown>) {
  if (!items.length || !items.every(item => !!item && typeof item === 'object' && !Array.isArray(item))) return;

  const keys = new Set<string>();
  for (const item of items as Record<string, unknown>[]) {
    for (const key of Object.keys(item)) if (isPrecipKey(key)) keys.add(key);
  }

  for (const key of keys) {
    const values = (items as Record<string, unknown>[]).map(item => {
      const raw = item[key];
      const number = typeof raw === 'number' ? raw : Number(raw);
      return Number.isFinite(number) ? number : null;
    });
    if (values.some(value => value !== null)) out[key] = values;
  }
}

function collectPrecipFields(value: unknown, out: Record<string, unknown>, depth = 0) {
  if (!value || typeof value !== 'object' || depth > 9) return;

  if (Array.isArray(value)) {
    collectFromRecordArray(value, out);
    for (const child of value) collectPrecipFields(child, out, depth + 1);
    return;
  }

  const object = value as Record<string, unknown>;
  if (Array.isArray(object.ts) && Array.isArray(object.precipAmount)) {
    out.__intervalTs=object.ts; out.__intervalPrecipMm=object.precipAmount;
  }
  for (const [key, field] of Object.entries(object)) {
    if (isPrecipKey(key) && isNumericArrayLike(field)) out[key] = field;
  }

  for (const child of Object.values(object)) {
    if (child && typeof child === 'object' && !isNumericArrayLike(child)) {
      collectPrecipFields(child, out, depth + 1);
    }
  }
}

/**
 * Load precipitation fields from Windy's ECMWF point feed.
 *
 * The meteogram response is authoritative for the vertical profile; this
 * supplemental request is only used to fill precipitation fields that are not
 * always exposed by the meteogram endpoint. No snow-depth request is made here:
 * the plugin's "new snow" product is calculated from forecast precipitation
 * and the terrain-aware precipitation-type diagnosis.
 */
export async function loadSelectedPrecipFields(
  lat: number,
  lon: number,
  days = 6,
  model: SnowForecastModel = 'ecmwf',
): Promise<Record<string, unknown>> {
  try {
    const response = await getPointForecastData(
      model,
      { lat, lon, step: 3, days, source: 'detail' } as any,
    );
    const out: Record<string, unknown> = {};
    collectPrecipFields(response as unknown, out);
    return out;
  } catch (error) {
    console.warn('Wintry forecast precipitation request failed', lat, lon, error);
    return {};
  }
}

export function alignSelectedPrecipFields(fields:Record<string,unknown>, targetTimes:number[]):Record<string,unknown>{
  if(Array.isArray(fields.__intervalTs)&&Array.isArray(fields.__intervalPrecipMm)){
    return alignPrecipIntervals(fields.__intervalTs as number[],fields.__intervalPrecipMm,targetTimes);
  }
  // Unknown time axes must not be merged by array index.
  return {};
}
