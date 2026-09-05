export const PRESSURE_LEVELS = [
  '1000h', '950h', '925h', '900h', '850h',
  '800h', '700h', '600h', '500h', '400h',
  '300h', '250h', '200h', '150h'
] as const;

export type PressureLevel = typeof PRESSURE_LEVELS[number];

export interface ProfilePoint {
  level: PressureLevel;
  pressureHpa: number;
  heightM: number;
  tempC: number;
  dewpointC: number;
  wetBulbC: number;
}

export interface SnowLevelResult {
  snowLevelM: number | null;
  status: 'resolved' | 'terrain-unavailable' | 'insufficient-profile' | 'below-lowest-level' | 'no-crossing';
  upperBoundM?: number;
  lower?: ProfilePoint;
  upper?: ProfilePoint;
  belowLowestLevel?: boolean;
}

/** Magnus saturation vapour pressure, hPa. */
function saturationVapourPressure(tempC: number): number {
  return 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
}

/**
 * Pressure-aware wet-bulb temperature from dry-bulb T, dew point Td and pressure.
 *
 * Solves the ventilated-psychrometer relation:
 * e(Td) = es(Tw) - A(Tw) * p * (T - Tw)
 *
 * using bisection between Td and T.
 */
export function wetBulbFromDewpoint(
  tempC: number,
  dewpointC: number,
  pressureHpa: number
): number {
  const td = Math.min(tempC, dewpointC);
  const e = saturationVapourPressure(td);

  const f = (tw: number) => {
    const A = 0.00066 * (1 + 0.00115 * tw);
    return saturationVapourPressure(tw) -
      A * pressureHpa * (tempC - tw) -
      e;
  };

  let lo = Math.min(td, tempC);
  let hi = Math.max(td, tempC);

  // In saturated air Tw ~= T.
  if (Math.abs(hi - lo) < 1e-6) return tempC;

  let flo = f(lo);
  let fhi = f(hi);

  // Defensive fallback if numerical bracketing is imperfect.
  if (!(flo <= 0 && fhi >= 0)) {
    lo = Math.min(td - 15, tempC - 30);
    hi = tempC;
    flo = f(lo);
    fhi = f(hi);
  }

  for (let n = 0; n < 60; n++) {
    const mid = 0.5 * (lo + hi);
    const fm = f(mid);

    if (Math.abs(fm) < 1e-5) return mid;

    if (fm > 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return 0.5 * (lo + hi);
}

/** Resolve WBZ using only levels at or above Windy's local map terrain (metres ASL).
 * This does not downscale the atmospheric profile or replace a model-surface mask.
 */
export function wetBulbZeroHeight(profile: ProfilePoint[], terrainM: number | null): SnowLevelResult {
  if (terrainM === null || !Number.isFinite(terrainM)) {
    return { snowLevelM: null, status: 'terrain-unavailable' };
  }
  const p = profile
    .filter(v => Number.isFinite(v.heightM) && Number.isFinite(v.wetBulbC) && v.heightM >= terrainM)
    .sort((a, b) => a.heightM - b.heightM);

  if (!p.length) return { snowLevelM: null, status: 'insufficient-profile' };
  if (p[0].wetBulbC === 0) {
    return { snowLevelM: p[0].heightM, status: 'resolved', lower: p[0], upper: p[0] };
  }
  // A cold lowest level does not resolve the lower crossing. It may be between
  // terrain and that level, below terrain, or absent from an entirely cold column.
  if (p[0].wetBulbC < 0) {
    return { snowLevelM: null, status: 'below-lowest-level',
      upperBoundM: p[0].heightM, belowLowestLevel: true };
  }
  if (p.length < 2) return { snowLevelM: null, status: 'insufficient-profile' };

  for (let i = 0; i < p.length - 1; i++) {
    const lower = p[i];
    const upper = p[i + 1];

    if (upper.heightM > lower.heightM && lower.wetBulbC > 0 && upper.wetBulbC <= 0) {
      const fraction =
        (0 - lower.wetBulbC) /
        (upper.wetBulbC - lower.wetBulbC);

      return {
        snowLevelM:
          lower.heightM +
          fraction * (upper.heightM - lower.heightM),
        lower,
        upper,
        belowLowestLevel: false,
        status: 'resolved',
      };
    }
  }

  return { snowLevelM: null, status: 'no-crossing' };
}

export function buildProfile(
  data: Record<string, unknown>,
  timeIndex: number
): ProfilePoint[] {
  const profile: ProfilePoint[] = [];

  for (const level of PRESSURE_LEVELS) {
    const t = valueAt(data[`temp-${level}`], timeIndex);
    const td = valueAt(data[`dewpoint-${level}`], timeIndex);
    const gh = valueAt(data[`gh-${level}`], timeIndex);

    if (t === null || td === null || gh === null) continue;

    const tempC = t > 150 ? t - 273.15 : t;
    const dewpointC = td > 150 ? td - 273.15 : td;
    const pressureHpa = Number(level.replace('h', ''));

    /*
     * Windy's meteogram `gh-*` values are geopotential HEIGHT.
     * Live values are on the normal metre scale (e.g. ~4 km at 600 hPa),
     * so do NOT divide by g.
     */
    const heightM = gh;

    profile.push({
      level,
      pressureHpa,
      heightM,
      tempC,
      dewpointC,
      wetBulbC: wetBulbFromDewpoint(tempC, dewpointC, pressureHpa),
    });
  }

  return profile.sort((a, b) => a.heightM - b.heightM);
}

/** Accept Arrays, TypedArrays, generic array-like values and scalars. */
export function valueAt(value: unknown, i: number): number | null {
  if (value == null) return null;

  let x: unknown;

  if (Array.isArray(value)) {
    x = value[i];
  } else if (ArrayBuffer.isView(value)) {
    x = (value as any)[i];
  } else if (typeof value === 'object' && 'length' in (value as any)) {
    x = (value as any)[i];
  } else if (typeof value === 'number' && i === 0) {
    x = value;
  } else {
    return null;
  }

  if (typeof x === 'number' && Number.isFinite(x)) return x;

  if (typeof x === 'string') {
    const n = Number(x);
    if (Number.isFinite(n)) return n;
  }

  return null;
}
