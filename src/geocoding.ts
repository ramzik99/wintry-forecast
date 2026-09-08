// Submitted place searches and user-requested reverse lookups share one queue.
// Public Nominatim does not support autocomplete. Cache and pace this client;
// a multi-user deployment must also enforce the provider's application-wide limit.
const cache = new Map<string, unknown>();
let queue: Promise<unknown> = Promise.resolve();
let lastStarted = 0;

export function geocode(path: 'search' | 'reverse', params: URLSearchParams, signal?: AbortSignal): Promise<any> {
  const url = `https://nominatim.openstreetmap.org/${path}?${params}`;
  const request = queue.catch(() => {}).then(async () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (cache.has(url)) return cache.get(url);
    const wait = Math.max(0, 1100 - (Date.now() - lastStarted));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    lastStarted = Date.now();
    const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Place lookup failed (${response.status})`);
    const data: unknown = await response.json();
    cache.set(url, data);
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    return data;
  });
  queue = request;
  return request;
}
