import { buildProfile, valueAt } from './snowLevel';

export interface TerrainSlopes { east: number; north: number; halfSpanM: number }

/** Broad central difference, deliberately independent of the map's pixel zoom. */
export function terrainSlopes(west: number | null, east: number | null, south: number | null,
  north: number | null, halfSpanM = 2000): TerrainSlopes | null {
  if (![west, east, south, north].every(v => v !== null && Number.isFinite(v)) ||
    !Number.isFinite(halfSpanM) || halfSpanM < 1000) return null;
  return { east: (east! - west!) / (2 * halfSpanM), north: (north! - south!) / (2 * halfSpanM), halfSpanM };
}

/** Kinematic exposure diagnostic only. This is not model vertical velocity or QPF. */
export function terrainFlow(forecast: Record<string, unknown>, index: number,
  terrainM: number | null, slopes: TerrainSlopes | null) {
  if (terrainM === null || !Number.isFinite(terrainM) || !slopes ||
    ![slopes.east, slopes.north, slopes.halfSpanM].every(Number.isFinite) || slopes.halfSpanM < 1000) return null;
  // Never take a fixed pressure level that may be below the actual mountain.
  const candidates = buildProfile(forecast, index)
    .filter(p => p.heightM >= terrainM + 200 && p.heightM <= terrainM + 2000)
    .sort((a, b) => Math.abs(a.heightM - terrainM - 1000) - Math.abs(b.heightM - terrainM - 1000));
  for (const p of candidates) {
    const u = valueAt(forecast[`wind_u-${p.level}`], index), v = valueAt(forecast[`wind_v-${p.level}`], index);
    if (u === null || v === null || !Number.isFinite(p.tempC) || !Number.isFinite(p.dewpointC)) continue;
    const es = (t: number) => Math.exp(17.67 * t / (t + 243.5));
    const relativeHumidity = Math.max(0, Math.min(100, 100 * es(Math.min(p.tempC, p.dewpointC)) / es(p.tempC)));
    const upliftProxyMs = u * slopes.east + v * slopes.north;
    if (!Number.isFinite(relativeHumidity) || !Number.isFinite(upliftProxyMs)) return null;
    return { upliftProxyMs, relativeHumidity, windSpeedMs: Math.hypot(u, v), heightAboveTerrainM: p.heightM - terrainM,
      level: p.level, direction: Math.abs(upliftProxyMs) < 0.05 ? 'Weak/cross-slope' : upliftProxyMs > 0 ? 'Upslope' : 'Downslope' };
  }
  return null;
}
