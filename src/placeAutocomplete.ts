export type PlaceResult = { lat: number; lon: number; primary: string; secondary: string };
const cache = new Map<string, PlaceResult[]>();

export function photonPlaces(data: any): PlaceResult[] {
  if (!Array.isArray(data?.features)) throw new Error('Invalid place response');
  const places = new Map<string, PlaceResult>();
  for (const feature of data.features) {
    const [lon, lat] = feature?.geometry?.coordinates ?? [];
    if (feature?.geometry?.type !== 'Point' || typeof lat !== 'number' || typeof lon !== 'number'
      || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const p = feature.properties ?? {};
    const label = (v: unknown) => typeof v === 'string' ? v.trim() : '';
    const primary = label(p.name) || [label(p.housenumber), label(p.street)].filter(Boolean).join(' ') || label(p.city) || label(p.postcode);
    if (!primary) continue;
    const secondary = [...new Set([p.city, p.state, p.country].map(label).filter(v => v && v !== primary))].join(', ');
    places.set(`${lat.toFixed(5)},${lon.toFixed(5)},${primary}`, {lat, lon, primary, secondary});
  }
  return [...places.values()].slice(0, 5);
}

export async function autocompletePlaces(query: string, signal: AbortSignal): Promise<PlaceResult[]> {
  const text = query.trim();
  if (text.length < 3) return [];
  signal.throwIfAborted();
  const key = text.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener('abort', cancel, {once: true});
  const timeout = setTimeout(cancel, 10000);
  try {
    const params = new URLSearchParams({q: text, limit: '5'});
    const response = await fetch(`https://photon.komoot.io/api/?${params}`, {signal: request.signal, headers: {Accept: 'application/json'}});
    if (!response.ok) throw new Error(`Place search failed (${response.status})`);
    const places = photonPlaces(await response.json());
    signal.throwIfAborted();
    cache.set(key, places);
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    return places;
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Place search unavailable');
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
  }
}
