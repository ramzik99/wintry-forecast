import type { ProfilePoint } from './snowLevel';

export type TerrainPrecipTypeKey =
  | 'snow'
  | 'wet-snow'
  | 'mix'
  | 'rain'
  | 'ice-pellets'
  | 'freezing-rain';

export type TerrainPrecipConfidence = 'high' | 'medium' | 'low';

export interface TerrainPrecipType {
  key: TerrainPrecipTypeKey;
  label: string;
  icon: string;
  detail: string;
  confidence: TerrainPrecipConfidence;
  surfaceWetBulbC: number;
  meltingDegreeMetres: number;
  refreezingDegreeMetres: number;
}

const WARM_NODE_C = 0.2;
const MIN_MELTING_DM = 150;
const PARTIAL_MELTING_DM = 500;
const FULL_MELTING_DM = 1100;
const ICE_PELLET_REFREEZE_DM = 800;
const MAX_ANALYSIS_DEPTH_M = 5500;

function interpolateAtHeight(a: ProfilePoint, b: ProfilePoint, heightM: number): ProfilePoint {
  const dz = b.heightM - a.heightM;
  const f = Math.abs(dz) < 1e-6 ? 0 : (heightM - a.heightM) / dz;
  const lerp = (x: number, y: number) => x + f * (y - x);
  const logP = lerp(Math.log(a.pressureHpa), Math.log(b.pressureHpa));
  return {
    level: a.level,
    pressureHpa: Math.exp(logP),
    heightM,
    tempC: lerp(a.tempC, b.tempC),
    dewpointC: lerp(a.dewpointC, b.dewpointC),
    wetBulbC: lerp(a.wetBulbC, b.wetBulbC),
  };
}

function terrainProfile(profile: ProfilePoint[], terrainM: number): { points: ProfilePoint[]; extrapolated: boolean } | null {
  const p = profile
    .filter(v => Number.isFinite(v.heightM) && Number.isFinite(v.wetBulbC))
    .sort((a, b) => a.heightM - b.heightM);
  if (p.length < 2 || !Number.isFinite(terrainM)) return null;
  if (terrainM > p[p.length - 1].heightM) return null;

  let surface: ProfilePoint;
  let extrapolated = false;
  let start = 0;

  if (terrainM <= p[0].heightM) {
    surface = { ...p[0], heightM: terrainM };
    extrapolated = true;
  } else {
    let bracket = -1;
    for (let i = 0; i < p.length - 1; i++) {
      if (terrainM >= p[i].heightM && terrainM <= p[i + 1].heightM) {
        bracket = i;
        break;
      }
    }
    if (bracket < 0) return null;
    surface = interpolateAtHeight(p[bracket], p[bracket + 1], terrainM);
    start = bracket + 1;
  }

  const top = terrainM + MAX_ANALYSIS_DEPTH_M;
  const points = [surface, ...p.slice(start).filter(v => v.heightM > terrainM + 1 && v.heightM <= top)];
  if (points.length < 2) return null;
  return { points, extrapolated };
}

function integrateSigned(points: ProfilePoint[], sign: 'positive' | 'negative', ceilingM = Infinity): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a.heightM >= ceilingM) break;
    const upper = Math.min(b.heightM, ceilingM);
    if (upper <= a.heightM) continue;
    const fraction = (upper - a.heightM) / Math.max(1e-6, b.heightM - a.heightM);
    const twB = a.wetBulbC + fraction * (b.wetBulbC - a.wetBulbC);
    const fa = sign === 'positive' ? Math.max(0, a.wetBulbC) : Math.max(0, -a.wetBulbC);
    const fb = sign === 'positive' ? Math.max(0, twB) : Math.max(0, -twB);
    // A layer crossing zero contributes only on the selected side of the crossing.
    const signedFraction = a.wetBulbC * twB < 0
      ? (fa > 0 ? Math.abs(a.wetBulbC) : Math.abs(twB)) / (Math.abs(a.wetBulbC) + Math.abs(twB))
      : 1;
    sum += 0.5 * (fa + fb) * (upper - a.heightM) * signedFraction;
  }
  return sum;
}

