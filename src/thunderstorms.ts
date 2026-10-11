/** Windy's raw ECMWF thunder/lightdens field, never CAPE or observed strikes. */
export const LIGHTNING_DISPLAY_THRESHOLD = 0.025;
export function hasForecastLightning(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= LIGHTNING_DISPLAY_THRESHOLD;
}
/** Screen spacing adapts at every zoom; the raw ECMWF field retains its native resolution. */
export function stormSpacing(zoom: number, latitude: number): number {
  return 72*40075016.686*Math.cos(latitude*Math.PI/180)/(256*2**zoom);
}

/** A zoomed viewport may show only the corner of a model-scale cell.
 * Sample its visible footprint so the forecast symbol stays on screen. */
export function stormSamplePoint(bounds:[number,number][]):{lat:number;lon:number}{
  return {lat:(bounds[0][0]+bounds[2][0])/2,lon:(bounds[0][1]+bounds[1][1])/2};
}
