import type { TerrainPrecipTypeKey } from './precipType';

// Same colours as the forecast's precipitation-type legend.
export const PRECIP_TYPE_COLOURS: Record<TerrainPrecipTypeKey, string> = {
  snow: '#b2b2b2', 'wet-snow': '#569456', mix: '#95a109',
  rain: '#0099b6', 'ice-pellets': '#510c0f', 'freezing-rain': '#900096',
  uncertain: '#718096',
};
export const PRECIP_SHADES = [{ label: 'Precipitation', tone: 0 }] as const;
export const PRECIP_SHADING_OPACITY = 1;
export const PRECIP_DETAIL_MIN_ZOOM = 8;

/** Zero, missing and invalid precipitation never produce a wet overlay. */
export function precipitationShade(mm3h: number | null, zoom = Infinity) {
  if (mm3h === null || !Number.isFinite(mm3h) || mm3h <= 0) return null;
  return PRECIP_SHADES[0];
}

/** Strictly dry, known samples only. Unknown or wet samples leave gaps. */
export function dryTerrainDifference(mm3h: number | null, terrain: number | null, wbz: number | null) {
  if (mm3h !== 0 || terrain === null || wbz === null || !Number.isFinite(terrain) || !Number.isFinite(wbz)) return null;
  return terrain - wbz;
}

/** Shared viewport sampling keeps shading and contours at the same zoom resolution. */
export function viewportGridForZoom(zoom: number) {
  return zoom <= 4 ? { rows: 9, cols: 15 } : zoom <= 6 ? { rows: 13, cols: 21 }
    : zoom <= 8 ? { rows: 17, cols: 27 } : { rows: 19, cols: 31 };
}

/** Tile around a sample, clipped to the grid footprint rather than extending past its edges. */
export function sampleTileBounds(grid: ({ lat: number; lon: number } | null)[][], r: number, c: number) {
  const p = grid[r]?.[c];
  if (!p) return null;
  const south = grid[r - 1]?.[c], north = grid[r + 1]?.[c];
  const west = grid[r]?.[c - 1], east = grid[r]?.[c + 1];
  // Do not bridge missing neighbours or invent bounds for incomplete rows.
  if ((r > 0 && !south) || (r < grid.length - 1 && !north) ||
      (c > 0 && !west) || (c < grid[r].length - 1 && !east)) return null;
  const s = south ? (south.lat + p.lat) / 2 : p.lat;
  const n = north ? (north.lat + p.lat) / 2 : p.lat;
  const w = west ? (west.lon + p.lon) / 2 : p.lon;
  const e = east ? (east.lon + p.lon) / 2 : p.lon;
  if (![s,n,w,e].every(Number.isFinite) || s >= n || w >= e) return null;
  return [[s,w],[s,e],[n,e],[n,w]] as [number,number][];
}