function classifyConfidence(points: ProfilePoint[], extrapolated: boolean, warmDM: number, coldDM: number): TerrainPrecipConfidence {
  if (extrapolated) return 'low';
  let maxGap = 0;
  for (let i = 1; i < points.length; i++) maxGap = Math.max(maxGap, points[i].heightM - points[i - 1].heightM);
  if (maxGap > 1400) return 'low';

  const near = (value: number, threshold: number, margin: number) => Math.abs(value - threshold) <= margin;
  if (
    near(warmDM, MIN_MELTING_DM, 90) ||
    near(warmDM, PARTIAL_MELTING_DM, 180) ||
    near(warmDM, FULL_MELTING_DM, 260) ||
    near(coldDM, ICE_PELLET_REFREEZE_DM, 220)
  ) return 'medium';
  return maxGap <= 850 ? 'high' : 'medium';
}

function result(
  key: TerrainPrecipTypeKey,
  label: string,
  icon: string,
  detail: string,
  confidence: TerrainPrecipConfidence,
  surfaceWetBulbC: number,
  meltingDegreeMetres: number,
  refreezingDegreeMetres: number,
): TerrainPrecipType {
  return {
    key,
    label,
    icon,
    detail,
    confidence,
    surfaceWetBulbC,
    meltingDegreeMetres,
    refreezingDegreeMetres,
  };
}

/** Terrain-aware precipitation type from the wet-bulb vertical profile. */
export function terrainPrecipitationType(profile: ProfilePoint[], terrainM: number): TerrainPrecipType | null {
  const prepared = terrainProfile(profile, terrainM);
  if (!prepared) return null;
  const points = prepared.points;
  const surfaceTw = points[0].wetBulbC;

  const warmPoints = points.filter(v => v.wetBulbC > WARM_NODE_C);
  const warmBottom = warmPoints.length ? Math.min(...warmPoints.map(v => v.heightM)) : Infinity;
  const warmDM = integrateSigned(points, 'positive');
  const coldDM = Number.isFinite(warmBottom) ? integrateSigned(points, 'negative', warmBottom) : integrateSigned(points, 'negative');
  const confidence = classifyConfidence(points, prepared.extrapolated, warmDM, coldDM);
  const approximate = confidence === 'low' ? '~ ' : '';

  if (warmDM < MIN_MELTING_DM) {
    if (surfaceTw <= -0.7) return result('snow', 'Snow', '❄', `${approximate}Cold column`, confidence, surfaceTw, warmDM, coldDM);
    if (surfaceTw <= 0.6) return result('wet-snow', 'Wet snow', '❄', `${approximate}Near-melting snow`, confidence, surfaceTw, warmDM, coldDM);
    return result('mix', 'Rain / snow mix', '🌨', `${approximate}Marginal melting near terrain`, confidence, surfaceTw, warmDM, coldDM);
  }

  if (warmDM < PARTIAL_MELTING_DM) {
    if (surfaceTw <= 0.3) return result('wet-snow', 'Wet snow', '❄', `${approximate}Partial melting`, confidence, surfaceTw, warmDM, coldDM);
    return result('mix', 'Rain / snow mix', '🌨', `${approximate}Partial melting`, confidence, surfaceTw, warmDM, coldDM);
  }

  if (surfaceTw <= 0 && warmDM >= PARTIAL_MELTING_DM) {
    if (coldDM >= ICE_PELLET_REFREEZE_DM) {
      return result('ice-pellets', 'Ice pellets', '🧊', `${approximate}Warm layer aloft · refreezing below`, confidence, surfaceTw, warmDM, coldDM);
    }
    return result('freezing-rain', 'Freezing rain', '⚠', `${approximate}Melted aloft · shallow surface cold layer`, confidence, surfaceTw, warmDM, coldDM);
  }

  if (warmDM < FULL_MELTING_DM && surfaceTw <= 1.2) {
    return result('mix', 'Rain / snow mix', '🌨', `${approximate}Incomplete melting`, confidence, surfaceTw, warmDM, coldDM);
  }

  return result('rain', 'Rain', '🌧', `${approximate}Melted before reaching terrain`, confidence, surfaceTw, warmDM, coldDM);
}
