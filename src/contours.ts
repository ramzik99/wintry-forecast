export type GridPoint = {
  lat: number;
  lon: number;
  value: number | null;
};

export type LatLon = [number, number];
export type ContourSegment = [LatLon, LatLon];
export type ContourPolyline = LatLon[];

type IndexedGridPoint = GridPoint & { r: number; c: number };

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
}

function reconstructAxis(known: Array<{ index: number; value: number }>, length: number): number[] {
  if (!known.length) return Array.from({ length }, (_, i) => i);
  if (known.length === 1) return Array.from({ length }, () => known[0].value);

  const ordered = [...known].sort((a, b) => a.index - b.index);
  const slopes: number[] = [];
  for (let i = 1; i < ordered.length; i++) {
    const di = ordered[i].index - ordered[i - 1].index;
    if (di > 0) slopes.push((ordered[i].value - ordered[i - 1].value) / di);
  }
  const step = median(slopes);
  const anchor = ordered[Math.floor(ordered.length / 2)];
  return Array.from({ length }, (_, i) => anchor.value + (i - anchor.index) * step);
}

/**
 * Contours are a visual interpolation of a regularly sampled viewport field.
 * A single failed profile request must not punch a four-cell hole in marching
 * squares. Reconstruct missing grid geometry and fill missing values from the
 * nearest available samples in grid space. The raw point data remain untouched.
 */
function continuousContourGrid(grid: GridPoint[][]): GridPoint[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (!rows || !cols) return grid;

  const valid: IndexedGridPoint[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = grid[r][c];
      if (p && p.value !== null && Number.isFinite(p.value)) valid.push({ ...p, r, c });
    }
  }
  if (!valid.length) return grid;

  const rowLatKnown: Array<{ index: number; value: number }> = [];
  for (let r = 0; r < rows; r++) {
    const latitudes = valid.filter(p => p.r === r).map(p => p.lat).filter(Number.isFinite);
    if (latitudes.length) rowLatKnown.push({ index: r, value: latitudes.reduce((a, b) => a + b, 0) / latitudes.length });
  }
  const colLonKnown: Array<{ index: number; value: number }> = [];
  for (let c = 0; c < cols; c++) {
    const longitudes = valid.filter(p => p.c === c).map(p => p.lon).filter(Number.isFinite);
    if (longitudes.length) colLonKnown.push({ index: c, value: longitudes.reduce((a, b) => a + b, 0) / longitudes.length });
  }

  const rowLat = reconstructAxis(rowLatKnown, rows);
  const colLon = reconstructAxis(colLonKnown, cols);

  return grid.map((row, r) => row.map((p, c) => {
    if (p.value !== null && Number.isFinite(p.value)) return p;

    const neighbours = valid
      .map(v => ({ v, d2: (v.r - r) ** 2 + (v.c - c) ** 2 }))
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, 8);
    let weighted = 0;
    let weights = 0;
    for (const item of neighbours) {
      const weight = 1 / Math.max(0.25, item.d2);
      weighted += (item.v.value as number) * weight;
      weights += weight;
    }

    return {
      lat: Number.isFinite(p.lat) && (p.lat !== 0 || rowLat[r] === 0) ? p.lat : rowLat[r],
      lon: Number.isFinite(p.lon) && (p.lon !== 0 || colLon[c] === 0) ? p.lon : colLon[c],
      value: weights > 0 ? weighted / weights : null,
    };
  }));
}

function interp(
  p1: LatLon,
  p2: LatLon,
  v1: number,
  v2: number,
  level: number
): LatLon {
  if (Math.abs(v2 - v1) < 1e-9) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
  }

  const f = Math.max(0, Math.min(1, (level - v1) / (v2 - v1)));
  return [
    p1[0] + f * (p2[0] - p1[0]),
    p1[1] + f * (p2[1] - p1[1]),
  ];
}

/**
 * Marching-squares line segments for one contour level.
 * Grid is rows x cols; rows increase northward and columns eastward.
 *
 * Saddle cases (5 and 10) use a centre-value decider rather than a fixed
 * connection. This reduces artificial contour flips and broken-looking lines.
 */
