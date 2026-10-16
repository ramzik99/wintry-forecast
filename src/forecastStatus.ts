import { buildProfile } from './snowLevel';
import { precipMmAt, isPrecipitating } from './precip';
import { precipitationLabel, terrainPrecipitationType, type TerrainPrecipType } from './precipType';
import { forecastIntervalHours } from './forecastTime';
import { supportedIntervalEnd } from './forecastIntervals';

export type ForecastPoint = { times: number[]; forecast: Record<string, unknown> };

export function conditionLabel(precip: number | null, phase: TerrainPrecipType | null): string {
  if (precip === null || !Number.isFinite(precip) || precip < 0) return 'Precipitation unavailable';
  if (precip === 0) return 'Dry';
  return phase ? precipitationLabel(phase) : 'Precipitation · type uncertain';
}

/** Absence of an event is only meaningful over intervals we could classify. */
export function noEventMessage(point: ForecastPoint, terrainM: number | null, fromTime: number): string {
  if (!point?.times?.length || terrainM === null || !Number.isFinite(terrainM)) return 'Wintry outlook unavailable';
  const end = Math.min(point.times[0] + 144 * 3600_000,
    point.times.at(-1)! + forecastIntervalHours(point.times, point.times.length - 1) * 3600_000);
  if (fromTime >= end) return 'Outside available forecast';
  let coveredUntil = fromTime;
  const partialOutlook = () => {
    const hours = Math.floor((coveredUntil - fromTime) / 3600_000);
    return coveredUntil > fromTime
      ? `No wintry precipitation for ${hours > 0 ? hours : '<1'} h`
      : 'Outlook unavailable · forecast data missing';
  };
  for (let i = 0; i < point.times.length && point.times[i] < end; i++) {
    const start = point.times[i], intervalEnd = Math.min(end, supportedIntervalEnd(point.times, i, point.forecast.__precipPeriodsH));
    if (intervalEnd <= fromTime) continue;
    const precip = precipMmAt(point.forecast, i);
    if (start > coveredUntil || intervalEnd <= start || precip === null ||
      (isPrecipitating(precip) && !terrainPrecipitationType(buildProfile(point.forecast, i), terrainM))) {
      return partialOutlook();
    }
    coveredUntil = intervalEnd;
  }
  return coveredUntil >= end ? 'No wintry precipitation in the available forecast' : partialOutlook();
}
