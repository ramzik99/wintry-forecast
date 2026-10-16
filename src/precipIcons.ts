import { PRECIP_TYPE_COLOURS } from './precipShading';
import type { TerrainPrecipTypeKey } from './precipType';
const cloud='<path d="M7 17H25a5 5 0 0 0-.6-10 7 7 0 0 0-13-1A5.6 5.6 0 0 0 7 17Z"/>';
const drop='<path d="M11 20l-2 4m11-4-2 4m-2 2-2 3"/>';
const snow='<path d="M16 19v11m-5-8 10 5m-10 0 10-5m-5-3-2 2m2-2 2 2m-2 9-2-2m2 2 2-2"/>';
const shapes:Record<TerrainPrecipTypeKey,string>={
  uncertain: cloud+'<path d="M13 22a3 3 0 1 1 5 2c-2 1-2 2-2 3"/><circle cx="16" cy="30" r=".5"/>',
  rain:cloud+drop,
  snow:'<path d="M16 3v26M5 9l22 14M5 23 27 9M16 3l-4 4m4-4 4 4m-4 22-4-4m4 4 4-4M5 9l1 5m-1-5 5-1m17 15-5 1m5-1-1-5M5 23l5 1m-5-1 1-5M27 9l-5-1m5 1-1 5"/>',
  'wet-snow':cloud+snow+'<path d="M7 21l-2 4m21-4-2 4"/>',
  mix:cloud+'<path d="M7 21l-2 4m9-4-2 4m11-5v9m-4-7 8 5m-8 0 8-5"/>',
  'freezing-rain':cloud+drop+'<path d="M6 15v4m10-4v4m10-4v4"/>',
  'ice-pellets':cloud+'<circle cx="9" cy="23" r="1.8"/><circle cx="22" cy="23" r="1.8"/><circle cx="15" cy="28" r="1.8"/>',
};
/** Compact vector icons keep the requested colours on every browser. */
export function precipitationIconSvg(type:TerrainPrecipTypeKey):string{
  return `<svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" stroke="${PRECIP_TYPE_COLOURS[type]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${shapes[type]}</svg>`;
}