export function contourSegments(
  grid: GridPoint[][],
  level: number
): ContourSegment[] {
  const out: ContourSegment[] = [];
  const source = continuousContourGrid(grid);

  for (let r = 0; r < source.length - 1; r++) {
    for (let c = 0; c < source[r].length - 1; c++) {
      const sw = source[r][c];
      const se = source[r][c + 1];
      const nw = source[r + 1][c];
      const ne = source[r + 1][c + 1];

      if (
        sw.value === null ||
        se.value === null ||
        ne.value === null ||
        nw.value === null
      ) continue;

      const v = [sw.value, se.value, ne.value, nw.value] as number[];
      const p: LatLon[] = [
        [sw.lat, sw.lon],
        [se.lat, se.lon],
        [ne.lat, ne.lon],
        [nw.lat, nw.lon],
      ];

      const edgePoint = (edge: number): LatLon => {
        switch (edge) {
          case 0: return interp(p[0], p[1], v[0], v[1], level);
          case 1: return interp(p[1], p[2], v[1], v[2], level);
          case 2: return interp(p[2], p[3], v[2], v[3], level);
          default: return interp(p[3], p[0], v[3], v[0], level);
        }
      };

      let code = 0;
      if (v[0] >= level) code |= 1;
      if (v[1] >= level) code |= 2;
      if (v[2] >= level) code |= 4;
      if (v[3] >= level) code |= 8;

      let pairs: number[][];

      if (code === 5 || code === 10) {
        const centre = (v[0] + v[1] + v[2] + v[3]) / 4;
        const centreHigh = centre >= level;

        if (code === 5) {
          pairs = centreHigh
            ? [[3, 0], [1, 2]]
            : [[3, 2], [0, 1]];
        } else {
          pairs = centreHigh
            ? [[0, 1], [2, 3]]
            : [[0, 3], [1, 2]];
        }
      } else {
        const table: Record<number, number[][]> = {
          0: [],
          1: [[3, 0]],
          2: [[0, 1]],
          3: [[3, 1]],
          4: [[1, 2]],
          6: [[0, 2]],
          7: [[3, 2]],
          8: [[2, 3]],
          9: [[0, 2]],
          11: [[1, 2]],
          12: [[1, 3]],
          13: [[0, 1]],
          14: [[3, 0]],
          15: [],
        };
        pairs = table[code] ?? [];
      }

      for (const pair of pairs) {
        out.push([edgePoint(pair[0]), edgePoint(pair[1])]);
      }
    }
  }

  return out;
}

function pointKey(p: LatLon): string {
  // Shared cell-edge intersections should be identical; rounding protects
  // against tiny floating-point differences without visibly moving a line.
  return `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
}

/** Stitch touching marching-squares segments into continuous polylines. */
export function stitchSegments(segments: ContourSegment[]): ContourPolyline[] {
  if (!segments.length) return [];

  const endpointMap = new Map<string, number[]>();
  const used = new Array<boolean>(segments.length).fill(false);

  const addEndpoint = (key: string, index: number) => {
    const list = endpointMap.get(key);
    if (list) list.push(index);
    else endpointMap.set(key, [index]);
  };

  segments.forEach((segment, i) => {
    addEndpoint(pointKey(segment[0]), i);
    addEndpoint(pointKey(segment[1]), i);
  });

  const extend = (line: ContourPolyline, atStart: boolean) => {
    while (true) {
      const end = atStart ? line[0] : line[line.length - 1];
      const candidates = endpointMap.get(pointKey(end)) ?? [];
      const nextIndex = candidates.find(i => !used[i]);
      if (nextIndex === undefined) return;

      used[nextIndex] = true;
      const seg = segments[nextIndex];
      const aMatches = pointKey(seg[0]) === pointKey(end);
      const nextPoint = aMatches ? seg[1] : seg[0];

      if (atStart) line.unshift(nextPoint);
      else line.push(nextPoint);

      // Closed contour: stop once both ends meet.
      if (line.length > 3 && pointKey(line[0]) === pointKey(line[line.length - 1])) {
        return;
      }
    }
  };

  const lines: ContourPolyline[] = [];

  for (let i = 0; i < segments.length; i++) {
    if (used[i]) continue;
    used[i] = true;

    const line: ContourPolyline = [segments[i][0], segments[i][1]];
    extend(line, false);
    extend(line, true);
    lines.push(line);
  }

  return lines;
}

export function contourPolylines(
  grid: GridPoint[][],
  level: number
): ContourPolyline[] {
  return stitchSegments(contourSegments(grid, level));
}
