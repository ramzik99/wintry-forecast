{#if panelHidden}
  <button class="show-panel" type="button" aria-label="Show Wintry forecast panel" on:click={() => panelHidden = false}>❄ Wintry forecast</button>
{:else}
  <div class="snowline-panel">
    <div class="panel-head">
    <div class="top-row">
      <div class="title">Wintry forecast</div>
      <div class="top-controls">
        <button class="settings-button" type="button" aria-label="Open Wintry settings" title="Colours, units and data status" on:click={() => settingsOpen = true}>⚙</button>
        <button class="hide-button" type="button" aria-label="Hide Wintry forecast panel" title="Hide" on:click={() => panelHidden = true}>−</button>
        <label class="switch"><input type="checkbox" aria-label="Enable Wintry forecast" bind:checked={enabled} on:change={toggleEnabled} /><span>{enabled ? 'On' : 'Off'}</span></label>
      </div>
    </div>

    <div class="layer-controls" role="group" aria-label="Map layers">
      <label class:active={showContours} title="Estimated snowline contours and dry-terrain hatching"><input type="checkbox" bind:checked={showContours} on:change={toggleMapLayers} /> Contours</label>
      <label class:active={showShading && precipDetailAvailable} class:unavailable={!precipDetailAvailable} title="Precipitation type colours"><input type="checkbox" bind:checked={showShading} disabled={!precipDetailAvailable} on:change={toggleMapLayers} /> Shading</label>
      <label class:active={showIcons && precipDetailAvailable} class:unavailable={!precipDetailAvailable} title="Precipitation-type symbols and ECMWF forecast lightning"><input type="checkbox" bind:checked={showIcons} disabled={!precipDetailAvailable} on:change={toggleMapLayers} /> Icons</label>
    </div>
    </div>
    {#if !precipDetailAvailable}<div class="zoom-hint">Zoom in to level 8 for shading and icons</div>{/if}
    <PlaceSearch on:select={handlePlaceSelect} on:clear={handleSearchClear} />
    {#if showShading && precipDetailAvailable && geographyError}<div class="storm-legend" role="status">{geographyError}</div>{/if}
    {#if (showShading || showIcons) && terrainDetailStatus}<div class="storm-legend" role="status">{terrainDetailStatus}</div>{/if}
    {#if showIcons && precipDetailAvailable}<div class="storm-legend" role="status">{stormStatus}</div>{/if}
    {#if clickedPoint}
      <div class="point-tools"><strong>{clickedPlaceName || 'Selected point'}</strong><div><button type="button" on:click={() => {forecastTab='graph';chartOpen=true}}>Forecast</button><button type="button" on:click={() => {forecastTab='sounding';chartOpen=true}}>Sounding</button></div></div>
    {/if}
    <V21Panel bind:unitSystem {activeRunTime} />
    {#if enabled && !viewportLoading && mapDataMissing}<div class="storm-legend" role="status">Some forecast data is missing · blank areas may be unknown</div>{/if}
    {#if refreshError}<div class="refresh-error" role="status">{refreshError} <button type="button" on:click={refreshForecast}>Retry</button></div>{/if}

    {#if enabled && (viewportLoading || probeLoading || terrainLoading || stormLoading || rasterLoading)}
      <div class="status-pill" role="status">
        {#if viewportLoading || terrainLoading || stormLoading || rasterLoading}
          <div class="prepare-ring" role="progressbar" aria-label="Map layer loading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={layerLoadPercent} aria-valuetext={`${layerLoadPercent}% of layer loading stages processed`} style={`--progress: ${layerLoadPercent}%`}><span>{layerLoadPercent}%</span></div>
          <span>Updating…<small class="loading-stage">{viewportLoading ? 'Forecast data' : terrainLoading ? 'Terrain detail' : rasterLoading ? 'Shading and type icons' : 'Lightning icons'}</small></span>
        {:else}<span class="status-dot"></span>Reading point…{/if}
      </div>
    {/if}
    <div class="panel-actions">
    <div class="prepare-map-controls">
      {#if preparingMap}<button class="refresh-button" type="button" on:click={cancelMapPreparation}>{exportingMap ? 'Cancel MP4 export' : 'Cancel preparation'}</button>
      {:else}<button class="refresh-button" type="button" disabled={!enabled || !showShading || !precipDetailAvailable || viewportLoading || terrainLoading || rasterLoading} on:click={prepareMapForecast}>Prepare & download MP4</button>{/if}
      <small>{prepareMessage || 'Current area · up to 144 h'}</small>
      {#if videoDownloadUrl}<a href={videoDownloadUrl} download={videoDownloadName}>Download MP4 again</a>{/if}
    </div>
    <div class="panel-footer"><button class="refresh-button" type="button" disabled={!enabled || viewportLoading || probeLoading || terrainLoading || stormLoading || rasterLoading} on:click={refreshForecast}>↻ Refresh</button><button class="help-link" type="button" on:click={() => infoOpen = true}>How it works</button></div>
    </div>
  </div>
{/if}

{#if settingsOpen}
  <div class="info-overlay" role="presentation" on:click|self={() => settingsOpen = false}>
    <div class="info-window" role="dialog" aria-modal="true" aria-label="Wintry settings">
      <div class="info-head"><b>Wintry settings</b><button type="button" aria-label="Close settings" on:click={() => settingsOpen = false}>×</button></div>
      <div class="info-body">
        <div><b>Precipitation colours</b><PrecipitationLegend /></div>
        <div><b>Units</b><V21Panel bind:unitSystem {activeRunTime} settingsOnly={true} /></div>
        {#if showContours}<div class="hatch-legend"><span>╱╱╱</span> Dry terrain above estimated snowline</div>{/if}
        <div class="data-status" aria-label="Map data status">{mapDataStatus || 'Forecast data not loaded'}</div>
      </div>
    </div>
  </div>
{/if}

{#if chartOpen && clickedPoint}
  <SnowlineChart
    point={clickedPoint}
    terrainM={clickedMapElevationM}
    placeName={clickedPlaceName || 'Selected point'}
    bind:tab={forecastTab}
    units={unitSystem}
    on:close={() => chartOpen = false}
  />
{/if}

{#if infoOpen}
  <div class="info-overlay" role="presentation" on:click|self={() => infoOpen = false}>
    <div class="info-window" role="dialog" aria-modal="true" aria-label="How Wintry forecast works">
      <div class="info-head">
        <b>How Wintry forecast works</b>
        <button type="button" aria-label="Close information" title="Close" on:click={() => infoOpen = false}>×</button>
      </div>
      <div class="info-body">
        <div><b>Coverage and accuracy:</b> precipitation uses sampled ECMWF amounts; coverage may differ from Windy's layer. Terrain adjusts precipitation type, not rainfall amounts. Accuracy has not been independently validated.</div>
        <div><b>Diagonal hatching:</b> sampled map terrain is above the atmospheric snowline estimate. This is not a snowfall forecast; precipitation and the vertical temperature profile determine precipitation type. Hatching appears only where forecast precipitation is zero. Wet or missing precipitation leaves a gap. Small terrain features may be missed between samples.</div>
        <div><b>Prepare & download MP4:</b> prepares the visible area through available forecast times, up to 144 hours, then downloads an MP4 with precipitation shading, enabled type icons and snowline contours, local timestamps and a legend. The video uses a geographic background; Windy's weather layer, lightning and dry-terrain hatching are excluded. Encoding requires browser H.264 support; map preparation still completes when video export is unavailable. Progress and cancellation remain available; keep this view and its controls unchanged until export completes. Already prepared times remain usable after cancellation. A download link is available if the automatic download is blocked.</div>
        <div><b>Precipitation shading:</b> the forecast legend colours show rain, snow, wet snow, mix, ice pellets and freezing rain. Every shaded precipitation pixel is 100% opaque, overriding Windy’s precipitation colours even at wet/dry boundaries. Elevation relief is built into the colours so terrain remains visible. Windy’s selected layer remains visible in dry and missing-data areas. Intensity shading is removed; numerical amounts remain in point forecasts. The plugin opens Windy’s precipitation-type layer automatically. You can then select another Windy layer beneath the overlays. Small raster tiles keep the shading smooth at every zoom. Valid atmospheric profiles and precipitation are interpolated continuously between weather samples before diagnosis; categorical colours are never blended. Weather samples target 9 km locally, with bounded overview sampling on broad maps. Cached elevation tiles refine precipitation type with zoom; terrain source detail varies by region. Rainfall amounts retain the sampled ECMWF scale. Coarse interpolated terrain appears while elevation tiles load, and is identified if detailed terrain is unavailable. Missing weather data stays blank. Contours, shading and icons can be hidden independently. The Icons switch controls both precipitation symbols and forecast lightning from zoom 8. Icons use the same terrain-aware type diagnosis as shading, appear only in wet areas, and reuse existing samples.</div>
        <div><b>Terrain shading source:</b> Mapzen Terrain Tiles, served through the public AWS dataset. <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener noreferrer">Terrain data sources and attribution</a>. Point forecasts retain Windy’s elevation service.</div>
        <details><summary>Terrain data credits</summary>
          <p>ArcticDEM: DEMs created from DigitalGlobe imagery; funded by NSF awards 1043681, 1559691 and 1542736. Australia: © Commonwealth of Australia (Geoscience Australia) 2017. Austria: © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich. Canada: contains information licensed under the Open Government Licence – Canada. Europe: produced using Copernicus data and information funded by the European Union, EU-DEM layers. Global ETOPO1: U.S. National Oceanic and Atmospheric Administration. Mexico: INEGI, Continental relief, 2016. New Zealand: Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved). Norway: © Kartverket. United Kingdom: © Environment Agency copyright and/or database right 2015. United States 3DEP and global GMTED2010/SRTM: courtesy of the U.S. Geological Survey.</p>
        </details>
        <div><b>Lightning symbols:</b> raw ECMWF lightning-density forecast from Windy’s thunder layer, for the selected map time. Symbols indicate areas of forecast lightning activity, not observed or individually predicted strikes. Values below 0.025 in Windy’s native lightning-density units are omitted. Symbol spacing adapts to every map zoom. The raw ECMWF lightning forecast retains its native resolution; symbol placement does not use terrain. Missing data displays no symbols.</div>
        <div><b>At a glance:</b> precipitation type, terrain, snowline and precipitation for the selected point.</div>
        <div><b>Atmospheric profile:</b> all complete supplied pressure levels from 1000 hPa upward are retained, including values below model terrain. Below-model-terrain values may be source extrapolations. Only levels above actual local terrain are drawn in the sounding; an interpolated point joins the curves at terrain. Melting and refreezing stop at actual terrain, not model terrain. The count distinguishes supplied pressure levels from those above terrain.</div>
        <div><b>Forecast intervals:</b> contours follow the timeline. Point forecasts show average precipitation over the source interval; next-24-hour totals require complete coverage.</div>
        <div><b>Forecast:</b> snowline, precipitation and precipitation type on one timeline.</div>
        <div><b>Sounding:</b> optional vertical detail with hover/touch temperature, dew point and wet bulb.</div>
        <div class="info-caveat">Snowline and precipitation type are model-based forecasts. Valid times use your device timezone; ECMWF cycle labels remain UTC.</div>
      </div>
    </div>
  </div>
{/if}

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import PrecipitationLegend from './PrecipitationLegend.svelte';
  import { map, getMapTiles } from '@windy/map';
  import store from '@windy/store';
  import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
  import { TileLayerInterpolator } from '@windy/tileInterpolator';
  import { tileLayerSource } from '@windy/tileLayerSource';
  import { applyUrlTemplate } from '@windy/tileHelpers';
  import { hasForecastLightning, stormSpacing, stormSamplePoint, lightningTileZoomIndex } from './thunderstorms';
  import { getElevation, getMeteogramForecastData } from '@windy/fetch';
  import PlaceSearch from './PlaceSearch.svelte';
  import V21Panel from './V21Panel.svelte';
  import SnowlineChart from './SnowlineChart.svelte';
  import { terrainHatchSegments } from './terrainHatching';
  import { precipitationShade, dryTerrainDifference, PRECIP_TYPE_COLOURS, PRECIP_SHADING_OPACITY, PRECIP_DETAIL_MIN_ZOOM } from './precipShading';
  import { precipitationIconSvg } from './precipIcons';
  import { metricGrid, wrappedLongitude, viewportWeatherGrid } from './shadingGrid';
  import { weatherInterpolator, weightedScalar, continuousProfileBlender, visibleRasterTiles, tileLocation, viewportRasterZoom, TILE_SIZE, RASTER_SAMPLES } from './shadingRaster';
  import { TerrainTiles, terrainTileZoom } from './terrainTiles';
  import { precipRasterLayer, colourTerrainTile, terrainIllumination } from './precipRasterLayer';
  import { GeographicTiles } from './geographicTiles';
  import { buildProfile, PRESSURE_LEVELS, type PressureLevel, wetBulbZeroHeight, wetBulbFromDewpoint } from './snowLevel';
  import { precipMmAt, precipMmAtTime, isPrecipitating } from './precip';
  import { precipitationLabel, terrainPrecipitationType, type TerrainPrecipType } from './precipType';
  import { supportedIntervalEnd } from './forecastIntervals';
  import { alignSelectedPrecipFields, loadSelectedPrecipFields } from './selectedPrecip';
  import { prepareSnowlineContours } from './snowlineContours';
  import { contourLinesForLevels, type ContourPolyline, type GridPoint } from './contours';
  import { conditionLabel } from './forecastStatus';
  import { buildForecastTimes } from './forecastTimeline';
  import { forecastIntervalIndex } from './forecastTime';
  import { isOlderRun, profileIsFresh } from './forecastFreshness';
  import { automaticRefreshDue } from './automaticRefresh';
  import { register, release } from '@windy/singleclick';
  import config from './pluginConfig';
  import { PreparedMapCache } from './preparedMapCache';
  import { canExportMapForecast, encodeMapForecast, forecastMovieTimes, videoImage, videoSize } from './mapForecastVideo';
  import { boundedRequest } from './boundedRequest';
  import { geocode } from './geocoding';
  import { formatElevation, formatPrecip, formatSnow, loadUnitSystem, type UnitSystem } from './displayUnits';

  type CachedPoint = { lat:number; lon:number; forecast:Record<string,unknown>; header:Record<string,unknown>; times:number[]; runTime:number|null; step:number; terrainM:number|null; fetchedAt:number; siteElevation?:boolean; precipChecked?:boolean };
  type ColourStop = { value:number; color:string };
  type ViewportPoint = { lat:number; lon:number; r:number; c:number };
  type LabelCandidate = { point:[number,number]; level:number; color:string; length:number; isMajor:boolean };
  type ProbeStatus = 'above' | 'below' | 'near' | 'neutral';
  type PointSource = 'search' | 'map-click';
  type PlaceSelection = { lat:number; lon:number; primary:string; secondary:string };
  type LabelGridArgs = { valid:string; terrain:number; snowline:number; difference:number; precip:number|null; hasPrecip:boolean };

  const MODEL = 'ecmwf' as const;
  const MAX_CONCURRENT = 12, CONTOUR_STEP_H = 1, FORECAST_DAYS = 6, MAX_FORECAST_HOURS = 144, PROFILE_CACHE_MAX = 1600, MIN_VALID_FRACTION = 0.32, POSITION_NEAR_SNOWLINE_METRES = 100, TENDENCY_HOURS = 1, MAX_VIEWPORT_LATITUDE = 85;
  const FAVOURITES_STORAGE_KEY = 'snowline:favourites:v1', FAVOURITES_CHANGED_EVENT = 'wintry:favourites-changed', PREFS_STORAGE_KEY='wintry:prefs:v1';

  let showContours=true, showShading=true, showIcons=true;
  let precipDetailAvailable=Number(map.getZoom())>=PRECIP_DETAIL_MIN_ZOOM;
  let terrainLoading=false, stormLoading=false;
  let stormInterpolator:any=null;
  let stormLayer:any=null, stormAbort:AbortController|null=null, stormKey='', stormEpoch=0, stormStatus='⚡ ECMWF forecast lightning';
  let shadingLayer:any=null, precipIconLayer:any=null;
  const terrainTiles=new TerrainTiles();
  let terrainComplete=false;
  let terrainDetailStatus='', rasterEpoch=0, rasterTarget:number|null=null, rasterTimer:ReturnType<typeof setTimeout>|null=null;
  let terrainGeneration=0, terrainJobKey='';
  type FrameTile={url:string;nw:{lat:number;lon:number};se:{lat:number;lon:number}};
  type StoredFrame={tiles:FrameTile[];symbols:{lat:number;lon:number;html:string}[];geography:FrameTile[];fallback:boolean;geographyError:string;bytes:number};
  type RasterFrame={shading:any;icons:any;geography:any|null;fallback:boolean;geographyError:string;bytes:number;record:StoredFrame;geographyPromise?:Promise<void>};
  const preparedMapCache=new PreparedMapCache<StoredFrame>();
  const preparedKeys=new Set<string>();
  let preparingMap=false,prepareMessage='',prepareGeneration=0,preparedReadKey='';
  let exportingMap=false,videoAbort:AbortController|null=null,videoDownloadUrl='',videoDownloadName='';
  let weatherLoadProgress=0,terrainLoadProgress=0,rasterLoadProgress=0,stormLoadProgress=0;
  // Stage-weighted work progress, not a download-byte or forecast-accuracy percentage.
  // Cached and synchronous contour work completes immediately; running jobs stay below 100%.
  $: layerLoadPercent=Math.max(0,Math.min(99,Math.floor(100*(
    .35*(viewportLoading?weatherLoadProgress:1)+
    (precipDetailAvailable&&(showShading||showIcons) ? .15*(terrainLoading?terrainLoadProgress:1)+.4*(rasterLoading?rasterLoadProgress:1) : 0)+
    (precipDetailAvailable&&showIcons ? .1*(stormLoading?stormLoadProgress:1) : 0)
  )/(.35+(precipDetailAvailable&&(showShading||showIcons)?.55:0)+(precipDetailAvailable&&showIcons?.1:0)))));
  const frameCache=new Map<string,RasterFrame>();
  const stormFrames=new Map<string,{layer:any;status:string;fetchedAt:number}>();
  const FRAME_PIXEL_BUDGET=(map.getSize().x<600?48:96)*1024*1024;
  let skippedPrefetchKey='';
  let activePhaseKey='',pendingPhaseKey='',weatherRevision=0,terrainRevision=0,rasterLoading=false;
  let prefetchTimer:ReturnType<typeof setTimeout>|null=null,prefetchBusy=false;
  const PRECIP_PANE='wintry-precip-shading';
  const GEOGRAPHY_ID=`wintry-geography-${Date.now()}`;
  let geographyLayer:any=null,geographyEpoch=0,geographyError='';
  const geographicTiles=new GeographicTiles(map.getSize().x<600?32:96);
  const reliefCache=new Map<string,HTMLCanvasElement>();
  let enabled=true, panelHidden=false, infoOpen=false, settingsOpen=false, chartOpen=false, forecastTab:'graph'|'sounding'='graph', viewportLoading=false, refreshQueued=false, probeLoading=false, unitSystem:UnitSystem='metric', prefsReady=false;
  let cache:(CachedPoint|null)[][]=[], contourLayer:any=null, clickLayer:any=null, clickedPoint:CachedPoint|null=null, clickedLatLon:[number,number]|null=null, clickedMapElevationM:number|null=null, clickedPlaceName:string|null=null, pointSource:PointSource|null=null, clickedNextEventTime:number|null=null;
  let exposureGeneration = -1;
  $: if (chartOpen && clickedPoint && clickedLatLon && exposureGeneration !== clickGeneration) {
    exposureGeneration = clickGeneration;
  }
  let moveTimer:ReturnType<typeof setTimeout>|null=null, generation=0, clickGeneration=0, timestampListener:number|null=null, activeRunTime:number|null=null, renderedUnitSystem:UnitSystem|null=null;
  const profileCache = new Map<string,CachedPoint>();
  const pendingProfiles = new Map<string,Promise<CachedPoint|null>>();
  const forecastRequests=new Set<AbortController>();
  let refreshEpoch=0, lastChecked:number|null=null, refreshError='', destroyed=false;
  let mapDataStatus='',mapDataMissing=false;
  let placeAbort:AbortController|null=null;
  let freshnessTimer:ReturnType<typeof setInterval>|null=null;
  let lastRefreshAttempt = Date.now();

  // Fixed elevation scale: violet at the lowest contours through red at the highest.
  const COLOUR_STOPS:ColourStop[]=[
    {value:-500,color:'#b04de8'}, // violet
    {value:500,color:'#4b3fbf'},  // indigo
    {value:1500,color:'#2196f3'}, // blue
    {value:2500,color:'#32c75a'}, // green
    {value:3500,color:'#ffeb3b'}, // yellow
    {value:4500,color:'#ff9800'}, // orange
    {value:6000,color:'#f44336'}  // red
  ];

  function contourIntervalForZoom(){const z=Number(map.getZoom?.()??6);return z<=4?500:z<=7?200:100}
  function hexToRgb(hex:string):[number,number,number]{const v=hex.replace('#','');return[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]}
  function rgbToHex(r:number,g:number,b:number){const p=(v:number)=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');return`#${p(r)}${p(g)}${p(b)}`}
  function colorForLevel(level:number){if(level<=COLOUR_STOPS[0].value)return COLOUR_STOPS[0].color;if(level>=COLOUR_STOPS.at(-1)!.value)return COLOUR_STOPS.at(-1)!.color;for(let i=0;i<COLOUR_STOPS.length-1;i++){const a=COLOUR_STOPS[i],b=COLOUR_STOPS[i+1];if(level<a.value||level>b.value)continue;const f=(level-a.value)/(b.value-a.value),x=hexToRgb(a.color),y=hexToRgb(b.color);return rgbToHex(x[0]+(y[0]-x[0])*f,x[1]+(y[1]-x[1])*f,x[2]+(y[2]-x[2])*f)}return'#fff'}
  function getStoreTimestamp(){try{const t=store.get('timestamp');if(typeof t==='number'&&Number.isFinite(t))return t}catch{}return Date.now()}
  function parseTime(v:unknown):number|null{if(typeof v==='number'&&Number.isFinite(v))return v>1e12?v:v>1e9?v*1000:null;if(typeof v==='string'){const p=Date.parse(v);if(Number.isFinite(p))return p}return null}
  function scalarNumber(v:unknown):number|null{if(typeof v==='number'&&Number.isFinite(v))return v;if(typeof v==='string'&&v.trim()!==''){const p=Number(v);if(Number.isFinite(p))return p}return null}
  function nearestIndex(times:number[],target:number){let best=0,d=Infinity;times.forEach((t,i)=>{const x=Math.abs(t-target);if(x<d){d=x;best=i}});return best}
  function extractPayload(payload:unknown){const r=payload as any;return{forecast:r?.data?.data&&typeof r.data.data==='object'?r.data.data as Record<string,unknown>:{},header:r?.data?.header&&typeof r.data.header==='object'?r.data.header as Record<string,unknown>:{}}}
  async function fetchMapElevation(lat:number,lon:number){const abort=new AbortController();forecastRequests.add(abort);try{const r=await boundedRequest(signal=>getElevation(lat,wrappedLongitude(lon),{abortSignal:signal}),15_000,abort.signal) as any;for(const c of[r?.data,r?.data?.data,r?.value]){const e=scalarNumber(c);if(e!==null)return e}}catch(e){if((e as Error)?.name!=='AbortError')console.warn('Wintry forecast map elevation failed',lat,lon,e)}finally{forecastRequests.delete(abort)}return null}
  function profileKey(lat:number,lon:number,step:number){return`${step}:${lat.toFixed(4)},${lon.toFixed(4)}`}
  function invalidateForNewRun(run:number|null){
    if(run===null||isOlderRun(run,activeRunTime))return;
    if(activeRunTime===null){activeRunTime=run;return}
    if(run>activeRunTime+60_000){activeRunTime=run;profileCache.clear();precipFieldCache.clear();pendingPrecipFields.clear();stormFrames.clear();clearStorms();cache=[];clearContours();clearShading()}
  }
  const elevationCache = new Map<string, Promise<number|null>>();
  const readyElevations = new Map<string,number>();
  function loadMapElevation(lat:number,lon:number):Promise<number|null>{
    const key=`${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached=elevationCache.get(key);if(cached)return cached;
    const request=fetchMapElevation(lat,lon).then(value=>{if(value===null)elevationCache.delete(key);else{readyElevations.delete(key);readyElevations.set(key,value);while(readyElevations.size>4096)readyElevations.delete(readyElevations.keys().next().value!);}return value});
    elevationCache.set(key,request);
    while(elevationCache.size>PROFILE_CACHE_MAX)elevationCache.delete(elevationCache.keys().next().value!);
    return request;
  }
  function rememberProfile(p:CachedPoint){const k=profileKey(p.lat,p.lon,p.step);profileCache.delete(k);profileCache.set(k,p);while(profileCache.size>PROFILE_CACHE_MAX){const o=profileCache.keys().next().value;if(o===undefined)break;profileCache.delete(o)}}
  function cachedProfile(lat:number,lon:number,step:number){
    const k=profileKey(lat,lon,step),p=profileCache.get(k);
    if(!p)return null;
    if(!profileIsFresh(p.fetchedAt,p.runTime,activeRunTime)){profileCache.delete(k);return null}
    profileCache.delete(k);profileCache.set(k,p);return p;
  }
  const precipFieldCache=new Map<string,{fields:Record<string,unknown>;fetchedAt:number}>();
  const pendingPrecipFields=new Map<string,Promise<Record<string,unknown>>>();
  async function loadPrecipFields(lat:number,lon:number){
    const key=`${lat.toFixed(4)},${lon.toFixed(4)}`,hit=precipFieldCache.get(key);
    if(hit&&Date.now()-hit.fetchedAt<300_000&&
      (activeRunTime===null||typeof hit.fields.__precipRunTime!=='number'||Math.abs(hit.fields.__precipRunTime-activeRunTime)<60_000))return hit.fields;
    const pending=pendingPrecipFields.get(key);if(pending)return pending;
    const epoch=refreshEpoch,run=activeRunTime,abort=new AbortController();forecastRequests.add(abort);
    const request=loadSelectedPrecipFields(lat,lon,FORECAST_DAYS,MODEL,abort.signal).then(fields=>{
      if(!destroyed&&epoch===refreshEpoch&&(run===activeRunTime||(typeof fields.__precipRunTime==='number'&&activeRunTime!==null&&Math.abs(fields.__precipRunTime-activeRunTime)<60_000))&&Object.keys(fields).length){
        precipFieldCache.set(key,{fields,fetchedAt:Date.now()});
        while(precipFieldCache.size>256)precipFieldCache.delete(precipFieldCache.keys().next().value!);
      }
      return fields;
    }).finally(()=>{forecastRequests.delete(abort);if(pendingPrecipFields.get(key)===request)pendingPrecipFields.delete(key);});
    pendingPrecipFields.set(key,request);return request;
  }
  async function loadPoint(lat:number,lon:number,step=1,siteElevation=true):Promise<CachedPoint|null>{
    const c=cachedProfile(lat,lon,step);if(c){if(siteElevation&&!c.siteElevation){c.terrainM=await loadMapElevation(lat,lon);c.siteElevation=c.terrainM!==null;}return c}
    const key=profileKey(lat,lon,step),epoch=refreshEpoch,pending=pendingProfiles.get(key);
    if(pending)return pending;
    const request=(async()=>{
      const abort=new AbortController();forecastRequests.add(abort);const timer=setTimeout(()=>abort.abort(),20_000);
      try{
        const [r,terrainM]=await Promise.all([boundedRequest(signal=>getMeteogramForecastData(MODEL,{lat,lon:wrappedLongitude(lon),step},undefined,{abortSignal:signal}),20_000,abort.signal),siteElevation?loadMapElevation(lat,lon):Promise.resolve(null)]);
        if(destroyed||epoch!==refreshEpoch)return null;
        const{forecast:rawForecast,header}=extractPayload(r);if(!Object.keys(rawForecast).length)return null;
        const forecast=typeof header.modelElevation==='number'&&Number.isFinite(header.modelElevation)
          ? {...rawForecast,__modelTerrainM:header.modelElevation}:rawForecast;
        const runTime=parseTime(header.refTime);if(isOlderRun(runTime,activeRunTime))return null;
        invalidateForNewRun(runTime);
        const p={lat,lon,forecast,header,times:buildForecastTimes(forecast,runTime),runTime,step,terrainM:terrainM??(typeof header.modelElevation==='number'?header.modelElevation:null),siteElevation:siteElevation&&terrainM!==null,fetchedAt:Date.now()};
        if(!p.times.length)return null;
        rememberProfile(p);return p;
      }catch(e){if(!abort.signal.aborted)console.warn('Wintry forecast point request failed',lat,lon,e);return null}
      finally{clearTimeout(timer);forecastRequests.delete(abort)}
    })();
    pendingProfiles.set(key,request);
    try{return await request}finally{if(pendingProfiles.get(key)===request)pendingProfiles.delete(key)}
  }
  async function mapLimit<T,R>(items:T[],limit:number,fn:(x:T)=>Promise<R>){const out=new Array<R>(items.length);let next=0;async function worker(){while(true){const i=next++;if(i>=items.length)return;out[i]=await fn(items[i])}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return out}
  function currentBounds(){const b=map.getBounds();return{south:Math.max(-85,b.getSouth()),north:Math.min(85,b.getNorth()),west:b.getWest(),east:b.getEast()}}
  function buildViewportPoints(){
    const grid=viewportWeatherGrid(currentBounds(),Number(map.getZoom?.()??6));
    const mid=map.getCenter();grid.points.sort((a,b)=>(a.lat-mid.lat)**2+(a.lon-mid.lng)**2-((b.lat-mid.lat)**2+(b.lon-mid.lng)**2));
    return grid;
  }
  async function refreshViewport(){
    if(!enabled||destroyed||(!showContours&&(!precipDetailAvailable||(!showShading&&!showIcons))))return;
    if(viewportLoading){refreshQueued=true;return}
    refreshQueued=false;const my=++generation;weatherLoadProgress=0;viewportLoading=true;
    const{points,rows,cols}=buildViewportPoints();
    const progressive:(CachedPoint|null)[][]=Array.from({length:rows},()=>Array(cols).fill(null));
    let completed=0,settled=0;
    if(precipDetailAvailable&&(showShading||showIcons))renderPrecipitation(getStoreTimestamp());
    try{
      const results=await mapLimit(points,MAX_CONCURRENT,async p=>{
        const result=my===generation&&enabled&&!destroyed?await loadPoint(p.lat,p.lon,CONTOUR_STEP_H,false):null;
        if(result&&!result.precipChecked&&my===generation){
          result.precipChecked=true;
          if(!result.times.some((_,i)=>precipMmAt(result.forecast,i)!==null)){
            const fields=await loadPrecipFields(p.lat,wrappedLongitude(p.lon));
            if(my===generation&&profileIsFresh(result.fetchedAt,result.runTime,activeRunTime)){
              Object.assign(result.forecast,alignSelectedPrecipFields(fields,result.times,result.runTime));
            }
          }
        }
        if(my===generation&&result&&profileIsFresh(result.fetchedAt,result.runTime,activeRunTime)){
          progressive[p.r][p.c]=result;completed++;
          // Commit only the complete weather grid; partial cells create rectangular holes.
        }
        if(my===generation)weatherLoadProgress=++settled/points.length;
        return {...p,result};
      });
      if(my!==generation||!enabled||destroyed)return;
      const sameRun=(p:CachedPoint|null)=>p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime);
      const valid=results.filter(x=>x.result?.times.length&&sameRun(x.result)).length;
      if(valid<Math.max(4,Math.floor(points.length*MIN_VALID_FRACTION))){cache=[];clearContours();clearShading();mapDataStatus='Forecast unavailable for this area';mapDataMissing=false;refreshError='Map forecast unavailable.';return}
      const next:(CachedPoint|null)[][]=Array.from({length:rows},()=>Array(cols).fill(null));
      for(const x of results)if(sameRun(x.result))next[x.r][x.c]=x.result;
      if(terrainComplete){const z=rasterZoom();for(const row of next)for(const p of row)if(p&&!p.siteElevation)p.terrainM=terrainTiles.sample(p.lat,p.lon,z)??p.terrainM;}
      cache=next;weatherRevision++;frameCache.clear();lastChecked=Date.now();refreshError='';renderFromCache();
      if(clickedPoint&&clickedLatLon&&!profileIsFresh(clickedPoint.fetchedAt,clickedPoint.runTime,activeRunTime))void probeLocation(...clickedLatLon,pointSource??'map-click',clickedPlaceName);
    }finally{
      if(my===generation)viewportLoading=false;
      if(refreshQueued&&enabled&&!destroyed){refreshQueued=false;setTimeout(refreshViewport,0)}
    }
  }
  function checkAutomaticRefresh(){
    if(!destroyed && automaticRefreshDue({enabled,busy:viewportLoading||probeLoading||preparingMap,hidden:document.hidden,online:navigator.onLine,failed:!!refreshError||lastChecked===null,lastAttempt:lastRefreshAttempt})) refreshForecast();
  }
  function refreshForecast(){
    if(!enabled||destroyed)return;
    resetMapPreparation();
    for(const abort of forecastRequests)abort.abort();forecastRequests.clear();
    lastRefreshAttempt=Date.now();
    stormFrames.clear();clearStorms();void renderStorms();
    terrainTiles.retry();terrainJobKey='';
    refreshEpoch++;precipFieldCache.clear();pendingPrecipFields.clear();generation++;viewportLoading=false;refreshQueued=false;profileCache.clear();pendingProfiles.clear();refreshError='';
    if(clickedLatLon)void probeLocation(...clickedLatLon,pointSource??'map-click',clickedPlaceName);
    void refreshViewport();
  }
  function clearContours(){if(!contourLayer)return;try{map.removeLayer(contourLayer)}catch{}contourLayer=null}
  function clearPrecipIcons(){if(precipIconLayer)try{map.removeLayer(precipIconLayer)}catch{}precipIconLayer=null;activePhaseKey=''}
  function clearShading(){reliefCache.clear();resetMapPreparation();frameCache.clear();activePhaseKey='';pendingPhaseKey='';rasterLoading=false;if(prefetchTimer){clearTimeout(prefetchTimer);prefetchTimer=null;}clearGeography();terrainLoading=false;terrainDetailStatus='';rasterEpoch++;rasterTarget=null;if(rasterTimer){clearTimeout(rasterTimer);rasterTimer=null;}clearPrecipIcons();terrainGeneration++;terrainJobKey='';if(!shadingLayer)return;try{map.removeLayer(shadingLayer)}catch{}shadingLayer=null}
  function clearGeography(){geographyEpoch++;geographyError='';if(geographyLayer)try{map.removeLayer(geographyLayer)}catch{}geographyLayer=null}
  function clearClickLayer(){if(!clickLayer)return;try{map.removeLayer(clickLayer)}catch{}clickLayer=null}
  function clearPointState(closeChart=true){placeAbort?.abort();placeAbort=null;clickGeneration++;probeLoading=false;if(closeChart)chartOpen=false;clickedPoint=null;clickedLatLon=null;clickedMapElevationM=null;clickedPlaceName=null;pointSource=null;clickedNextEventTime=null;clearClickLayer()}
  function statusColor(s:ProbeStatus){return s==='above'?'#46d9ff':s==='below'?'#ff9d3d':s==='near'?'#ffe45c':'#fff'}
  function statusForDifference(d:number):ProbeStatus{return d>POSITION_NEAR_SNOWLINE_METRES?'above':d<-POSITION_NEAR_SNOWLINE_METRES?'below':'near'}
  function positionText(d:number){const a=Math.abs(d);if(a<=POSITION_NEAR_SNOWLINE_METRES)return`<strong>Near snowline</strong><small>within ±${formatElevation(POSITION_NEAR_SNOWLINE_METRES,unitSystem)}</small>`;const side=d>0?'above':'below',label=a>1000?`Far ${side} snowline`:a>300?`Well ${side} snowline`:`Slightly ${side} snowline`;return`<strong>${label}</strong><small>${formatElevation(a,unitSystem)} ${side}</small>`}
  function shortValid(t:number){return new Date(t).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit'})}
  function formatCoordinate(lat:number,lon:number){return`${Math.abs(lat).toFixed(4)}°${lat>=0?'N':'S'}, ${Math.abs(lon).toFixed(4)}°${lon>=0?'E':'W'}`}
  function formatLocal(t:number){return new Date(t).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
  function formatLead(run:number|null,valid:number){return run===null||!Number.isFinite(run)?'Unavailable':`+${Math.max(0,Math.round((valid-run)/3600_000))} h`}
  function snowlineAt(point:CachedPoint,index:number){const r=wetBulbZeroHeight(buildProfile(point.forecast,index));return r.snowLevelM!==null&&Number.isFinite(r.snowLevelM)?r.snowLevelM:null}
  function tendencyText(point:CachedPoint,index:number){const now=snowlineAt(point,index);if(now===null)return'';const target=point.times[index]+TENDENCY_HOURS*3600_000;if(target>point.times.at(-1)!+30*60_000)return'';const fi=nearestIndex(point.times,target);if(fi===index)return'';const future=snowlineAt(point,fi);if(future===null)return'';const d=Math.round((future-now)/((point.times[fi]-point.times[index])/3600_000)/10)*10;return Math.abs(d)<20?'→ Steady':`${d>0?'↑':'↓'} ${formatElevation(Math.abs(d),unitSystem)}/h`}

  function phaseAt(point:CachedPoint,index:number,terrainM:number):TerrainPrecipType|null{
    return isPrecipitating(precipMmAt(point.forecast,index)) ? terrainPrecipitationType(buildProfile(point.forecast,index),terrainM) : null;
  }

  // Point-only, lazy and bounded: no extra weather fetches or per-pixel DEM requests.
  async function resolvePlaceName(lat:number,lon:number,signal?:AbortSignal){
    if(clickedPlaceName)return clickedPlaceName;
    try{
      const d=await geocode('reverse',new URLSearchParams({format:'jsonv2',zoom:'12',lat:String(lat),lon:String(lon)}),signal),a=d?.address??{};
      const local=d?.name||a.city||a.town||a.village||a.municipality||a.county,country=a.country;
      if(local&&country)return String(local)+', '+String(country);if(local)return String(local);
    }catch{}
    return formatCoordinate(lat,lon);
  }
  function escapeLabelText(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
  async function updatePointPlaceName(lat:number,lon:number,selection:number){
    placeAbort?.abort();const abort=new AbortController();placeAbort=abort;
    const timer=setTimeout(()=>abort.abort(),5000);
    try{
      const name=await resolvePlaceName(lat,lon,abort.signal);
      if(selection!==clickGeneration||destroyed||!enabled)return;
      clickedPlaceName=name;
      if(clickedPoint)updatePersistentClickLabel();
      else{const title=document.querySelector('.snowline-point-place');if(title)title.textContent=name;}
    }finally{clearTimeout(timer);if(placeAbort===abort)placeAbort=null;}
  }
  async function copyText(text:string){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return}const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();const copied=document.execCommand('copy');t.remove();if(!copied)throw new Error('Copy failed')}
  function favouriteKey(lat:number,lon:number){return`${lat.toFixed(5)},${lon.toFixed(5)}`}
  function readFavourites():any[]{try{const raw=localStorage.getItem(FAVOURITES_STORAGE_KEY),p=raw?JSON.parse(raw):[];return Array.isArray(p)?p:[]}catch{return[]}}
  function isCurrentFavourite(){if(!clickedLatLon)return false;const k=favouriteKey(...clickedLatLon);return readFavourites().some(i=>Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k)}
  async function toggleCurrentFavourite(button:HTMLButtonElement){if(!clickedLatLon)return;const[lat,lon]=clickedLatLon,k=favouriteKey(lat,lon);let items=readFavourites();const exists=items.some(i=>Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k);if(exists)items=items.filter(i=>!(Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k));else{const name=await resolvePlaceName(lat,lon),parts=name.split(',').map(v=>v.trim()).filter(Boolean);items=[{lat,lon,primary:parts[0]||'Saved point',secondary:parts.slice(1).join(', ')},...items].slice(0,30)}try{localStorage.setItem(FAVOURITES_STORAGE_KEY,JSON.stringify(items))}catch{}window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGED_EVENT));button.textContent=exists?'Save':'Saved';button.classList.toggle('saved',!exists);button.title=exists?'Save location':'Remove saved location';button.setAttribute('aria-label',button.title)}
  async function shareCurrentPoint(button:HTMLButtonElement){
    if(!clickedPoint||!clickedLatLon||!clickedPoint.times.length)return;
    const point=clickedPoint,[lat,lon]=clickedLatLon,target=getStoreTimestamp(),index=forecastIntervalIndex(point.times,target);
    if(index<0)return;
    const terrain=clickedMapElevationM,units=unitSystem,place=clickedPlaceName||formatCoordinate(lat,lon),validTime=point.times[index];
    const snowline=snowlineAt(point,index),precip=precipMmAtTime(point.forecast,point.times,target),phase=terrain!==null&&isPrecipitating(precip)?phaseAt(point,index,terrain):null;
    const text=['Wintry forecast',place,'Valid: '+formatLocal(validTime),conditionLabel(precip,phase),
      'Snowline: '+formatElevation(snowline,units),'Terrain: '+formatElevation(terrain,units),'Average precipitation: '+formatPrecip(precip,units),
      'ECMWF atmospheric profile · Windy terrain.'].join('\n');
    button.disabled=true;
    try{await copyText(text);button.textContent='Copied'}catch{button.textContent='Retry'}
    finally{button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent='Copy'},1600)}
  }

  function metricTile(label:string,value:string,className=''){return`<span class="${className}"><small>${label}</small><strong>${value}</strong></span>`}
  function labelGrid(args:LabelGridArgs){
    const terrain=metricTile('Terrain',formatElevation(args.terrain,unitSystem),'metric-terrain');
    const snowline=metricTile('Snowline',formatElevation(args.snowline,unitSystem),'metric-snowline');
    const relation=`<div class="snowline-compact-relation">${positionText(args.difference)}<span>${args.precip===null?'Precip unavailable':args.hasPrecip?`Avg precip ${formatPrecip(args.precip,unitSystem)}`:'Dry'}</span></div>`;
    const grid=`<div class="snowline-label-grid">${terrain}${snowline}</div>`;
    return`<div class="snowline-valid">${args.valid}</div>${grid}${relation}`;
  }

  function showClickLabel(lat:number,lon:number,mainText:string,detailHtml='',snowlineColor='#fff',status:ProbeStatus='neutral',phaseKey:string|null=null){clearClickLayer();clickLayer=L.layerGroup().addTo(map);const accent=phaseKey?(PRECIP_TYPE_COLOURS as Record<string,string>)[phaseKey]??statusColor(status):statusColor(status);L.marker([lat,lon],{interactive:false,keyboard:false,zIndexOffset:2100,icon:L.divIcon({className:'wintry-point-pointer',html:`<span style="--probe-accent:${accent}"></span>`,iconSize:[14,14],iconAnchor:[7,7]})}).addTo(clickLayer);const detail=detailHtml?`<div class="snowline-label-detail">${detailHtml}</div>`:'',saved=isCurrentFavourite(),actions=clickedPoint&&clickedLatLon?`<button class="snowline-label-chart" type="button" aria-label="Open forecast" title="Open forecast">Forecast</button><button class="snowline-label-favourite${saved?' saved':''}" type="button" aria-label="${saved?'Remove saved location':'Save location'}" title="${saved?'Remove saved location':'Save location'}">${saved?'Saved':'Save'}</button><button class="snowline-label-share" type="button" aria-label="Copy Wintry forecast details" title="Copy Wintry forecast details">Copy</button>`:'',dry=mainText==='DRY';const marker=L.marker([lat,lon],{interactive:true,bubblingMouseEvents:false,zIndexOffset:2000,icon:L.divIcon({className:`snowline-click-label snowline-probe-${status}${dry?' snowline-card-dry':''}`,html:`<span style="--snowline-color:${snowlineColor};--probe-accent:${accent}">${actions}<button class="snowline-label-close" type="button" aria-label="Close Wintry forecast label" title="Close">×</button><div class="snowline-point-place">${escapeLabelText(clickedPlaceName||formatCoordinate(lat,lon))}</div><b>${mainText}</b>${detail}</span>`,iconSize:[0,0],iconAnchor:[0,0]})}).addTo(clickLayer);marker.on('click',(event:any)=>{const original=event?.originalEvent,target=original?.target as HTMLElement|undefined,graph=target?.closest?.('.snowline-label-chart'),jump=target?.closest?.('.snowline-event-jump'),fav=target?.closest?.('.snowline-label-favourite') as HTMLButtonElement|null,share=target?.closest?.('.snowline-label-share') as HTMLButtonElement|null,close=target?.closest?.('.snowline-label-close');if(!graph&&!jump&&!fav&&!share&&!close)return;try{L.DomEvent.stop(original)}catch{}if(graph){if(clickedPoint){forecastTab='graph';chartOpen=true}return}if(jump&&clickedNextEventTime!==null){try{(store as any).set('timestamp',clickedNextEventTime)}catch{}forecastTab='graph';chartOpen=true;return}if(fav){void toggleCurrentFavourite(fav);return}if(share){void shareCurrentPoint(share);return}clearPointState(true)})}

  function updatePersistentClickLabel(){if(!enabled){clearClickLayer();return}if(!clickedPoint||!clickedLatLon||!clickedPoint.times.length)return;clickedNextEventTime=null;const[lat,lon]=clickedLatLon,target=getStoreTimestamp(),first=clickedPoint.times[0],end=Math.min(clickedPoint.times.at(-1)!,first+MAX_FORECAST_HOURS*3600_000);if(target<first-30*60_000||target>end+30*60_000){showClickLabel(lat,lon,'Outside +144 h');return}const index=forecastIntervalIndex(clickedPoint.times,target);if(index<0){showClickLabel(lat,lon,'Forecast unavailable at this time');return}const valid=clickedPoint.times[index],profile=buildProfile(clickedPoint.forecast,index),slr=wetBulbZeroHeight(profile),snowline=slr.snowLevelM!==null&&Number.isFinite(slr.snowLevelM)?slr.snowLevelM:null;if(snowline===null){
      const precip=precipMmAtTime(clickedPoint.forecast,clickedPoint.times,target),phase=clickedMapElevationM!==null&&isPrecipitating(precip)?phaseAt(clickedPoint,index,clickedMapElevationM):null;
      const detail=`<div class="snowline-valid">${shortValid(valid)}</div><div class="snowline-label-grid">${metricTile('Terrain',formatElevation(clickedMapElevationM,unitSystem),'metric-terrain')}${metricTile('Avg precip',formatPrecip(precip,unitSystem),'')}</div>`;
      showClickLabel(lat,lon,phase?`${phase.icon} ${precipitationLabel(phase).toUpperCase()}`:precip===0?'DRY':'—',detail,'#fff','neutral',phase?.key??null);return
    }const rounded=Math.round(snowline/10)*10,tendency=tendencyText(clickedPoint,index),precip=precipMmAtTime(clickedPoint.forecast,clickedPoint.times,target),hasPrecip=isPrecipitating(precip);if(clickedMapElevationM!==null&&Number.isFinite(clickedMapElevationM)){const terrain=Math.round(clickedMapElevationM/10)*10,difference=clickedMapElevationM-snowline,status=statusForDifference(difference),phase=hasPrecip?terrainPrecipitationType(profile,clickedMapElevationM):null;const grid=labelGrid({valid:shortValid(valid),terrain,snowline:rounded,difference,precip,hasPrecip});if(phase){showClickLabel(lat,lon,`${phase.icon} ${precipitationLabel(phase).toUpperCase()}`,grid,colorForLevel(snowline),status,phase?.key??null);return}showClickLabel(lat,lon,conditionLabel(precip,phase).toUpperCase(),grid,colorForLevel(snowline),status,phase?.key??null);return}showClickLabel(lat,lon,formatElevation(rounded,unitSystem),`<div class="snowline-label-grid"><span><small>Valid</small><strong>${shortValid(valid)}</strong></span><span><small>Trend</small><strong>${tendency||'—'}</strong></span></div>`,colorForLevel(snowline),'neutral')}

  async function probeLocation(lat:number,lon:number,source:PointSource,placeName:string|null=null){
    if(!enabled||destroyed||!Number.isFinite(lat)||!Number.isFinite(lon))return;
    placeAbort?.abort();placeAbort=null;
    const keep=chartOpen,my=++clickGeneration;
    clickedPoint=null;clickedMapElevationM=null;clickedNextEventTime=null;
    clickedLatLon=[lat,lon];clickedPlaceName=placeName;pointSource=source;probeLoading=true;
    showClickLabel(lat,lon,'Loading forecast…');
    if(!placeName)void updatePointPlaceName(lat,lon,my);
    try{
      const[point,elev,fields]=await Promise.all([loadPoint(lat,lon,3),loadMapElevation(lat,lon),loadPrecipFields(lat,wrappedLongitude(lon))]);
      if(my!==clickGeneration||pointSource!==source||!enabled||destroyed)return;
      if(!point||!point.times.length||!profileIsFresh(point.fetchedAt,point.runTime,activeRunTime)){showClickLabel(lat,lon,'Forecast unavailable','<div class="snowline-loading">Select this place again to retry.</div>');return}
      const aligned=alignSelectedPrecipFields(fields,point.times,point.runTime);
      clickedPoint=Object.keys(aligned).length?{...point,forecast:{...point.forecast,...aligned}}:point;
      clickedMapElevationM=elev;clickedPoint.terrainM=elev;lastChecked=Date.now();
      if(keep)chartOpen=true;updatePersistentClickLabel();
    }finally{if(my===clickGeneration)probeLoading=false}
  }
  export function isEnabled(){return enabled}
  export function selectMapPoint(lat:number,lon:number){if(!enabled||!Number.isFinite(lat)||!Number.isFinite(lon))return;void probeLocation(lat,lon,'map-click')}
  function handlePlaceSelect(event:CustomEvent<PlaceSelection>){if(!enabled||!event?.detail)return;const{lat,lon,primary,secondary}=event.detail;if(!Number.isFinite(lat)||!Number.isFinite(lon))return;const name=[primary,secondary].map(v=>String(v??'').trim()).filter(Boolean).join(', ');pointSource='search';const selection=++clickGeneration;map.panTo([lat,lon],{animate:true});setTimeout(()=>{if(!destroyed&&selection===clickGeneration&&pointSource==='search')void probeLocation(lat,lon,'search',name||null)},120)}
  function handleV21Select(event:CustomEvent<PlaceSelection>){handlePlaceSelect(event)}
  function handleSearchClear(){if(pointSource==='search'&&!chartOpen)clearPointState(true)}

  function lineLength(line:ContourPolyline){
    let total=0;
    for(let i=1;i<line.length;i++){const a=map.latLngToContainerPoint(line[i-1]),b=map.latLngToContainerPoint(line[i]);total+=Math.hypot(b.x-a.x,b.y-a.y)}
    return total;
  }
  function midpointAlongLine(line:ContourPolyline):[number,number]|null{
    if(line.length<2)return null;
    const total=lineLength(line);let travelled=0;
    for(let i=1;i<line.length;i++){
      const a=map.latLngToContainerPoint(line[i-1]),b=map.latLngToContainerPoint(line[i]),length=Math.hypot(b.x-a.x,b.y-a.y);
      if(length>0&&travelled+length>=total/2){const f=(total/2-travelled)/length;return[line[i-1][0]+f*(line[i][0]-line[i-1][0]),line[i-1][1]+f*(line[i][1]-line[i-1][1])]}
      travelled+=length;
    }
    return line[0];
  }
  function drawDeclutteredLabels(candidates:LabelCandidate[],layer:any){
    const size=map.getSize(),w=Number(size.x),h=Number(size.y),max=w<520?5:w<900?8:12;
    const ordered=[...candidates].sort((a,b)=>a.isMajor!==b.isMajor?(a.isMajor?-1:1):b.length-a.length);
    const occupied:{x:number;y:number}[]=[];
    for(const c of ordered){
      if(occupied.length>=max)break;
      const p=map.latLngToContainerPoint(c.point);
      if(p.x<54||p.x>w-54||p.y<24||p.y>h-60)continue;
      if(occupied.some(o=>Math.abs(p.x-o.x)<110&&Math.abs(p.y-o.y)<38))continue;
      L.marker(c.point,{interactive:false,icon:L.divIcon({className: 'snowline-label'+(c.isMajor?' snowline-label-major':' '),html: '<span style="--snowline-color:'+c.color+'">'+formatElevation(c.level,unitSystem)+'</span>',iconSize:[96,22],iconAnchor:[48,11]})}).addTo(layer);
      occupied.push({x:p.x,y:p.y});
    }
  }
  function addTerrainHatching(field:GridPoint[][],layer:any,target:number){
    const projected=field.map((row,r)=>row.map((v,c)=>{
      const point=map.latLngToLayerPoint([v.lat,v.lon]),terrain=cache[r]?.[c]?.terrainM;
      return{x:point.x,y:point.y,difference:dryTerrainDifference(mapPrecipAt(cache[r]?.[c]??null,target),terrain??null,v.value)};
    }));
    const lines=terrainHatchSegments(projected,24).map(line=>line.map(([x,y])=>map.layerPointToLatLng([x,y])));
    if(lines.length)L.polyline(lines,{color:'#ef70cf',weight:1.8,opacity:.65,interactive:false,lineCap:'butt',smoothFactor:0}).addTo(layer);
  }
  function interpolatedSnowline(p:CachedPoint,target:number):number|null{
    const i=nearestIndex(p.times,target),t=p.times[i];
    if(t===target)return snowlineAt(p,i);
    const a=t<target?i:i-1,b=a+1;
    if(a<0||b>=p.times.length)return snowlineAt(p,i);
    const lo=snowlineAt(p,a),hi=snowlineAt(p,b),gap=p.times[b]-p.times[a];
    if(lo===null||hi===null||gap<=0||gap>3*3600_000)return null;
    return lo+(hi-lo)*(target-p.times[a])/gap;
  }
  function mapPrecipAt(p:CachedPoint|null,target:number){
    if(!p)return null;
    return precipMmAtTime(p.forecast,p.times,target);
  }
  function rasterZoom(){const b=currentBounds();return viewportRasterZoom(map.getSize().x,b.west,b.east,map.getZoom());}
  function cancelMapPreparation(){prepareGeneration++;videoAbort?.abort();videoAbort=null;exportingMap=false;preparingMap=false;prepareMessage=`Stopped · ${preparedKeys.size} times prepared`;}
  function resetMapPreparation(){cancelMapPreparation();preparedKeys.clear();preparedReadKey='';prepareMessage='';}
  function restorePreparedFrame(record:StoredFrame):RasterFrame{
    const shading=L.layerGroup(),icons=L.layerGroup(),geography=L.layerGroup();
    const pane=map.getPane(PRECIP_PANE)||map.createPane(PRECIP_PANE);pane.style.zIndex='390';pane.style.pointerEvents='none';
    const geoPane=map.getPane(GEOGRAPHY_ID)||map.createPane(GEOGRAPHY_ID);geoPane.style.zIndex='395';geoPane.style.pointerEvents='none';
    for(const t of record.tiles)precipRasterLayer(L,t.url,t.nw,t.se,PRECIP_PANE).addTo(shading);
    for(const s of record.symbols)L.marker([s.lat,s.lon],{interactive:false,keyboard:false,zIndexOffset:1000,icon:L.divIcon({className:'wintry-precip-icon',html:s.html,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(icons);
    for(const t of record.geography)L.imageOverlay(t.url,[[t.se.lat,t.nw.lon],[t.nw.lat,t.se.lon]],{pane:GEOGRAPHY_ID,opacity:.45,interactive:false,className:'wintry-geographic-tile'}).addTo(geography);
    return {shading,icons,geography,fallback:record.fallback,geographyError:record.geographyError,bytes:record.bytes,record};
  }
  async function prepareMapForecast(){
    if(preparingMap||!enabled||!showShading||!precipDetailAvailable||viewportLoading||terrainLoading||rasterLoading||!cache.length)return;
    const points=cache.flat().filter((p):p is CachedPoint=>!!p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime));
    if(!points.length)return;
    const videoTimes=forecastMovieTimes(points.map(p=>p.times),points.map(p=>p.times.map((_,i)=>supportedIntervalEnd(p.times,i,p.forecast.__precipPeriodsH))));
    const seen=new Set<string>(),times=videoTimes.filter(t=>{const key=phaseFrameKey(t);if(seen.has(key))return false;seen.add(key);return true;});
    const reference=getStoreTimestamp(),scene=phaseFrameKey(reference),my=++prepareGeneration;
    const options=JSON.stringify([showContours,showIcons,unitSystem]);
    const current=()=>my===prepareGeneration&&enabled&&!destroyed&&scene===phaseFrameKey(reference)&&options===JSON.stringify([showContours,showIcons,unitSystem]);
    const started=Date.now();preparingMap=true;preparedKeys.clear();prepareMessage=`0 / ${times.length} times…`;
    if(prefetchTimer){clearTimeout(prefetchTimer);prefetchTimer=null;}rasterEpoch++;
    try{
      if(!times.length)throw new Error('No available forecast times for MP4');
      const size=videoSize(map.getSize().x,map.getSize().y+196);
      const exportAvailable=await canExportMapForecast(size.width,size.height);if(!current())return;
      if(videoDownloadUrl){URL.revokeObjectURL(videoDownloadUrl);videoDownloadUrl='';}
      await preparedMapCache.clear();
      for(let i=0;i<times.length&&current();){
        if(rasterLoading||viewportLoading||terrainLoading||prefetchBusy){await new Promise(resolve=>setTimeout(resolve,150));continue;}
        const frame=await paintShading(times[i],true,true);
        if(!current())break;
        if(!frame){await new Promise(resolve=>setTimeout(resolve,150));continue;}
        const key=phaseFrameKey(times[i]);await preparedMapCache.put(key,frame.record);
        if(!current())break;
        preparedKeys.add(key);i++;const minutes=Math.ceil((Date.now()-started)/60000/i*(times.length-i));
        prepareMessage=`${i} / ${times.length} times${i>1&&minutes>0?` · ~${minutes} min left`:'…'}`;
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      if(current()){
        if(exportAvailable)await downloadMapForecastVideo(videoTimes,current);
        else prepareMessage=`Map ready · ${preparedKeys.size} times · MP4 unavailable in this browser`;
      }
      else if(my===prepareGeneration)prepareMessage='Preparation stopped · forecast changed; refresh to try again';
    }catch(error){if(current()){prepareMessage=error instanceof Error?`${error.message} · ${preparedKeys.size} times prepared`:'Preparation unavailable · normal timeline still works';preparedMapCache.close();}}
    finally{if(my===prepareGeneration){preparingMap=false;exportingMap=false;scheduleNextFrame();}}
  }

  async function downloadMapForecastVideo(times:number[],current:()=>boolean){
    const abort=new AbortController();videoAbort=abort;exportingMap=true;
    const requireCurrent=()=>{if(!current())abort.abort();abort.signal.throwIfAborted();};
    const size=map.getSize(),header=76,footer=120,dimensions=videoSize(size.x,size.y+header+footer);
    const canvas=document.createElement('canvas');canvas.width=dimensions.width;canvas.height=dimensions.height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Video canvas unavailable');
    const sx=canvas.width/size.x,sy=canvas.height/(size.y+header+footer);
    const base=document.createElement('canvas');base.width=canvas.width;base.height=Math.max(2,Math.round(size.y*sy));
    const bc=base.getContext('2d');if(!bc)throw new Error('Video map canvas unavailable');
    const drawTile=(context:CanvasRenderingContext2D,image:CanvasImageSource,t:FrameTile)=>{
      const nw=map.latLngToContainerPoint([t.nw.lat,t.nw.lon]),se=map.latLngToContainerPoint([t.se.lat,t.se.lon]);
      context.drawImage(image,nw.x,nw.y,se.x-nw.x,se.y-nw.y);
    };
    try{
      prepareMessage='MP4 · loading map background…';requireCurrent();
      const z=rasterZoom(),tiles=typeof getMapTiles==='function'?getMapTiles():{},kind=String(store.get('map')??'sznmap');
      const template=(Math.floor(Number(map.getZoom()))<=11?(tiles as any).graymap:(tiles as any)[kind]??(tiles as any).sznmap)
        ??'https://tiles.windy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}/?lang=en';
      bc.scale(sx,sy);
      await mapLimit(visibleRasterTiles(currentBounds(),z),4,async t=>{
        requireCurrent();const n=2**z,url=template.replace('{z}',String(z)).replace('{x}',String(((t.x%n)+n)%n)).replace('{y}',String(t.y));
        const image=await geographicTiles.get(url);requireCurrent();
        drawTile(bc,image,{url,nw:tileLocation(t.x,t.y,z),se:tileLocation(t.x+1,t.y+1,z)});
      });
      const symbolImages=new Map<string,HTMLImageElement>();
      const blob=await encodeMapForecast(canvas,times,async time=>{
        requireCurrent();const record=await preparedMapCache.get(phaseFrameKey(time));requireCurrent();
        if(!record)throw new Error('Prepared frame unavailable. Prepare this area again.');
        ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#132431';ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(base,0,header*sy);
        ctx.save();ctx.setTransform(sx,0,0,sy,0,header*sy);
        ctx.beginPath();ctx.rect(0,0,size.x,size.y);ctx.clip();
        for(const tile of record.tiles){const image=await videoImage(tile.url,abort.signal);requireCurrent();drawTile(ctx,image,tile);}
        ctx.globalAlpha=.45;
        for(const tile of record.geography){const image=await videoImage(tile.url,abort.signal);requireCurrent();drawTile(ctx,image,tile);}
        ctx.globalAlpha=1;
        if(showContours)drawVideoContours(ctx,time);
        if(showIcons)for(const symbol of record.symbols){
          const svg=symbol.html.match(/<svg[\s\S]*<\/svg>/)?.[0];if(!svg)continue;
          let image=symbolImages.get(svg);if(!image){image=await videoImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),abort.signal);symbolImages.set(svg,image);}
          requireCurrent();const p=map.latLngToContainerPoint([symbol.lat,symbol.lon]);ctx.drawImage(image,p.x-14,p.y-14,28,28);
        }
        ctx.restore();ctx.setTransform(1,0,0,1,0,0);
        drawVideoCaption(ctx,time,canvas.width,canvas.height,header*sy,footer*sy,record.fallback||mapDataMissing);
      },abort.signal,(done,total)=>{if(current())prepareMessage=`Encoding MP4 · ${done} / ${total} times`;});
      requireCurrent();videoDownloadUrl=URL.createObjectURL(blob);videoDownloadName=`wintry-forecast-${new Date(times[0]).toISOString().replace(/[:.]/g,'-')}.mp4`;
      const link=document.createElement('a');link.href=videoDownloadUrl;link.download=videoDownloadName;document.body.appendChild(link);link.click();link.remove();
      prepareMessage=`MP4 ready · ${times.length} times · download available below`;
    }finally{if(videoAbort===abort){videoAbort=null;exportingMap=false;}canvas.width=canvas.height=base.width=base.height=0;}
  }

  function drawVideoContours(ctx:CanvasRenderingContext2D,target:number){
    const field=cache.map(row=>row.map(p=>p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime)
      ?{lat:p.lat,lon:p.lon,value:interpolatedSnowline(p,target)}:{lat:0,lon:0,value:null}));
    const prepared=prepareSnowlineContours(field,contourIntervalForZoom()),lines=contourLinesForLevels(prepared.field,prepared.levels);
    ctx.lineJoin='round';ctx.lineCap='round';
    const labels:{x:number;y:number}[]=[];
    for(const level of prepared.levels){
      const paths=lines.get(level)??[],colour=colorForLevel(level),weight=level%1000===0?3:level%500===0?2.2:1.5;
      ctx.beginPath();for(const line of paths)line.forEach((p,i)=>{const q=map.latLngToContainerPoint(p);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});
      ctx.strokeStyle='#14212b';ctx.lineWidth=weight+2;ctx.stroke();ctx.strokeStyle=colour;ctx.lineWidth=weight;ctx.stroke();
      if(level%500!==0)continue;
      for(const line of [...paths].sort((a,b)=>lineLength(b)-lineLength(a))){
        if(labels.length>=12||lineLength(line)<110)continue;const mid=midpointAlongLine(line);if(!mid)continue;
        const p=map.latLngToContainerPoint(mid),size=map.getSize();if(p.x<45||p.x>size.x-45||p.y<20||p.y>size.y-20||labels.some(l=>Math.abs(l.x-p.x)<100&&Math.abs(l.y-p.y)<32))continue;
        ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#14212b';ctx.strokeText(formatElevation(level,unitSystem),p.x,p.y);
        ctx.fillStyle=colour;ctx.fillText(formatElevation(level,unitSystem),p.x,p.y);labels.push(p);break;
      }
    }
  }

  function drawVideoCaption(ctx:CanvasRenderingContext2D,time:number,width:number,height:number,header:number,footer:number,uncertain:boolean){
    const font=Math.max(10,Math.min(16,width/40)),pad=12;ctx.textAlign='left';ctx.fillStyle='#132431';ctx.fillRect(0,0,width,header);ctx.fillRect(0,height-footer,width,footer);
    ctx.fillStyle='#fff';ctx.font=`bold ${font+3}px sans-serif`;ctx.fillText('Wintry forecast · ECMWF',pad,header*.35,width-pad*2);
    ctx.font=`${font}px sans-serif`;ctx.fillText(formatLocal(time),pad,header*.67,width-pad*2);
    const legend=[['Rain','rain'],['Freezing rain','freezing-rain'],['Ice pellets','ice-pellets'],['Snow','snow'],['Wet snow','wet-snow'],['Rain/snow mix','mix']];
    const columns=width<600?2:3,rows=Math.ceil(legend.length/columns),step=footer*.5/rows,top=height-footer+font+3;
    ctx.font=`${Math.max(10,font-1)}px sans-serif`;
    legend.forEach(([label,key],i)=>{const x=pad+(i%columns)*(width-pad*2)/columns,y=top+Math.floor(i/columns)*step;ctx.fillStyle=(PRECIP_TYPE_COLOURS as Record<string,string>)[key];ctx.fillRect(x,y-9,10,10);ctx.fillStyle='#fff';ctx.fillText(label,x+15,y,(width-pad*2)/columns-18);});
    ctx.fillStyle='#d1dce4';ctx.font=`${Math.max(9,font-3)}px sans-serif`;
    const notes=[`${showContours?'Contours: estimated snowline · ':''}Blank: dry or unavailable`,
      'Map: Windy / OpenStreetMap contributors · Terrain: Mapzen / Tilezen',
      'Forecast guidance · No Windy weather layer or lightning · 5 forecast h/s'];
    notes.forEach((note,i)=>ctx.fillText(note,pad,height-footer*.32+i*footer*.105,width-pad*2));
  }
  function phaseFrameKey(target:number){
    const b=currentBounds(),size=map.getSize();
    // The map diagnosis uses the represented profile interval, not invented hourly profiles.
    const intervals=cache.flat().map(p=>{
      if(!p||!profileIsFresh(p.fetchedAt,p.runTime,activeRunTime))return -2;
      const i=forecastIntervalIndex(p.times,target);
      return i>=0&&target>=supportedIntervalEnd(p.times,i,p.forecast.__precipPeriodsH)?-3:i;
    });
    return JSON.stringify([weatherRevision,terrainRevision,activeRunTime,rasterZoom(),Number(map.getZoom()),size.x,size.y,b,showShading,store.get('map'),intervals]);
  }
  function rememberFrame(key:string,frame:RasterFrame){
    if(frame.bytes>FRAME_PIXEL_BUDGET)return;
    frameCache.delete(key);frameCache.set(key,frame);
    while(frameCache.size>6||[...frameCache.values()].reduce((sum,f)=>sum+f.bytes,0)>FRAME_PIXEL_BUDGET){
      const oldest=frameCache.keys().next().value!;
      if(oldest===activePhaseKey&&frameCache.size>1){const active=frameCache.get(oldest)!;frameCache.delete(oldest);frameCache.set(oldest,active);continue;}
      frameCache.delete(oldest);
    }
  }
  async function applyFrame(key:string,frame:RasterFrame){
    const epoch=rasterEpoch;
    const ready=await Promise.all(frame.shading.getLayers().map((layer:any)=>layer.ready??true));
    if(destroyed||!enabled||epoch!==rasterEpoch||key!==phaseFrameKey(getStoreTimestamp()))return;
    if(ready.some(value=>!value)){rasterLoading=false;terrainDetailStatus='Shading image unavailable · retry refresh';return;}
    const previous=[shadingLayer,precipIconLayer,geographyLayer];
    frame.shading.addTo(map);if(showIcons)frame.icons.addTo(map);frame.geography?.addTo(map);
    shadingLayer=frame.shading;precipIconLayer=showIcons?frame.icons:null;geographyLayer=frame.geography;activePhaseKey=key;pendingPhaseKey=key;
    for(const layer of previous)if(layer&&layer!==shadingLayer&&layer!==precipIconLayer&&layer!==geographyLayer)try{map.removeLayer(layer)}catch{}
    geographyError=frame.geographyError;terrainDetailStatus=frame.fallback&&!terrainLoading?'Terrain detail unavailable here · coarse estimate':'';rasterLoading=false;scheduleNextFrame();
  }
  function scheduleNextFrame(){
    if(preparingMap||prefetchTimer||prefetchBusy||viewportLoading||terrainLoading||destroyed||!enabled)return;
    const active=frameCache.get(activePhaseKey);if(!active||active.bytes*2>FRAME_PIXEL_BUDGET)return;
    const point=cache.flat().find((p):p is CachedPoint=>!!p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime));if(!point)return;
    const i=forecastIntervalIndex(point.times,getStoreTimestamp()),next=point.times[i+1];
    if(i<0||!Number.isFinite(next)||frameCache.has(phaseFrameKey(next))||preparedKeys.has(phaseFrameKey(next))||phaseFrameKey(next)===skippedPrefetchKey)return;
    prefetchTimer=setTimeout(()=>{prefetchTimer=null;prefetchBusy=true;void paintShading(next,true).finally(()=>prefetchBusy=false)},200);
  }
  function queueRasterPaint(){
    if(rasterTimer||destroyed||!enabled)return;
    rasterTimer=setTimeout(()=>{rasterTimer=null;void paintShading(getStoreTimestamp());},80);
  }
  function renderPrecipitation(target:number){
    if(!precipDetailAvailable||(!showShading&&!showIcons)){clearShading();return;}
    const pane=map.getPane(PRECIP_PANE)||map.createPane(PRECIP_PANE);pane.style.zIndex='390';pane.style.pointerEvents='none';
    rasterTarget=target;
    const b=currentBounds(),z=rasterZoom(),terrainKey=[z,b.south,b.north,b.west,b.east].join(':');
    if(terrainKey!==terrainJobKey){
      terrainJobKey=terrainKey;const epoch=++terrainGeneration;terrainLoadProgress=0;terrainLoading=true;terrainDetailStatus='';rasterEpoch++;
      void terrainTiles.ensure(b,z,()=>epoch===terrainGeneration&&enabled&&!destroyed,(done,total)=>{terrainLoadProgress=total?done/total:1;}).then(complete=>{
        if(epoch!==terrainGeneration||destroyed||!enabled)return;terrainLoading=false;terrainComplete=complete;terrainRevision++;reliefCache.clear();frameCache.clear();renderPrecipitation(getStoreTimestamp());
      });
    }
    // Finish the terrain batch before replacing the visible frame.
    if(terrainLoading)return;
    const key=phaseFrameKey(target);
    if(key!==pendingPhaseKey){rasterLoadProgress=0;rasterEpoch++;pendingPhaseKey=key;if(rasterTimer){clearTimeout(rasterTimer);rasterTimer=null;}}
    if(key===activePhaseKey&&shadingLayer){const current=frameCache.get(key);if(current&&showIcons!==!!precipIconLayer)applyFrame(key,current);else if(showIcons&&!precipIconLayer){rasterLoading=true;queueRasterPaint();return;}rasterLoading=false;scheduleNextFrame();return;}
    const frame=frameCache.get(key);
    if(frame){rememberFrame(key,frame);applyFrame(key,frame);scheduleNextFrame();return;}
    if(preparedKeys.has(key)){
      if(preparedReadKey===key)return;
      preparedReadKey=key;rasterLoading=true;const epoch=++rasterEpoch;
      void preparedMapCache.get(key).then(record=>{
        if(destroyed||!enabled||epoch!==rasterEpoch||key!==phaseFrameKey(getStoreTimestamp()))return;
        if(record){const restored=restorePreparedFrame(record);applyFrame(key,restored);rememberFrame(key,restored);}
        else{preparedKeys.delete(key);queueRasterPaint();}
      }).catch(()=>{if(epoch===rasterEpoch&&!destroyed){preparedKeys.delete(key);queueRasterPaint();}}).finally(()=>{if(preparedReadKey===key)preparedReadKey='';});return;
    }
    rasterLoading=true;queueRasterPaint();
  }
  async function terrainRelief(tile:{x:number;y:number},z:number){
    const key=[terrainRevision,z,tile.x,tile.y].join(':'),hit=reliefCache.get(key);if(hit)return hit;
    const side=TILE_SIZE+2,heights=terrainTiles.raster(tile.x,tile.y,z,TILE_SIZE,1);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=TILE_SIZE;
    const ctx=canvas.getContext('2d');if(!ctx)return null;
    const image=ctx.createImageData(TILE_SIZE,TILE_SIZE);
    for(let y=0;y<TILE_SIZE;y++){
      const lat=tileLocation(tile.x+.5,tile.y+(y+.5)/TILE_SIZE,z).lat;
      const metres=40075016.686*Math.cos(lat*Math.PI/180)/(TILE_SIZE*2**z);
      for(let x=0;x<TILE_SIZE;x++){
        const i=(y+1)*side+x+1,v=terrainIllumination(heights[i-1],heights[i+1],heights[i-side],heights[i+side],metres),o=(y*TILE_SIZE+x)*4;
        image.data[o]=image.data[o+1]=image.data[o+2]=v;image.data[o+3]=255;
      }
    }
    ctx.putImageData(image,0,0);reliefCache.set(key,canvas);
    while(reliefCache.size>32)reliefCache.delete(reliefCache.keys().next().value!);
    return canvas;
  }
  async function paintShading(target:number,background=false,preparation=false):Promise<RasterFrame|undefined>{
    if(!enabled||!precipDetailAvailable||(!showShading&&!showIcons)||destroyed||!cache.length||terrainLoading)return;
    const key=phaseFrameKey(target),mainKey=phaseFrameKey(getStoreTimestamp());
    if(background&&frameCache.has(key)){const cached=frameCache.get(key)!;if(preparation)await cached.geographyPromise;return cached;}
    const epoch=background?rasterEpoch:++rasterEpoch,b=currentBounds(),z=rasterZoom(),detailZoom=Number(map.getZoom()),stencil=weatherInterpolator(cache),next=L.layerGroup();
    const preparationEpoch=prepareGeneration;
    if(!background)rasterLoadProgress=0;
    const obsolete=()=>epoch!==rasterEpoch||destroyed||!enabled||(preparation&&preparationEpoch!==prepareGeneration)||(background&&!preparation&&mainKey!==phaseFrameKey(getStoreTimestamp()));
    const record:StoredFrame={tiles:[],symbols:[],geography:[],fallback:false,geographyError:'',bytes:0};
    const profiles=new Map<CachedPoint,ReturnType<typeof buildProfile>>(),amounts=new Map<CachedPoint,number|null>();
    for(const p of cache.flat())if(p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime)){
      const i=forecastIntervalIndex(p.times,target);profiles.set(p,i<0?[]:buildProfile(p.forecast,i));amounts.set(p,mapPrecipAt(p,target));
    }
    let fallback=!terrainComplete;
    const levels=[...new Set<PressureLevel>([...PRESSURE_LEVELS,...[...profiles.values()].flatMap(p=>p.map(v=>v.level))])]
      .sort((a,b)=>Number(b.slice(0,-1))-Number(a.slice(0,-1)));
    const blend=continuousProfileBlender({levels,reuseResult:true});
    function diagnose(lat:number,lon:number,pixelTerrain?:number){
      const neighbours=stencil(lat,lon);if(!neighbours||neighbours.some(v=>!profiles.has(v.value)))return null;
      const amount=weightedScalar(neighbours,p=>amounts.get(p)??null),shade=precipitationShade(amount,detailZoom);if(!shade)return null;
      const detailed=terrainComplete?(pixelTerrain===undefined?terrainTiles.sample(lat,lon,z):Number.isFinite(pixelTerrain)?pixelTerrain:null):null,terrain=detailed??weightedScalar(neighbours,p=>p.terrainM);
      if(terrain===null)return null;if(detailed===null)fallback=true;
      const profile=blend(neighbours.map(v=>({value:profiles.get(v.value)!,weight:v.weight})));
      const phase=terrainPrecipitationType(profile,terrain);if(!phase)return null;return{phase,shade};
    }
    try{
      if(showShading&&[...amounts.values()].some(value=>value!==null&&value>0)){
        const tiles=visibleRasterTiles(b,z),centre=map.getCenter();tiles.sort((a,c)=>{const x=tileLocation(a.x+.5,a.y+.5,z),y=tileLocation(c.x+.5,c.y+.5,z);return(x.lat-centre.lat)**2+(x.lon-centre.lng)**2-((y.lat-centre.lat)**2+(y.lon-centre.lng)**2)});
        let paintedTiles=0;
        for(const tile of tiles){
          if(obsolete()){next.clearLayers();return;}
          const terrain=terrainComplete?terrainTiles.raster(tile.x,tile.y,z,RASTER_SAMPLES):null;
          const canvas=document.createElement('canvas');canvas.width=RASTER_SAMPLES;canvas.height=RASTER_SAMPLES;
          const ctx=canvas.getContext('2d');if(!ctx)continue;const image=ctx.createImageData(RASTER_SAMPLES,RASTER_SAMPLES);let wet=false;
          for(let y=0;y<RASTER_SAMPLES;y++){
          if(y>0&&y%32===0){if(!background)rasterLoadProgress=.9*(paintedTiles+y/RASTER_SAMPLES)/tiles.length;await new Promise(resolve=>setTimeout(resolve,0));if(obsolete()){next.clearLayers();return;}}
          for(let x=0;x<RASTER_SAMPLES;x++){
            const p=tileLocation(tile.x+(x+.5)/RASTER_SAMPLES,tile.y+(y+.5)/RASTER_SAMPLES,z);
            if(p.lat<b.south||p.lat>b.north||p.lon<b.west||p.lon>b.east)continue;
            const result=diagnose(p.lat,p.lon,terrain?.[y*RASTER_SAMPLES+x]);if(!result)continue;wet=true;const rgb=hexToRgb(PRECIP_TYPE_COLOURS[result.phase.key]).map(v=>Math.round(result.shade.tone>=0?v+(255-v)*result.shade.tone:v*(1+result.shade.tone))),i=(y*RASTER_SAMPLES+x)*4;
            const light=1;
            image.data[i]=Math.min(255,Math.round(rgb[0]*light));image.data[i+1]=Math.min(255,Math.round(rgb[1]*light));image.data[i+2]=Math.min(255,Math.round(rgb[2]*light));image.data[i+3]=Math.round(PRECIP_SHADING_OPACITY*255);
          }
          }
          if(wet){
            ctx.putImageData(image,0,0);const full=document.createElement('canvas');full.width=TILE_SIZE;full.height=TILE_SIZE;const fc=full.getContext('2d');
            if(fc){fc.imageSmoothingEnabled=false;fc.drawImage(canvas,0,0,TILE_SIZE,TILE_SIZE);const nw=tileLocation(tile.x,tile.y,z),se=tileLocation(tile.x+1,tile.y+1,z);
              const relief=terrainComplete?await terrainRelief(tile,z):null;if(obsolete()){next.clearLayers();return;}
              const textured=relief?colourTerrainTile(full,relief):full;
              const url=textured.toDataURL('image/png');record.tiles.push({url,nw,se});
              precipRasterLayer(L,url,nw,se,PRECIP_PANE).addTo(next);}
          }
          paintedTiles++;if(!background)rasterLoadProgress=.9*paintedTiles/tiles.length;
          // Yield between small tiles so dragging and the forecast controls stay responsive.
          await new Promise(resolve=>setTimeout(resolve,0));
        }
      }
      if(obsolete()){next.clearLayers();return;}
      const iconLayer=L.layerGroup(),size=map.getSize();let spacing=72;
      while(Math.ceil(size.x/spacing)*Math.ceil(size.y/spacing)>80)spacing+=8;
      // Prepare bounded symbols with each frame so the Icons switch never rebuilds its shading.
      if(detailZoom>=PRECIP_DETAIL_MIN_ZOOM)for(let y=spacing/2;y<size.y;y+=spacing)for(let x=spacing/2;x<size.x;x+=spacing){
        const p=map.containerPointToLatLng([x,y]),result=diagnose(p.lat,p.lng);if(!result)continue;
        const html=`<span role="img" aria-label="${result.phase.label}">${precipitationIconSvg(result.phase.key)}</span>`;
        record.symbols.push({lat:p.lat,lon:p.lng,html});
        L.marker([p.lat,p.lng],{interactive:false,keyboard:false,zIndexOffset:1000,icon:L.divIcon({className:'wintry-precip-icon',html,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(iconLayer);
      }
      if(obsolete()){next.clearLayers();iconLayer.clearLayers();return;}
      if(!background)rasterLoadProgress=1;
      record.fallback=fallback;record.bytes=record.tiles.length*TILE_SIZE*TILE_SIZE*4+iconLayer.getLayers().length*4096;
      const frame:RasterFrame={shading:next,icons:iconLayer,geography:null,fallback,geographyError:'',bytes:record.bytes,record};
      if(preparation)return frame;
      if(background&&frame.bytes+(frameCache.get(activePhaseKey)?.bytes??0)>FRAME_PIXEL_BUDGET){skippedPrefetchKey=key;next.clearLayers();iconLayer.clearLayers();return;}
      if(!background)applyFrame(key,frame);
      rememberFrame(key,frame);
      if(!background)scheduleNextFrame();
      return frame;
    }catch(error){next.clearLayers();console.warn('Wintry raster rendering failed',error);if(preparation)throw error;if(epoch===rasterEpoch&&!background){rasterLoading=false;terrainDetailStatus='Shading unavailable · retry refresh';}}
  }
  function clearStorms(){
    stormLoading=false;stormEpoch++;stormAbort?.abort();stormAbort=null;stormKey='';
    if(stormLayer)try{map.removeLayer(stormLayer)}catch{}stormLayer=null;
  }
  async function renderStorms(){
    if(!enabled||destroyed||(!showIcons||!precipDetailAvailable)){clearStorms();return}
    const target=getStoreTimestamp(),b=currentBounds(),zoom=map.getZoom();
    const key=[activeRunTime,target,zoom,b.south,b.north,b.west,b.east].join(':');
    if(key===stormKey)return;
    const saved=stormFrames.get(key);
    if(saved&&Date.now()-saved.fetchedAt<15*60_000){clearStorms();stormKey=key;stormLayer=saved.layer.addTo(map);stormStatus=saved.status;stormFrames.delete(key);stormFrames.set(key,saved);return;}
    clearStorms();stormKey=key;const epoch=stormEpoch,abort=stormAbort=new AbortController();
    stormLoadProgress=0;stormLoading=true;stormStatus='⚡ Forecast lightning';
    const tiles=new Map<string,Promise<any>>();
    const deadline=setTimeout(()=>{abort.abort();if(epoch===stormEpoch){stormKey='';stormStatus='⚡ ECMWF lightning unavailable';stormLoading=false}},12000);
    try{
      const params=await createFullRenderingParams('thunder',{product:'ecmwf',overlay:'thunder',level:'surface',acRange:3} as any,target);
      if(epoch!==stormEpoch||abort.signal.aborted)return;
      const sample:any=await new Promise(resolve=>(stormInterpolator??=new TileLayerInterpolator()).createFun(resolve));
      const points=metricGrid(b,stormSpacing(zoom,(b.south+b.north)/2),80,false,Math.SQRT2).points.map(cell=>stormSamplePoint(cell.bounds));
      const next=L.layerGroup();let known=0,count=0,processed=0;
      const mapLibreZoom=(map as any).maplibreMap?.getZoom?.()??zoom-1;
      const dataZoom=getDataZoom(params,lightningTileZoomIndex(mapLibreZoom)),scale=2**dataZoom;
      await mapLimit(points,6,async p=>{
        if(epoch!==stormEpoch||abort.signal.aborted)return;
        try{
        // The interpolator waits for existing tiles; start each distinct thunder tile first.
        const phi=p.lat*Math.PI/180,lon=wrappedLongitude(p.lon);
        const url=applyUrlTemplate(params.fullPath,{z:dataZoom,x:Math.floor((lon+180)/360*scale),y:Math.floor((1-Math.log(Math.tan(phi)+1/Math.cos(phi))/Math.PI)/2*scale)});
        let pending=tiles.get(url);if(!pending){pending=tileLayerSource.get(url,abort.signal);tiles.set(url,pending)}
        const token=await pending;if(!token?.value?.valid||abort.signal.aborted)return;
        const raw=await sample({lat:p.lat,lon},abort,params);
        const density=Array.isArray(raw)?raw[0]:raw;
        if(typeof density==='number'&&Number.isFinite(density)&&density>=0)known++;
        if(!hasForecastLightning(density)||epoch!==stormEpoch||abort.signal.aborted)return;
        count++;
        L.marker([p.lat,p.lon],{interactive:false,keyboard:false,zIndexOffset:1200,
          icon:L.divIcon({className:'wintry-storm-symbol',html:'<span aria-label="ECMWF forecast lightning">⚡</span>',iconSize:[24,28],iconAnchor:[12,14]})}).addTo(next);
        }finally{if(epoch===stormEpoch&&!abort.signal.aborted)stormLoadProgress=++processed/points.length;}
      });
      if(epoch!==stormEpoch||abort.signal.aborted)return;
      next.addTo(map);stormLayer=next;
      stormStatus=known?`⚡ ECMWF forecast lightning · ${count?'activity shown':'none at sampled points'}`:'⚡ ECMWF lightning unavailable';
      if(known){stormFrames.delete(key);stormFrames.set(key,{layer:next,status:stormStatus,fetchedAt:Date.now()});while(stormFrames.size>6)stormFrames.delete(stormFrames.keys().next().value!);}
    }catch(error){
      if(epoch!==stormEpoch||abort.signal.aborted)return;
      stormKey='';stormStatus='⚡ ECMWF lightning unavailable';
      console.warn('Wintry ECMWF lightning unavailable',error);
    }finally{if(epoch===stormEpoch)stormLoading=false;clearTimeout(deadline);for(const pending of tiles.values())void pending.then(token=>{if(token)tileLayerSource.free(token)},()=>{})}
  }
  function renderFromCache(){
    void renderStorms();
    if(!enabled||!cache.length){mapDataStatus='';mapDataMissing=false;clearContours();clearShading();return}
    const target=getStoreTimestamp(),firstPoint=cache.flat().find((p):p is CachedPoint=>p!==null&&p.times.length>0);
    const samples=cache.flat(),fresh=samples.filter((p):p is CachedPoint=>!!p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime)&&forecastIntervalIndex(p.times,target)>=0);
    const known=fresh.filter(p=>mapPrecipAt(p,target)!==null).length;
    mapDataStatus=`Profiles ${fresh.length}/${samples.length} · precip ${known}/${samples.length}`;
    mapDataMissing=fresh.length<samples.length||((showShading||showIcons)&&precipDetailAvailable&&known<samples.length);
    if(!firstPoint){clearContours();clearShading();return}
    const first=firstPoint.times[0],end=Math.min(firstPoint.times.at(-1)!,first+MAX_FORECAST_HOURS*3600_000);
    if(target<first-30*60_000||target>end+30*60_000){clearContours();clearShading();return}
    renderPrecipitation(target);
    if(!showContours){clearContours();return}
    const field:GridPoint[][]=[];
    for(let r=0;r<cache.length;r++){
      const row:GridPoint[]=[];
      for(let c=0;c<cache[r].length;c++){
        const p=cache[r][c];row.push(p&&p.times.length?{lat:p.lat,lon:p.lon,value:interpolatedSnowline(p,target)}:{lat:0,lon:0,value:null});
      }
      field.push(row);
    }
    const interval=contourIntervalForZoom(),{field:contourField,levels}=prepareSnowlineContours(field,interval);
    const next=L.layerGroup(),candidates:LabelCandidate[]=[];
    addTerrainHatching(field,next,target);
    const linesByLevel=contourLinesForLevels(contourField,levels);
    for(const level of levels){
      const lines=linesByLevel.get(level)!.filter(line=>line.length>=2);
      if(!lines.length)continue;
      const is1000=level%1000===0,is500=level%500===0,color=colorForLevel(level),weight=is1000?3:is500?2.2:1.5;
      const common={interactive:false,lineCap:'round',lineJoin:'round',smoothFactor:.5};
      const [red,green,blue]=hexToRgb(color),brightness=.299*red+.587*green+.114*blue;
      const casing=brightness>150?'#14212b':'#ffffff';
      L.polyline(lines,{...common,color:casing,weight:weight+2,opacity:.95}).addTo(next);
      L.polyline(lines,{...common,color,weight,opacity:1}).addTo(next);
      if(is1000||level===-500||(interval===100&&is500)){
        const ranked=lines.map(line=>({line,length:lineLength(line)})).filter(x=>x.length>=110).sort((a,b)=>b.length-a.length).slice(0,3);
        for(const {line,length} of ranked){const point=midpointAlongLine(line);if(point)candidates.push({point,level,color,length,isMajor:is1000})}
      }
    }
    drawDeclutteredLabels(candidates,next);next.addTo(map);const old=contourLayer;contourLayer=next;if(old)try{map.removeLayer(old)}catch{}
  }
  function toggleMapLayers(){
    void renderStorms();
    if(!showContours)clearContours();if(!showShading)clearShading();if(!showIcons)clearPrecipIcons();
    if(!enabled)return;
    if(cache.length)renderFromCache();
    if((showContours||(precipDetailAvailable&&(showShading||showIcons)))&&!cache.length)void refreshViewport();
  }
  function loadPreferences(){try{const p=JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY)||'{}');if(typeof p.enabled==='boolean')enabled=p.enabled;if(typeof p.showContours==='boolean')showContours=p.showContours;if(typeof p.showShading==='boolean')showShading=p.showShading;if(typeof p.showIcons==='boolean')showIcons=p.showIcons;if(typeof p.panelHidden==='boolean')panelHidden=p.panelHidden;if(p.forecastTab==='graph'||p.forecastTab==='sounding')forecastTab=p.forecastTab}catch{}unitSystem=loadUnitSystem();prefsReady=true}
  function persistPreferences(){if(!prefsReady)return;try{localStorage.setItem(PREFS_STORAGE_KEY,JSON.stringify({enabled,panelHidden,forecastTab,showContours,showShading,showIcons}))}catch{}}
  function refreshUnitDependentUi(){if(renderedUnitSystem===unitSystem)return;renderedUnitSystem=unitSystem;if(!enabled)return;if(cache.length&&!viewportLoading)renderFromCache();updatePersistentClickLabel()}
  $: if(prefsReady){enabled;panelHidden;forecastTab;showContours;showShading;showIcons;persistPreferences()}
  $: if(prefsReady){unitSystem;refreshUnitDependentUi()}

  let lastNavigationKey='';
  function handleMapNavigation(){const size=map.getSize(),key=JSON.stringify([currentBounds(),Number(map.getZoom()),size.x,size.y]);if(key===lastNavigationKey)return;const wasPrepared=preparingMap||preparedKeys.size>0;resetMapPreparation();if(wasPrepared)prepareMessage='Map changed · prepare this area';lastNavigationKey=key;precipDetailAvailable=Number(map.getZoom())>=PRECIP_DETAIL_MIN_ZOOM;if(!precipDetailAvailable)clearShading();if(!enabled)return;clearStorms();terrainLoading=false;terrainGeneration++;terrainJobKey='';if(cache.length&&(showShading||showIcons))renderPrecipitation(getStoreTimestamp());if(moveTimer)clearTimeout(moveTimer);moveTimer=setTimeout(()=>{void renderStorms();void refreshViewport()},350)}
  function toggleEnabled(){
    lastNavigationKey='';
    if(enabled){store.set('overlay','ptype');register(config.name,'high');void renderStorms();refreshViewport();return}
    release(config.name,'high');for(const abort of forecastRequests)abort.abort();forecastRequests.clear();generation++;refreshEpoch++;pendingProfiles.clear();viewportLoading=false;refreshQueued=false;
    if(moveTimer){clearTimeout(moveTimer);moveTimer=null}clearContours();clearShading();clearStorms();clearPointState(true);
  }
  onMount(()=>{loadPreferences();if(enabled)store.set('overlay','ptype');if(!enabled)release(config.name,'high');freshnessTimer=setInterval(checkAutomaticRefresh,30_000);document.addEventListener('visibilitychange',checkAutomaticRefresh);window.addEventListener('online',checkAutomaticRefresh);map.on('moveend',handleMapNavigation);map.on('zoomend',handleMapNavigation);try{timestampListener=store.on('timestamp',()=>{if(enabled&&cache.length)renderFromCache();else void renderStorms();if(enabled)updatePersistentClickLabel()})}catch{}void renderStorms();refreshViewport()})
  onDestroy(()=>{destroyed=true;if(videoDownloadUrl)URL.revokeObjectURL(videoDownloadUrl);cancelMapPreparation();preparedMapCache.close();stormFrames.clear();placeAbort?.abort();for(const abort of forecastRequests)abort.abort();forecastRequests.clear();refreshEpoch++;pendingProfiles.clear();precipFieldCache.clear();pendingPrecipFields.clear();if(freshnessTimer)clearInterval(freshnessTimer);document.removeEventListener('visibilitychange',checkAutomaticRefresh);window.removeEventListener('online',checkAutomaticRefresh);generation++;clickGeneration++;refreshQueued=false;if(moveTimer)clearTimeout(moveTimer);map.off('moveend',handleMapNavigation);map.off('zoomend',handleMapNavigation);if(timestampListener!==null)try{store.off(timestampListener)}catch{}clearContours();clearShading();clearStorms();terrainTiles.destroy();geographicTiles.destroy();clearClickLayer();stormInterpolator?.destroy();stormInterpolator=null;profileCache.clear()})
</script>

<style lang="less">
  :global(.snowline-click-label>span>b){text-shadow:0 0 1px #fff}
  :global(.snowline-point-place){font-size:12px;line-height:1.3;font-weight:750;color:#d9e7ef;overflow-wrap:anywhere;max-height:3.9em;overflow:auto;padding:0 2px}
  :global(.wintry-point-pointer){background:transparent!important;border:0!important;pointer-events:none!important}:global(.wintry-point-pointer>span){display:block;width:14px;height:14px;box-sizing:border-box;border:2px solid #fff;border-radius:50%;background:var(--probe-accent,#fff);box-shadow:0 0 0 2px rgba(0,0,0,.55)}
  .storm-legend{font-size:9px;color:#f5df91;margin-top:5px}
  :global(.wintry-storm-symbol){background:none!important;border:0!important;pointer-events:none!important}
  :global(.wintry-storm-symbol span){font-size:23px;color:#ffe04b;text-shadow:0 1px 2px #111,0 0 3px #111;line-height:28px}
  :global(.wintry-precip-icon){background:none!important;border:0!important;pointer-events:none!important}
  :global(.wintry-precip-icon span){display:block;width:28px;height:28px;background:#102633db;border-radius:6px;box-shadow:0 1px 3px #0005}
  :global(.wintry-precip-icon svg){width:25px;height:25px;padding:1.5px;filter:drop-shadow(0 0 .75px #ffffffc0)}
  .layer-controls{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 14px;margin-top:8px;font-size:12px;font-weight:700}.layer-controls label{display:flex;align-items:center;gap:5px;cursor:pointer}.layer-controls input{accent-color:#67d7ff;margin:0;width:15px;height:15px}
  .zoom-hint{margin-top:8px;font-size:11px;color:#b5cbd7}.layer-controls label.unavailable{opacity:.45;cursor:not-allowed}.layer-controls label.unavailable input{cursor:not-allowed}
  .prepare-map-controls{display:flex;flex-direction:column;gap:5px;margin:8px 0}.prepare-map-controls small{color:#b5cad8;font-size:10px;line-height:1.4}.prepare-map-controls .refresh-button{min-height:34px}
  .prepare-ring{--progress:0%;display:grid;place-items:center;flex:0 0 44px;width:44px;height:44px;border-radius:50%;background:conic-gradient(#67d8ef var(--progress),#324857 0)}
  .prepare-ring span{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#172a38;color:#e8f8ff;font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}
  .loading-stage{display:block;margin-top:3px;font-size:10px;font-weight:400;color:#b5cad8}
  .data-status{display:flex;flex-direction:column;gap:5px;padding:8px 0;font-size:10px;line-height:1.4;color:#b5cad8}.data-status b{color:#dff5ff}
  .shade-legend{display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:6px;color:#c5d5df;font-size:9px;line-height:1.4}.shade-legend small{width:100%;color:#9fb2be;font-size:9px}
  .shade-types{display:grid;grid-template-columns:repeat(3,1fr);gap:5px 3px;margin-top:5px;font-size:9px;color:#d7e3e9}.shade-types span{display:flex;align-items:center;gap:4px;white-space:nowrap}.shade-types i{display:inline-block;flex:none;width:8px;height:8px;border-radius:1px}

  :global(#device-desktop #plugin-windy-plugin-snowline-map-100m){height:auto!important;width:auto!important;padding:0!important;background:transparent!important;overflow:visible!important}
  .refresh-error{margin-top:7px;font-size:11px;line-height:1.4;color:#ffcb91}.refresh-error button{color:inherit;background:none;border:0;text-decoration:underline;cursor:pointer}
  :global(.forecast-quality){margin-top:5px;color:#edc881;font-size:10px;line-height:1.3}

  .hatch-legend{font-size:9px;line-height:1.4;color:#b9d8e6;margin:5px 0}.hatch-legend span{color:#ef70cf;font-weight:700;margin-right:4px}
  .snowline-panel{box-sizing:border-box;width:240px;max-width:calc(100vw - 28px);padding:8px;border-radius:9px;background:rgba(38,42,46,.96);color:white;box-shadow:0 4px 16px rgba(0,0,0,.28)}
  .top-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.top-controls{display:flex;align-items:center;gap:6px}.title{font-size:16px;font-weight:850;letter-spacing:-.2px}.switch{display:flex;align-items:center;gap:5px;height:24px;padding:0 7px 0 5px;border:1px solid rgba(255,255,255,.11);border-radius:7px;background:rgba(255,255,255,.035);font-size:9px;font-weight:850;white-space:nowrap;cursor:pointer}.switch input{appearance:none;-webkit-appearance:none;position:relative;margin:0;width:24px;height:14px;border:0;border-radius:8px;background:rgba(255,255,255,.16);cursor:pointer;transition:background .15s ease}.switch input:after{content:'';position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:#aebbc2;transition:transform .15s ease,background .15s ease}.switch input:checked{background:rgba(80,190,255,.35)}.switch input:checked:after{transform:translateX(10px);background:#8ee2ff}
  .hide-button,.info-button{width:24px;height:24px;padding:0;border:1px solid rgba(255,255,255,.10);border-radius:7px;background:rgba(255,255,255,.035);color:rgba(255,255,255,.74);font-size:15px;font-weight:800;cursor:pointer}.hide-button:hover,.info-button:hover{background:rgba(255,255,255,.075);color:#fff}.info-button{font-family:Georgia,serif;font-size:14px;font-style:italic}.info-button.active{border-color:rgba(80,190,255,.65);color:white}
  .show-panel{padding:7px 10px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(38,42,46,.96);color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.24);font-size:11px;font-weight:800;cursor:pointer}
  .status-pill{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;padding:4px 7px;border-radius:6px;background:rgba(10,14,18,.72);color:rgba(255,255,255,.92);font-size:10px;font-weight:700}.status-dot{width:7px;height:7px;border-radius:50%;background:#70d7ff;animation:snowline-pulse 1s ease-in-out infinite}@keyframes snowline-pulse{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}
  .info-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.30)}.info-window{width:min(360px,calc(100vw - 24px));max-height:min(74vh,540px);overflow:hidden;border:1px solid rgba(80,190,255,.48);border-radius:10px;background:rgba(24,28,32,.99);color:white;box-shadow:0 8px 30px rgba(0,0,0,.48)}.info-head{display:flex;justify-content:space-between;align-items:center;padding:9px 10px 7px;border-bottom:1px solid rgba(255,255,255,.10);font-size:12px}.info-head button{width:22px;height:22px;border:0;border-radius:6px;background:rgba(255,255,255,.08);color:white;font-size:17px;cursor:pointer}.info-body{max-height:calc(min(74vh,540px) - 40px);overflow-y:auto;padding:9px 10px 10px;font-size:10px;line-height:1.4;color:rgba(255,255,255,.84)}.info-body>div+div{margin-top:8px}.info-caveat{padding-top:8px;border-top:1px solid rgba(255,255,255,.10);color:rgba(255,228,92,.90)}
  :global(.snowline-label){text-align:center;pointer-events:none}:global(.snowline-label),:global(.snowline-click-label){background:transparent!important;border:0!important}:global(.snowline-label span){display:inline-block;padding:1px 4px 1px 6px;border-radius:3px;border-left:4px solid var(--snowline-color,white);background:rgba(15,17,20,.86);color:white;font-size:10px;font-weight:800;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.8);box-shadow:0 0 0 1px rgba(255,255,255,.12)}:global(.snowline-label-major span){padding-left:7px;border-left-width:5px;background:rgba(10,13,16,.92);font-weight:900;box-shadow:0 0 0 1px rgba(255,255,255,.18),0 2px 5px rgba(0,0,0,.28)}
  :global(.snowline-click-label){pointer-events:none!important}:global(.snowline-click-label>span){position:absolute;bottom:20px;left:0;transform:translateX(-50%);pointer-events:auto;display:flex;flex-direction:column;gap:6px;width:228px;min-height:146px;box-sizing:border-box;padding:40px 9px 9px;border-radius:14px;border:1px solid rgba(255,255,255,.11);border-top:2px solid var(--probe-accent,rgba(255,255,255,.4));border-bottom:3px solid var(--snowline-color,white);background:linear-gradient(180deg,rgba(11,17,21,.985),rgba(7,12,16,.99));color:#fff;text-align:center;white-space:normal;text-shadow:none;box-shadow:0 10px 30px rgba(0,0,0,.54)}
  :global(.snowline-card-kicker){position:absolute;top:12px;left:74px;right:74px;color:#7f929e;font-size:6px;line-height:1;font-weight:900;letter-spacing:1.15px;text-align:center;white-space:nowrap;pointer-events:none}
  :global(.snowline-label-close),:global(.snowline-label-share),:global(.snowline-label-chart),:global(.snowline-label-favourite){position:absolute;top:7px;height:27px;padding:0;border:1px solid rgba(255,255,255,.085);border-radius:8px;background:rgba(255,255,255,.045);color:#dfe9ee;font-size:12px;line-height:25px;font-weight:800;text-shadow:none;cursor:pointer;pointer-events:auto;transition:background .12s ease,border-color .12s ease}:global(.snowline-label-close:hover),:global(.snowline-label-share:hover),:global(.snowline-label-chart:hover),:global(.snowline-label-favourite:hover){background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.16)}:global(.snowline-label-close){right:7px;width:27px;font-size:17px}:global(.snowline-label-share){right:40px;width:27px;font-size:0;background-repeat:no-repeat;background-position:center;background-size:14px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'/%3E%3Ccircle cx='6' cy='12' r='3'/%3E%3Ccircle cx='18' cy='19' r='3'/%3E%3Cpath d='M8.6 10.5l6.8-4M8.6 13.5l6.8 4'/%3E%3C/svg%3E")}:global(.snowline-label-chart){left:7px;width:29px;font-size:15px}:global(.snowline-label-favourite){left:42px;width:29px;font-size:16px;color:#aab6bd}:global(.snowline-label-favourite.saved){color:#ffe45c;border-color:rgba(255,228,92,.42);background:rgba(255,228,92,.08)}
  :global(.snowline-click-label b){display:block;padding:4px 7px 2px;border-radius:8px;background:transparent;color:var(--probe-accent,white);font-size:15px;line-height:1.05;font-weight:900;letter-spacing:.25px}:global(.snowline-card-dry>span>b){padding:3px 7px 1px;background:transparent;font-size:12px;letter-spacing:.8px;opacity:.95}:global(.snowline-label-detail){width:100%}
  :global(.snowline-position){padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.055);color:var(--probe-accent,white);line-height:1.05}:global(.snowline-position strong){display:block;font-size:11px;font-weight:900}:global(.snowline-position small){display:block;margin-top:3px;color:rgba(255,255,255,.68);font-size:7.5px;font-weight:750}
  :global(.snowline-label-grid){display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%}:global(.snowline-label-grid span),:global(.snowline-outlook-grid span){min-width:0;padding:6px 4px 5px;border-radius:8px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.045);text-align:center}:global(.snowline-label-grid small),:global(.snowline-outlook-grid small){display:block;color:#7f919b;font-size:6.2px;line-height:1;text-transform:uppercase;letter-spacing:.42px;font-weight:800}:global(.snowline-label-grid strong),:global(.snowline-outlook-grid strong){display:block;margin-top:4px;color:#eef5f8;font-size:10.5px;line-height:1;font-weight:900}:global(.metric-terrain strong){color:#ffd39a}:global(.metric-snowline strong){color:#dff6ff}:global(.metric-precip strong){color:#9fe5ff}:global(.snowline-label-grid.has-precip .metric-precip){grid-column:1/-1}
  :global(.snowline-outlook){padding:5px;border:1px solid rgba(110,203,255,.08);border-radius:8px;background:rgba(60,150,205,.035)}:global(.snowline-outlook-title){margin-bottom:4px;color:#79badc;font-size:6.5px;font-weight:900;letter-spacing:.75px}:global(.snowline-outlook-grid){display:grid;grid-template-columns:1fr 1fr;gap:4px}:global(.snowline-outlook-grid span){padding:4px 3px;background:rgba(255,255,255,.028)}:global(.snowline-outlook-grid strong){font-size:8.8px}:global(.snowline-no-snow strong){color:#8f9da5;font-weight:700}:global(.snowline-transition){margin-top:4px;padding:4px 5px;border-radius:6px;background:rgba(255,255,255,.035);color:#dce9ef;font-size:8px;line-height:1.12;font-weight:800}
  :global(.snowline-valid){margin:-1px 0 1px;color:#8799a4;font-size:7.2px;line-height:1;font-weight:800;text-align:center}:global(.snowline-compact-relation){display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;box-sizing:border-box;padding:5px 7px;border-radius:8px;background:rgba(255,255,255,.025);color:var(--probe-accent,white);font-size:8.2px;line-height:1.1;font-weight:850;text-align:left}:global(.snowline-compact-relation strong){display:inline!important;padding:0!important;background:none!important;color:inherit!important;font-size:8px!important;letter-spacing:0!important}:global(.snowline-compact-relation small){display:none}:global(.snowline-compact-relation span){color:#aebbc2;font-weight:750;white-space:nowrap}:global(.snowline-event-line){width:100%;box-sizing:border-box;padding:6px 7px;border:0;border-radius:8px;background:rgba(110,203,255,.045);color:#d8e5eb;text-align:left;font-family:inherit;font-size:7.8px;line-height:1.2;font-weight:800}:global(button.snowline-event-line){display:flex;align-items:center;justify-content:space-between;gap:6px;cursor:pointer;pointer-events:auto}:global(button.snowline-event-line:hover){background:rgba(110,203,255,.11)}:global(button.snowline-event-line span){flex:0 0 auto;color:#8edcff;font-size:14px;line-height:8px}:global(.snowline-loading){padding:20px 0 14px;color:#9fb0ba;font-size:10px}
  :global(.snowline-probe-above>span){background:linear-gradient(180deg,rgba(8,25,34,.99),rgba(8,14,18,.99))}:global(.snowline-probe-below>span){background:linear-gradient(180deg,rgba(32,21,12,.99),rgba(18,13,10,.99))}:global(.snowline-probe-near>span){background:linear-gradient(180deg,rgba(29,27,11,.99),rgba(17,16,9,.99))}:global(.snowline-card-hazard>span){border-top-color:#c184ff!important;box-shadow:0 0 0 1px rgba(193,132,255,.35),0 12px 32px rgba(77,27,107,.58)}:global(.snowline-card-hazard>span>b){color:#e7c8ff!important;background:rgba(174,91,230,.12)!important}
  @media(max-width:520px){.info-overlay{align-items:flex-start;padding-top:54px}:global(.snowline-click-label>span){width:220px;min-height:142px;padding:40px 8px 8px}:global(.snowline-card-kicker){left:72px;right:72px}:global(.snowline-click-label b){font-size:13px}:global(.snowline-card-dry>span>b){font-size:10.5px}:global(.snowline-position strong){font-size:10.5px}:global(.snowline-label-grid strong),:global(.snowline-outlook-grid strong){font-size:8.5px}}

  :global(.snowline-label-chart){left:7px;width:69px;font-size:10px}
  :global(.snowline-label-favourite){left:81px;width:46px;font-size:10px}
  :global(.snowline-label-share){right:40px;width:45px;background-image:none;font-size:10px}
  :global(.snowline-card-kicker){display:none}
  :global(.snowline-valid){font-size:10px;line-height:1.25}
  :global(.snowline-label-grid small){font-size:9px;line-height:1.2}
  :global(.snowline-label-grid strong){font-size:13px;line-height:1.2}
  :global(.snowline-event-line){font-size:11px;line-height:1.4;padding:8px}
  :global(.snowline-compact-relation),:global(.snowline-compact-relation strong){font-size:10px!important;line-height:1.3}
  .title{font-size:13px;white-space:nowrap}.top-row,.top-controls{gap:3px}
  /* Keep the map centre free and leave room for Windy's bottom timeline.
     Hosts can override the clearance when their bottom controls change. */
  .info-overlay{z-index:10030}
  .snowline-panel,.show-panel{
    position:fixed;
    left:max(16px,env(safe-area-inset-left,0px));
    bottom:calc(var(--wintry-bottom-clearance,84px) + env(safe-area-inset-bottom,0px));
    z-index:10005;
    box-sizing:border-box;
    max-width:calc(100vw - 32px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px));
  }
  .snowline-panel{
    width:280px;padding:10px;border:1px solid #355363;border-radius:12px;
    background:linear-gradient(155deg,#142b3b,#0c1822);
    max-height:calc(100vh - var(--wintry-bottom-clearance,84px) - 80px - env(safe-area-inset-bottom,0px) - env(safe-area-inset-top,0px));
    max-height:calc(100dvh - var(--wintry-bottom-clearance,84px) - 80px - env(safe-area-inset-bottom,0px) - env(safe-area-inset-top,0px));
    overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;
    scrollbar-width:thin;scrollbar-color:#47677a #142b3b;
  }
  @media(max-width:600px){
    .snowline-panel,.show-panel{
      left:max(12px,env(safe-area-inset-left,0px));
      right:max(12px,env(safe-area-inset-right,0px));
      bottom:calc(var(--wintry-bottom-clearance,88px) + env(safe-area-inset-bottom,0px));
      margin-inline:auto;
      max-width:calc(100vw - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px));
    }
    .snowline-panel{
      width:440px;border-radius:16px;padding:10px 12px;
      max-height:min(45vh,calc(100vh - var(--wintry-bottom-clearance,88px) - 64px - env(safe-area-inset-bottom,0px) - env(safe-area-inset-top,0px)));
      max-height:min(45dvh,calc(100dvh - var(--wintry-bottom-clearance,88px) - 64px - env(safe-area-inset-bottom,0px) - env(safe-area-inset-top,0px)));
    }
    .show-panel{width:max-content;min-height:44px}
    .top-row{flex-wrap:wrap}
  }
  .title{font-size:18px}.top-controls{gap:4px}.hide-button,.info-button{width:30px;height:34px}.switch{height:34px;font-size:11px}.hatch-legend{font-size:11px;margin:9px 0}.start-hint{font-size:12px;line-height:1.5;color:#b5cbd7;padding-top:12px}.point-tools{margin-top:12px;padding:12px;background:#192f3d;border-radius:10px}.point-tools strong{display:block;font-size:13px;overflow-wrap:anywhere}.point-tools>div{display:flex;gap:8px;margin-top:9px}.point-tools button{flex:1;min-height:40px;border:1px solid #487286;border-radius:8px;background:#244757;color:#fff;font-size:13px;cursor:pointer}.snowline-panel :global(button:focus-visible){outline:2px solid #8de4ff;outline-offset:2px}.status-pill{font-size:12px;padding:8px}.info-body{font-size:13px;line-height:1.55}
  .title{font-size:15px;white-space:nowrap}.top-row{gap:5px}.hide-button{width:30px;height:32px}.switch{height:32px;padding:0 5px;font-size:10px}.point-tools{margin-top:7px;padding:0;background:none}.point-tools strong{font-size:12px;line-height:1.35;max-height:48px;overflow:auto}.point-tools>div{gap:6px;margin-top:6px}.point-tools button{min-height:36px;font-size:12px}.panel-options{margin-top:7px;border-top:1px solid #304655}.panel-options summary{padding:9px 0;cursor:pointer;font-size:11px;color:#a9c4d3}.panel-options summary:focus-visible{outline:2px solid #8de4ff}.hatch-legend{font-size:10px;margin:6px 0}.help-link{background:none;border:0;color:#b3d7e8;font-size:11px;padding:5px 0;text-decoration:underline;cursor:pointer}.status-pill{font-size:10px;padding:4px}.panel-options :global(.results){position:static;margin-top:5px;max-height:180px}.panel-options :global(.search-line input){height:36px;font-size:12px}.panel-options :global(.utility-row button){height:36px;font-size:11px}
  .panel-head{position:sticky;top:-10px;z-index:3;margin:-10px -10px 0;padding:10px 10px 6px;background:linear-gradient(155deg,#142b3b,#102330);border-bottom:1px solid #304655}
  @media(max-width:600px){.panel-head{margin-inline:-12px;padding-inline:12px}}
  .layer-controls{gap:6px;margin-top:10px}.layer-controls label{box-sizing:border-box;min-height:34px;padding:6px 8px;border:1px solid #304655;border-radius:7px;background:#152735;color:#afc3ce;font-size:12px}.layer-controls label.active{border-color:#49748a;background:#214153;color:#eefaff}.layer-controls label:focus-within{outline:2px solid #8de4ff;outline-offset:2px}
  .shade-types{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px;font-size:11px;margin-top:8px}.shade-types span{min-height:22px;white-space:normal;line-height:1.2;gap:6px}.shade-types :global(svg){width:19px;height:19px;flex:none;filter:drop-shadow(0 0 .75px #ffffffc0)}
  .shade-legend{font-size:10px;line-height:1.5;margin-top:8px}.shade-legend small{font-size:10px}.storm-legend{font-size:10px;line-height:1.5;margin-top:7px}.panel-footer{position:sticky;bottom:-10px;z-index:3;background:#102330;border-top:1px solid #304655;padding:6px 0;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:5px}.refresh-button{min-height:34px;padding:0 10px;border:1px solid #446578;border-radius:7px;background:#203a4a;color:#dff5ff;font-size:11px;cursor:pointer}.refresh-button:disabled{opacity:.45;cursor:default}.panel-footer .help-link{min-height:34px}.status-pill{font-size:11px;min-height:22px}.status-dot{flex-shrink:0}
  @media(prefers-reduced-motion:reduce){.status-dot{animation:none}}
  @media(pointer:coarse){.layer-controls label,.refresh-button,.panel-footer .help-link{min-height:44px}
.hide-button,.switch{min-height:40px}.point-tools button{min-height:44px}.panel-options summary{min-height:24px;padding:10px 0}.panel-options :global(.utility-row button){height:44px}}
  /* mobileUI: 'small' owns placement below Windy's timeline. Keep its host
     geometry intact; only style the content inside that bottom panel. */
  :global(#device-mobile) .snowline-panel,:global(#device-mobile) .show-panel{
    position:relative;left:auto;right:auto;bottom:auto;z-index:auto;
    margin:0;width:100%;max-width:100%;
  }
  :global(#device-mobile) .snowline-panel{
    border-radius:0;padding:8px 12px;
    max-height:38vh;max-height:38dvh;
    padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));
  }
  :global(#device-mobile) .panel-head{top:-8px;margin-top:-8px;padding-top:8px}
  :global(#device-mobile) .layer-controls{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:6px}
  :global(#device-mobile) .layer-controls label{min-height:44px;padding:6px 4px;justify-content:center;font-size:11px}
  :global(#device-mobile) .shade-types{grid-template-columns:repeat(3,minmax(0,1fr));gap:2px 4px;font-size:10px;margin-top:5px}
  :global(#device-mobile) .shade-types :global(svg){width:15px;height:15px}
  :global(#device-mobile) .prepare-map-controls{margin:6px 0;gap:3px}
  :global(#device-mobile) .panel-footer{position:relative;bottom:auto;padding-bottom:0}
  .mobile-extra-settings,.mobile-options-label{display:none}
  :global(#device-mobile) .desktop-legend,:global(#device-mobile) .desktop-options-label{display:none}
  :global(#device-mobile) .mobile-extra-settings,:global(#device-mobile) .mobile-options-label{display:block}
  :global(#device-mobile) .panel-options{margin-top:4px}
  :global(#device-mobile) .panel-options summary{box-sizing:border-box;min-height:44px;padding:12px 0;font-size:11px}
  :global(#device-mobile) .title{font-size:15px}
  :global(#device-mobile) .hide-button,:global(#device-mobile) .switch{min-height:44px}
  :global(#device-mobile) .panel-actions{position:sticky;bottom:-8px;z-index:4;background:#102330;padding-top:7px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px}
  :global(#device-mobile) .prepare-map-controls,:global(#device-mobile) .panel-footer{display:contents}
  :global(#device-mobile) .prepare-map-controls button{grid-column:1;grid-row:1;min-height:44px;padding-inline:5px}
  :global(#device-mobile) .prepare-map-controls small{grid-column-start:1;grid-column-end:4;grid-row:2;min-height:14px}
  :global(#device-mobile) .panel-footer .refresh-button{grid-column:2;grid-row:1;min-height:44px;padding-inline:6px}
  :global(#device-mobile) .panel-footer .help-link{grid-column:3;grid-row:1;min-height:44px;padding-inline:3px}
  /* Primary controls never scroll. Secondary controls live in Settings. */
  .snowline-panel{max-height:none;overflow:visible}
  .panel-head{position:static}
  .layer-controls{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:6px}
  .layer-controls label{padding-inline:4px;justify-content:center;font-size:11px}
  .settings-button{width:30px;height:32px;border:1px solid #304655;border-radius:7px;background:#152735;color:#dff5ff;font-size:17px;cursor:pointer}
  .title{font-size:14px}
  .panel-actions{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px;padding-top:7px}
  .prepare-map-controls,.panel-footer{display:contents}
  .prepare-map-controls button{grid-column:1;grid-row:1;min-height:34px;padding-inline:5px}
  .prepare-map-controls small{grid-column-start:1;grid-column-end:4;grid-row:2;min-height:14px}
  .panel-footer .refresh-button{grid-column:2;grid-row:1;padding-inline:6px}
  .panel-footer .help-link{grid-column:3;grid-row:1;padding-inline:3px}
  :global(#device-mobile) .snowline-panel{max-height:none;overflow:visible}
  /* Windy's small mobile host defaults to max-height:200px!important.
     Size this host to its content so actions and point tools are not clipped. */
  :global(#device-mobile #plugin-windy-plugin-snowline-map-100m){
    height:auto!important;max-height:none!important;overflow:visible!important;
    padding:0!important;
  }
  :global(#device-mobile) .panel-head,:global(#device-mobile) .panel-actions{position:static}
  :global(#device-mobile) .settings-button{min-height:44px;min-width:36px}
  :global(#device-mobile) .point-tools strong{max-height:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  :global(#device-mobile) .status-pill{margin-top:4px;padding:3px;justify-content:flex-start}
  :global(#device-mobile) .prepare-ring{width:30px;height:30px;flex-basis:30px}
  :global(#device-mobile) .prepare-ring span{width:24px;height:24px;font-size:9px}
</style>
