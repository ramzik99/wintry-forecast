export type GridPoint = {
  lat: number;
  lon: number;
  value: number | null;
};

export type LatLon = [number, number];
export type ContourSegment = [LatLon, LatLon];
export type ContourPolyline = LatLon[];

/** Missing or invalid samples remain gaps; contours never invent support there. */
function continuousContourGrid(grid: GridPoint[][]): GridPoint[][] {
  return grid.map(row => row.map(p => ({
    lat: p?.lat ?? NaN, lon: p?.lon ?? NaN,
    value: p && p.value !== null && [p.value,p.lat,p.lon].every(Number.isFinite) ? p.value : null,
  })));
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
  level: number,
  prepared = false,
): ContourSegment[] {
  const out: ContourSegment[] = [];
  const source = prepared ? grid : continuousContourGrid(grid);

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

/** Reconstruct missing samples once per frame, rather than once per elevation. */
export function contourLinesForLevels(grid: GridPoint[][], levels: number[]): Map<number, ContourPolyline[]> {
  const source = continuousContourGrid(grid);
  return new Map(levels.map(level => [level, stitchSegments(contourSegments(source, level, true))]));
}
