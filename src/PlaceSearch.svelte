<div class="place-search">
  <form on:submit|preventDefault={submitSearch}>
    <div class="search-line">
      <input
        bind:value={query}
        on:input={scheduleSearch}
        on:keydown={handleKeydown}
        on:keyup|stopPropagation
        on:focus={() => { if (visibleResults.length || favourites.length) open = true; }}
        aria-label="Search places"
        placeholder="Search place…"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="search-button" type="submit" aria-label="Search" title="Search" disabled={searching || query.trim().length < 2}>
        {searching ? '…' : 'Go'}
      </button>
    </div>

    <div class="utility-row">
      <button class="location-button" class:busy={locating} type="button" aria-label="Use current location" title="Use current location" on:click={useCurrentLocation} disabled={locating}>
        <span class="location-icon">⌖</span>
        <span>{locating ? 'Locating…' : 'My location'}</span>
      </button>
      <button class="fav-button" class:active={showFavourites} type="button" aria-label="Show saved places" title="Saved places" on:click={toggleFavourites}>
        <span>★</span><span>Saved</span>
      </button>
      <button class="clear-button" type="button" aria-label="Clear search and selected place" title="Clear" on:click={clearSearch} disabled={!query && !open && !hasSelection}>
        <span>×</span><span>Clear</span>
      </button>
    </div>
  </form>

  {#if !query && !open && favourites.length}
    <div class="quick-places" aria-label="Saved places">
      {#each favourites.slice(0,3) as place}<button type="button" on:click={() => chooseResult(place)} title={place.primary+', '+place.secondary}>★ {place.primary}</button>{/each}
    </div>
  {/if}

  {#if locationError}
    <div class="location-message">{locationError}</div>
  {/if}

  {#if open}
    <div class="results">
      {#if visibleResults.length}
        {#each visibleResults as result}
          <div class="result-row">
            <button class="result" type="button" on:click={() => chooseResult(result)}>
              <span class="result-main">{result.primary}</span>
              {#if result.secondary}<span class="result-sub">{result.secondary}</span>{/if}
            </button>
            <button
              class="star"
              class:saved={isFavourite(result)}
              type="button"
              aria-label={isFavourite(result) ? 'Remove saved place' : 'Save place'}
              title={isFavourite(result) ? 'Remove saved place' : 'Save place'}
              on:click={() => toggleFavourite(result)}
            >{isFavourite(result) ? '★' : '☆'}</button>
          </div>
        {/each}
        {#if !showFavourites && remoteResults.length}<div class="credit">Search © OpenStreetMap contributors</div>{/if}
      {:else if !searching}
        <div class="empty">{showFavourites ? 'No saved places' : hasSearched ? 'No places found' : 'Press Go to search places'}</div>
      {/if}
    </div>
  {/if}
</div>

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { geocode } from './geocoding';

  type SearchResult = {
    lat: number;
    lon: number;
    primary: string;
    secondary: string;
  };

  const dispatch = createEventDispatcher<{ select: SearchResult; clear: void }>();
  const STORAGE_KEY = 'snowline:favourites:v1';
  const FAVOURITES_CHANGED_EVENT = 'wintry:favourites-changed';

  let query = '';
  let searching = false;
  let hasSearched = false;
  let locating = false;
  let locationError = '';
  let open = false;
  let showFavourites = false;
  let hasSelection = false;
  let remoteResults: SearchResult[] = [];
  let favourites: SearchResult[] = [];
  let controller: AbortController | null = null;
  let requestId = 0;

  $: favouriteMatches = query.trim()
    ? favourites.filter(item => `${item.primary} ${item.secondary}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : favourites.slice(0, 10);

  $: visibleResults = showFavourites
    ? favouriteMatches
    : mergeResults(favouriteMatches, remoteResults).slice(0, 8);

  function resultKey(item: SearchResult): string {
    return `${item.lat.toFixed(5)},${item.lon.toFixed(5)}`;
  }

  function mergeResults(first: SearchResult[], second: SearchResult[]): SearchResult[] {
    const merged = new Map<string, SearchResult>();
    for (const item of [...first, ...second]) merged.set(resultKey(item), item);
    return [...merged.values()];
  }

  function splitName(name: string): { primary: string; secondary: string } {
    const parts = name.split(',').map(part => part.trim()).filter(Boolean);
    return { primary: parts[0] || 'Place', secondary: parts.slice(1, 3).join(', ') };
  }

  function loadFavourites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { favourites = []; return; }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { favourites = []; return; }
      favourites = parsed
        .map((item: any) => ({
          lat: Number(item?.lat),
          lon: Number(item?.lon),
          primary: String(item?.primary ?? 'Saved place'),
          secondary: String(item?.secondary ?? ''),
        }))
        .filter((item: SearchResult) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
    } catch {
      favourites = [];
    }
  }

  function saveFavourites() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
      window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGED_EVENT));
    } catch (error) {
      console.warn('Wintry forecast could not save places', error);
    }
  }

  function isFavourite(result: SearchResult): boolean {
    const key = resultKey(result);
    return favourites.some(item => resultKey(item) === key);
  }

  function toggleFavourite(result: SearchResult) {
    const key = resultKey(result);
    if (isFavourite(result)) favourites = favourites.filter(item => resultKey(item) !== key);
    else favourites = [{ ...result }, ...favourites].slice(0, 30);
    saveFavourites();
    open = true;
  }

  function clearPendingSearch() {
    controller?.abort();
    controller = null;
    requestId += 1;
    searching = false;
  }

  function clearSearch() {
    clearPendingSearch();
    query = '';
    locationError = '';
    open = false;
    showFavourites = false;
    hasSelection = false;
    remoteResults = [];
    dispatch('clear');
  }

  function useCurrentLocation() {
    clearPendingSearch();
    query = '';
    locationError = '';
    open = false;
    showFavourites = false;
    remoteResults = [];

    if (!navigator.geolocation) {
      locationError = 'Location is not available on this device.';
      return;
    }

    locating = true;
    navigator.geolocation.getCurrentPosition(
      position => {
        locating = false;
        const lat = Number(position.coords.latitude);
        const lon = Number(position.coords.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          locationError = 'Could not read your location.';
          return;
        }
        hasSelection = true;
        dispatch('select', {
          lat,
          lon,
          primary: 'My location',
          secondary: 'Current device location',
        });
      },
      error => {
        locating = false;
        if (error.code === 1) locationError = 'Location permission was denied.';
        else if (error.code === 2) locationError = 'Current location is unavailable.';
        else locationError = 'Location request timed out.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function scheduleSearch() {
    clearPendingSearch();hasSearched=false;locationError='';showFavourites=false;hasSelection=false;remoteResults=[];
    open=query.trim().length>0;
  }

  async function runSearch() {
    const searchText = query.trim();
    if (searchText.length < 2) return;

    const id = ++requestId;
    controller?.abort();
    controller = new AbortController();
    searching = true;
    hasSearched = true;
    open = true;

    try {
      const params = new URLSearchParams({ q: searchText, format: 'jsonv2', limit: '5', addressdetails: '0' });
      const data = await geocode('search', params, controller.signal);
      if (id === requestId) {
        remoteResults = Array.isArray(data)
          ? data.map((item: any) => {
              const lat = Number(item.lat);
              const lon = Number(item.lon);
              const { primary, secondary } = splitName(String(item.display_name ?? 'Place'));
              return { lat, lon, primary, secondary };
            }).filter((item: SearchResult) => Number.isFinite(item.lat) && Number.isFinite(item.lon))
          : [];
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError' && id === requestId) locationError = 'Place search unavailable. Try again or tap the map.';
      if (id === requestId) remoteResults = [];
    } finally {
      if (id === requestId) searching = false;
    }
  }

  function submitSearch() {
    if(searching)return;
    if (visibleResults.length === 1 && (showFavourites || remoteResults.length)) chooseResult(visibleResults[0]);
    else void runSearch();
  }

  function toggleFavourites() {
    clearPendingSearch();
    query = '';
    locationError = '';
    showFavourites = !showFavourites;
    open = showFavourites;
    remoteResults = [];
  }

  function chooseResult(result: SearchResult) {
    clearPendingSearch();
    query = '';
    locationError = '';
    open = false;
    showFavourites = false;
    hasSelection = true;
    remoteResults = [];
    dispatch('select', result);
  }

  function handleKeydown(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      open = false;
      showFavourites = false;
    }
  }

  function handleFavouritesChanged() {
    loadFavourites();
  }

  onMount(() => {
    loadFavourites();
    window.addEventListener(FAVOURITES_CHANGED_EVENT, handleFavouritesChanged);
  });

  onDestroy(() => {
    clearPendingSearch();
    window.removeEventListener(FAVOURITES_CHANGED_EVENT, handleFavouritesChanged);
  });
</script>

<style lang="less">
  .place-search { position: relative; margin-top: 9px; }
  form { display: flex; flex-direction: column; gap: 5px; }

  .search-line { display: grid; grid-template-columns: minmax(0, 1fr) 40px; gap: 5px; }
  input, button {
    box-sizing: border-box;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 7px;
    background: rgba(13,16,20,0.76);
    color: white;
  }
  input {
    width: 100%; min-width: 0; height: 34px; padding: 0 10px;
    font-size: 11px; outline: none;
  }
  input:focus { border-color: rgba(80,190,255,0.78); box-shadow: 0 0 0 1px rgba(80,190,255,0.18); }
  input::placeholder { color: rgba(255,255,255,0.46); }

  button { cursor: pointer; }
  button:disabled { opacity: 0.34; cursor: default; }
  .search-button { height: 34px; padding: 0; background:rgba(255,255,255,.055); font-size: 10px; line-height: 1; font-weight: 900; letter-spacing:.15px; }.search-button:not(:disabled):hover,.search-button:not(:disabled):focus{border-color:rgba(80,190,255,.52);background:rgba(80,190,255,.12);outline:none}

  .utility-row { display: grid; grid-template-columns: 1.45fr 1fr 0.82fr; gap: 5px; }
  .utility-row button {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    min-width: 0; height: 30px; padding: 0 7px;
    color: rgba(255,255,255,0.78); font-size: 9px; line-height: 1; font-weight: 800;
    background: rgba(255,255,255,0.045);
  }
  .location-button { border-color: rgba(80,190,255,0.28); }
  .location-button:hover, .location-button:focus { background: rgba(80,190,255,0.14); border-color: rgba(80,190,255,0.58); outline: none; }
  .location-button.busy { color: rgba(112,215,255,0.9); }
  .location-icon { font-size: 15px; line-height: 1; color: #70d7ff; }
  .fav-button span:first-child { font-size: 13px; }
  .fav-button.active { color: #ffe45c; border-color: rgba(255,228,92,0.48); background: rgba(255,228,92,0.08); }
  .clear-button span:first-child { font-size: 14px; font-weight: 500; }

  .location-message {
    margin-top: 5px; padding: 5px 7px; border-radius: 6px;
    background: rgba(255,157,61,0.10); color: rgba(255,207,160,0.95);
    font-size: 8.7px; line-height: 1.2;
  }

  .results {
    position: absolute; z-index: 5000; left: 0; right: 0; top: 72px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.16); border-radius: 8px;
    background: rgba(18,21,25,0.985); box-shadow: 0 6px 18px rgba(0,0,0,0.42);
  }
  .result-row { display: grid; grid-template-columns: 1fr 34px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .result {
    display: block; width: 100%; min-width: 0; padding: 7px 8px; border: 0; border-radius: 0;
    background: transparent; color: rgba(255,255,255,0.94); text-align: left; cursor: pointer;
  }
  .result:hover, .result:focus, .star:hover, .star:focus { background: rgba(80,190,255,0.16); outline: none; }
  .result-main { display: block; font-size: 10px; line-height: 1.15; font-weight: 750; }
  .result-sub { display: block; margin-top: 2px; font-size: 8.5px; line-height: 1.1; opacity: 0.6; }
  .star { border: 0; border-left: 1px solid rgba(255,255,255,0.08); border-radius: 0; background: transparent; color: rgba(255,255,255,0.52); font-size: 15px; cursor: pointer; }
  .star.saved { color: #ffe45c; }
  .empty, .credit { padding: 6px 8px; color: rgba(255,255,255,0.58); font-size: 8.5px; line-height: 1.15; }
  .credit { text-align: right; }

  @media (max-width: 520px) {
    .place-search { margin-top: 8px; }
    input, .search-button { height: 36px; }
    .utility-row button { height: 32px; font-size: 9.3px; }
    .results { top: 78px; }
  }
  .quick-places{display:flex;gap:5px;margin-top:7px}.quick-places button{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:7px 5px;font-size:10px;color:#ffe59b}
</style>
