/** Windy's raw ECMWF thunder/lightdens field, never CAPE or observed strikes. */
export const LIGHTNING_DISPLAY_THRESHOLD = 0.025;
export function hasForecastLightning(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= LIGHTNING_DISPLAY_THRESHOLD;
}
/** 72 screen pixels, with a minimum model-scale separation; capped separately at 80 samples. */
export function stormSpacing(zoom: number, latitude: number): number {
  return Math.max(9000,72*40075016.686*Math.cos(latitude*Math.PI/180)/(256*2**zoom));
}
