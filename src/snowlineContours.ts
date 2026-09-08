import type { GridPoint } from './contours';

export const MIN_SNOWLINE_CONTOUR_M = -500;

/** Prepare display values only; retain raw diagnostics for terrain comparisons. */
export function prepareSnowlineContours(rawField: GridPoint[][], interval: number) {
  const field = rawField.map(row => row.map(point => ({
    ...point,
    value: point.value !== null && Number.isFinite(point.value)
      ? Math.max(MIN_SNOWLINE_CONTOUR_M, point.value)
      : null,
  })));
  const values = field.flat().map(point => point.value).filter((v): v is number => v !== null);
  const levels: number[] = [];
  if (!values.length) return { field, levels };

  const min = Math.max(MIN_SNOWLINE_CONTOUR_M, Math.floor(Math.min(...values) / interval) * interval);
  const max = Math.ceil(Math.max(...values) / interval) * interval;
  // At 200 m spacing, include the floor without shifting zero/major contours.
  if (min % interval !== 0) levels.push(min);
  for (let level = Math.ceil(min / interval) * interval; level <= max; level += interval) {
    levels.push(level);
  }
  return { field, levels };
}
