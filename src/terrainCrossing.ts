import { buildProfile, wetBulbZeroHeight } from './snowLevel';

export type CrossingState = {
  summary: string;
  detail: string;
  crossingIndex: number | null;
  crossingTime: number | null;
  direction: 'below' | 'above' | 'none';
};

function snowlineAt(point: any, index: number, terrainM: number): number | null {
  try {
    const result = wetBulbZeroHeight(buildProfile(point.forecast, index), terrainM);
    return result.snowLevelM !== null && Number.isFinite(result.snowLevelM) ? result.snowLevelM : null;
  } catch {
    return null;
  }
}

function formatLead(hours: number): string {
  const rounded = Math.max(0, Math.round(hours));
  if (rounded < 24) return `${rounded} h`;
  const days = Math.floor(rounded / 24);
  const remainder = rounded % 24;
  return remainder ? `${days}d ${remainder}h` : `${days}d`;
}

function formatUtc(time: number): string {
  const date = new Date(time);
  const day = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day} ${hour}:${minute} UTC`;
}

function interpolateCrossingTime(
  beforeTime: number,
  afterTime: number,
  beforeSnowline: number,
  afterSnowline: number,
  terrainM: number,
): number {
  const denominator = afterSnowline - beforeSnowline;
  if (Math.abs(denominator) < 1e-6) return afterTime;
  const fraction = Math.max(0, Math.min(1, (terrainM - beforeSnowline) / denominator));
  return beforeTime + fraction * (afterTime - beforeTime);
}

export function terrainCrossingState(point: any, terrainM: number | null, targetTime: number): CrossingState | null {
  if (!point || !Array.isArray(point.times) || !point.times.length || terrainM === null || !Number.isFinite(terrainM)) return null;

  let startIndex = 0;
  let bestDistance = Infinity;
  point.times.forEach((time: number, index: number) => {
    const distance = Math.abs(time - targetTime);
    if (distance < bestDistance) {
      bestDistance = distance;
      startIndex = index;
    }
  });

  const current = snowlineAt(point, startIndex, terrainM);
  const unresolved: CrossingState = { summary: 'Terrain crossing unresolved',
    detail: 'The above-map-terrain profile does not resolve WBZ at every required time; no crossing time is inferred across gaps.',
    crossingIndex: null, crossingTime: null, direction: 'none' };
  if (current === null) return unresolved;
  const currentBelowTerrain = current <= terrainM;

  let previousIndex = startIndex;
  let previousValue = current;

  for (let i = startIndex + 1; i < point.times.length; i++) {
    const value = snowlineAt(point, i, terrainM);
    if (value === null) return unresolved;

    const belowTerrain = value <= terrainM;
    if (belowTerrain !== currentBelowTerrain) {
      const crossingTime = interpolateCrossingTime(
        point.times[previousIndex],
        point.times[i],
        previousValue,
        value,
        terrainM,
      );
      const leadHours = (crossingTime - point.times[startIndex]) / 3600_000;

      if (belowTerrain) {
        return {
          summary: `Snowline below terrain in ${formatLead(leadHours)}`,
          detail: `Thermal snowline falls below local terrain around ${formatUtc(crossingTime)}; precipitation is still required for snowfall`,
          crossingIndex: i,
          crossingTime,
          direction: 'below',
        };
      }

      return {
        summary: `Snowline above terrain in ${formatLead(leadHours)}`,
        detail: `Thermal snowline rises above local terrain around ${formatUtc(crossingTime)}`,
        crossingIndex: i,
        crossingTime,
        direction: 'above',
      };
    }

    previousIndex = i;
    previousValue = value;
  }

  return currentBelowTerrain
    ? {
        summary: 'Snowline below terrain through +144 h',
        detail: 'Thermal snowline remains below local terrain through the available +144 h forecast; precipitation is still required for snowfall',
        crossingIndex: null,
        crossingTime: null,
        direction: 'none',
      }
    : {
        summary: 'Snowline above terrain through +144 h',
        detail: 'Thermal snowline remains above local terrain through the available +144 h forecast',
        crossingIndex: null,
        crossingTime: null,
        direction: 'none',
      };
}
