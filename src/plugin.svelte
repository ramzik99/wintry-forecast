{#if panelHidden}
  <button class="show-panel" type="button" aria-label="Show Wintry forecast panel" on:click={() => panelHidden = false}>❄ Wintry forecast</button>
{:else}
  <div class="snowline-panel">
    <div class="top-row">
      <div class="title">Wintry forecast</div>
      <div class="top-controls">
        <button class="info-button" class:active={infoOpen} type="button" aria-label="How Wintry forecast works" title="How it works" on:click={() => infoOpen = true}>i</button>
        <button class="hide-button" type="button" aria-label="Hide Wintry forecast panel" title="Hide" on:click={() => panelHidden = true}>−</button>
        <label class="switch"><input type="checkbox" aria-label="Show snowline contours" bind:checked={enabled} on:change={toggleEnabled} /><span>{enabled ? 'On' : 'Off'}</span></label>
      </div>
    </div>

    <div class="hatch-legend"><span>╱╱╱</span> Terrain above estimated snowline</div>
    <PlaceSearch on:select={handlePlaceSelect} on:clear={handleSearchClear} />
    <V21Panel bind:unitSystem {activeRunTime} />
    {#if refreshError}<div class="refresh-error" role="status">{refreshError} <button type="button" on:click={refreshForecast}>Retry</button></div>{/if}

    {#if enabled && (viewportLoading || probeLoading)}
      <div class="status-pill"><span class="status-dot"></span>{probeLoading ? 'Reading point…' : 'Updating contours…'}</div>
    {/if}
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
        <div><b>Diagonal hatching:</b> sampled map terrain is above the atmospheric snowline estimate. This is not a snowfall forecast; precipitation and the vertical temperature profile determine precipitation type. Small terrain features may be missed between samples.</div>
        <div><b>At a glance:</b> precipitation type, terrain, snowline and precipitation for the selected point.</div>
        <div><b>Next wintry period:</b> timing and estimated new snow through +144 h.</div>
        <div><b>Forecast intervals:</b> contours update hourly; gaps between available profiles are interpolated. Precipitation is shown as three-hour totals. New snow uses these intervals, precipitation type and an estimated snow-to-water ratio, with simple settling and melt.</div>
        <div><b>Forecast:</b> snowline, precipitation, precipitation type and estimated new snow on one timeline.</div>
        <div><b>Sounding:</b> optional vertical detail with hover/touch temperature, dew point and wet bulb.</div>
        <div class="info-caveat">Estimated new snow is a forecast estimate, not existing snow depth. Valid times use your device timezone; ECMWF cycle labels remain UTC.</div>
      </div>
    </div>
  </div>
{/if}

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import { getElevation, getMeteogramForecastData } from '@windy/fetch';
  import PlaceSearch from './PlaceSearch.svelte';
  import V21Panel from './V21Panel.svelte';
  import SnowlineChart from './SnowlineChart.svelte';
  import { terrainHatchSegments } from './terrainHatching';
  import { buildProfile, wetBulbZeroHeight, valueAt } from './snowLevel';
  import { precipPeriodLabel, formatPrecipMm, precipMmAt, PRECIP_THRESHOLD_MM_H } from './precip';
  import { precipitationLabel, terrainPrecipitationType, type TerrainPrecipType } from './precipType';
  import { estimateNewSnowStep, formatNewSnowCm } from './snowAccum';
  import { alignSelectedPrecipFields, loadSelectedPrecipFields } from './selectedPrecip';
  import { prepareSnowlineContours } from './snowlineContours';
  import { contourPolylines, type ContourPolyline, type GridPoint } from './contours';
  import { nextWintryEvent } from './eventOutlook';
  import { conditionLabel, noEventMessage } from './forecastStatus';
  import { forecastIntervalIndex } from './forecastTime';
  import { isOlderRun, profileIsFresh } from './forecastFreshness';
  import { automaticRefreshDue } from './automaticRefresh';
  import { register, release } from '@windy/singleclick';
  import config from './pluginConfig';
  import { geocode } from './geocoding';
  import { formatElevation, formatPrecip, formatSnow, loadUnitSystem, type UnitSystem } from './displayUnits';

  type CachedPoint = { lat:number; lon:number; forecast:Record<string,unknown>; header:Record<string,unknown>; times:number[]; runTime:number|null; step:number; terrainM:number|null; fetchedAt:number };
  type ColourStop = { value:number; color:string };
  type ViewportPoint = { lat:number; lon:number; r:number; c:number };
  type LabelCandidate = { point:[number,number]; level:number; color:string; length:number; isMajor:boolean };
  type ProbeStatus = 'above' | 'below' | 'near' | 'neutral';
  type PointSource = 'search' | 'map-click';
  type PlaceSelection = { lat:number; lon:number; primary:string; secondary:string };
  type LabelGridArgs = { valid:string; terrain:number; snowline:number; difference:number; precip:number|null; hasPrecip:boolean; eventLine:string; canJump:boolean };
  type PointOutlook24 = { minSnowlineM:number|null; newSnowCm:number; transition:string };

  const MODEL = 'ecmwf' as const;
  const MAX_CONCURRENT = 12, CONTOUR_STEP_H = 1, FORECAST_DAYS = 6, MAX_FORECAST_HOURS = 144, PROFILE_CACHE_MAX = 1600, MIN_VALID_FRACTION = 0.32, POSITION_NEAR_SNOWLINE_METRES = 100, TENDENCY_HOURS = 1, MAX_VIEWPORT_LATITUDE = 85;
  const FAVOURITES_STORAGE_KEY = 'snowline:favourites:v1', FAVOURITES_CHANGED_EVENT = 'wintry:favourites-changed', PREFS_STORAGE_KEY='wintry:prefs:v1';

  let enabled=true, panelHidden=false, infoOpen=false, chartOpen=false, forecastTab:'graph'|'sounding'='graph', viewportLoading=false, refreshQueued=false, probeLoading=false, unitSystem:UnitSystem='metric', prefsReady=false;
  let cache:(CachedPoint|null)[][]=[], contourLayer:any=null, clickLayer:any=null, clickedPoint:CachedPoint|null=null, clickedLatLon:[number,number]|null=null, clickedMapElevationM:number|null=null, clickedPlaceName:string|null=null, pointSource:PointSource|null=null, clickedNextEventTime:number|null=null;
  let moveTimer:ReturnType<typeof setTimeout>|null=null, generation=0, clickGeneration=0, timestampListener:number|null=null, activeRunTime:number|null=null, renderedUnitSystem:UnitSystem|null=null;
  const profileCache = new Map<string,CachedPoint>();
  const pendingProfiles = new Map<string,Promise<CachedPoint|null>>();
  let refreshEpoch=0, lastChecked:number|null=null, refreshError='', destroyed=false;
  let freshnessTimer:ReturnType<typeof setInterval>|null=null;
  let lastRefreshAttempt = Date.now();

  const COLOUR_STOPS:ColourStop[]=[
    {value:150,color:'#c51ac7'},{value:300,color:'#8b079e'},{value:450,color:'#50007f'},{value:600,color:'#231073'},{value:750,color:'#003e91'},{value:1000,color:'#1688d4'},{value:1300,color:'#72bdf3'},{value:1600,color:'#b9e7c7'},{value:1900,color:'#c8ef4a'},{value:2200,color:'#f4eb00'},{value:2500,color:'#ffc21a'},{value:2800,color:'#ff850d'},{value:3250,color:'#f34412'},{value:4000,color:'#c41618'},{value:5500,color:'#850008'},{value:6000,color:'#3e0906'}
  ];

  function contourIntervalForZoom(){const z=Number(map.getZoom?.()??6);return z<=4?500:z<=7?200:100}
  function hexToRgb(hex:string):[number,number,number]{const v=hex.replace('#','');return[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)]}
  function rgbToHex(r:number,g:number,b:number){const p=(v:number)=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');return`#${p(r)}${p(g)}${p(b)}`}
  function colorForLevel(level:number){if(level<=COLOUR_STOPS[0].value)return COLOUR_STOPS[0].color;if(level>=COLOUR_STOPS.at(-1)!.value)return COLOUR_STOPS.at(-1)!.color;for(let i=0;i<COLOUR_STOPS.length-1;i++){const a=COLOUR_STOPS[i],b=COLOUR_STOPS[i+1];if(level<a.value||level>b.value)continue;const f=(level-a.value)/(b.value-a.value),x=hexToRgb(a.color),y=hexToRgb(b.color);return rgbToHex(x[0]+(y[0]-x[0])*f,x[1]+(y[1]-x[1])*f,x[2]+(y[2]-x[2])*f)}return'#fff'}
  function getStoreTimestamp(){try{const t=store.get('timestamp');if(typeof t==='number'&&Number.isFinite(t))return t}catch{}return Date.now()}
  function parseTime(v:unknown):number|null{if(typeof v==='number'&&Number.isFinite(v))return v>1e12?v:v>1e9?v*1000:null;if(typeof v==='string'){const p=Date.parse(v);if(Number.isFinite(p))return p}return null}
  function scalarNumber(v:unknown):number|null{if(typeof v==='number'&&Number.isFinite(v))return v;if(typeof v==='string'&&v.trim()!==''){const p=Number(v);if(Number.isFinite(p))return p}return null}
  function buildForecastTimes(data:Record<string,unknown>,header:Record<string,unknown>){const hours=data.hours;if(hours==null)return[];const length=Number((hours as any).length);if(!Number.isFinite(length)||length<=0)return[];const raw:number[]=[];for(let i=0;i<length;i++){const v=valueAt(hours,i);if(v!==null)raw.push(v)}if(!raw.length)return[];let times:number[];if(raw[0]>1e12)times=raw;else if(raw[0]>1e9)times=raw.map(v=>v*1000);else{const ref=parseTime(header.refTime);if(ref===null)return[];times=raw.map(h=>ref+h*3600_000)}const end=times[0]+MAX_FORECAST_HOURS*3600_000;return times.filter(t=>t<=end+60_000)}
  function nearestIndex(times:number[],target:number){let best=0,d=Infinity;times.forEach((t,i)=>{const x=Math.abs(t-target);if(x<d){d=x;best=i}});return best}
  function extractPayload(payload:unknown){const r=payload as any;return{forecast:r?.data?.data&&typeof r.data.data==='object'?r.data.data as Record<string,unknown>:{},header:r?.data?.header&&typeof r.data.header==='object'?r.data.header as Record<string,unknown>:{}}}
  async function fetchMapElevation(lat:number,lon:number){try{const r=await getElevation(lat,lon) as any;for(const c of[r?.data,r?.data?.data,r?.value]){const e=scalarNumber(c);if(e!==null)return e}}catch(e){console.warn('Wintry forecast map elevation failed',lat,lon,e)}return null}
  function profileKey(lat:number,lon:number,step:number){return`${step}:${lat.toFixed(4)},${lon.toFixed(4)}`}
  function invalidateForNewRun(run:number|null){
    if(run===null||isOlderRun(run,activeRunTime))return;
    if(activeRunTime===null){activeRunTime=run;return}
    if(run>activeRunTime+60_000){activeRunTime=run;profileCache.clear();cache=[];clearContours()}
  }
  const elevationCache = new Map<string, Promise<number|null>>();
  function loadMapElevation(lat:number,lon:number):Promise<number|null>{
    const key=`${lat.toFixed(4)},${lon.toFixed(4)}`;
    const cached=elevationCache.get(key);if(cached)return cached;
    const request=fetchMapElevation(lat,lon).then(value=>{if(value===null)elevationCache.delete(key);return value});
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
  async function loadPoint(lat:number,lon:number,step=1):Promise<CachedPoint|null>{
    const c=cachedProfile(lat,lon,step);if(c){if(c.terrainM===null)c.terrainM=await loadMapElevation(lat,lon);return c}
    const key=profileKey(lat,lon,step),epoch=refreshEpoch,pending=pendingProfiles.get(key);
    if(pending)return pending;
    const request=(async()=>{
      try{
        const [r,terrainM]=await Promise.all([getMeteogramForecastData(MODEL,{lat,lon,step,days:FORECAST_DAYS}),loadMapElevation(lat,lon)]);
        if(destroyed||epoch!==refreshEpoch)return null;
        const{forecast,header}=extractPayload(r);if(!Object.keys(forecast).length)return null;
        const runTime=parseTime(header.refTime);if(isOlderRun(runTime,activeRunTime))return null;
        invalidateForNewRun(runTime);
        const p={lat,lon,forecast,header,times:buildForecastTimes(forecast,header),runTime,step,terrainM,fetchedAt:Date.now()};
        rememberProfile(p);return p;
      }catch(e){console.warn('Wintry forecast point request failed',lat,lon,e);return null}
    })();
    pendingProfiles.set(key,request);
    try{return await request}finally{if(pendingProfiles.get(key)===request)pendingProfiles.delete(key)}
  }
  async function mapLimit<T,R>(items:T[],limit:number,fn:(x:T)=>Promise<R>){const out=new Array<R>(items.length);let next=0;async function worker(){while(true){const i=next++;if(i>=items.length)return;out[i]=await fn(items[i])}}await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));return out}
  function gridShapeForZoom(){const z=Number(map.getZoom?.()??6);return z<=4?{rows:9,cols:15}:z<=6?{rows:13,cols:21}:z<=8?{rows:17,cols:27}:{rows:19,cols:31}}
  function buildViewportPoints(){const{rows,cols}=gridShapeForZoom(),b=map.getBounds(),rawSouth=Math.min(b.getSouth(),b.getNorth()),rawNorth=Math.max(b.getSouth(),b.getNorth()),south=Math.max(-MAX_VIEWPORT_LATITUDE,Math.min(MAX_VIEWPORT_LATITUDE,rawSouth)),north=Math.max(-MAX_VIEWPORT_LATITUDE,Math.min(MAX_VIEWPORT_LATITUDE,rawNorth)),west=b.getWest(),east=b.getEast(),dy=(north-south)/(rows-1),dx=(east-west)/(cols-1),points:ViewportPoint[]=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)points.push({lat:south+r*dy,lon:west+c*dx,r,c});return{points,rows,cols}}
  async function refreshViewport(){
    if(!enabled||destroyed)return;
    if(viewportLoading){refreshQueued=true;return}
    refreshQueued=false;const my=++generation;viewportLoading=true;
    const{points,rows,cols}=buildViewportPoints();
    try{
      const results=await mapLimit(points,MAX_CONCURRENT,async p=>({...p,result:my===generation&&enabled&&!destroyed?await loadPoint(p.lat,p.lon,CONTOUR_STEP_H):null}));
      if(my!==generation||!enabled||destroyed)return;
      const sameRun=(p:CachedPoint|null)=>p&&profileIsFresh(p.fetchedAt,p.runTime,activeRunTime);
      const valid=results.filter(x=>x.result?.times.length&&sameRun(x.result)).length;
      if(valid<Math.max(4,Math.floor(points.length*MIN_VALID_FRACTION))){cache=[];clearContours();refreshError='Map forecast unavailable.';return}
      const next:(CachedPoint|null)[][]=Array.from({length:rows},()=>Array(cols).fill(null));
      for(const x of results)if(sameRun(x.result))next[x.r][x.c]=x.result;
      cache=next;lastChecked=Date.now();refreshError='';renderFromCache();
      if(clickedPoint&&clickedLatLon&&!profileIsFresh(clickedPoint.fetchedAt,clickedPoint.runTime,activeRunTime))void probeLocation(...clickedLatLon,pointSource??'map-click',clickedPlaceName);
    }finally{
      if(my===generation)viewportLoading=false;
      if(refreshQueued&&enabled&&!destroyed){refreshQueued=false;setTimeout(refreshViewport,0)}
    }
  }
  function checkAutomaticRefresh(){
    if(!destroyed && automaticRefreshDue({enabled,busy:viewportLoading||probeLoading,hidden:document.hidden,online:navigator.onLine,failed:!!refreshError||lastChecked===null,lastAttempt:lastRefreshAttempt})) refreshForecast();
  }
  function refreshForecast(){
    if(!enabled||destroyed)return;
    lastRefreshAttempt=Date.now();
    refreshEpoch++;generation++;viewportLoading=false;refreshQueued=false;profileCache.clear();pendingProfiles.clear();refreshError='';
    if(clickedLatLon)void probeLocation(...clickedLatLon,pointSource??'map-click',clickedPlaceName);
    void refreshViewport();
  }
  function clearContours(){if(!contourLayer)return;try{map.removeLayer(contourLayer)}catch{}contourLayer=null}
  function clearClickLayer(){if(!clickLayer)return;try{map.removeLayer(clickLayer)}catch{}clickLayer=null}
  function clearPointState(closeChart=true){clickGeneration++;probeLoading=false;if(closeChart)chartOpen=false;clickedPoint=null;clickedLatLon=null;clickedMapElevationM=null;clickedPlaceName=null;pointSource=null;clickedNextEventTime=null;clearClickLayer()}
  function statusColor(s:ProbeStatus){return s==='above'?'#46d9ff':s==='below'?'#ff9d3d':s==='near'?'#ffe45c':'#fff'}
  function statusForDifference(d:number):ProbeStatus{return d>POSITION_NEAR_SNOWLINE_METRES?'above':d<-POSITION_NEAR_SNOWLINE_METRES?'below':'near'}
  function positionText(d:number){const a=Math.abs(d);if(a<=POSITION_NEAR_SNOWLINE_METRES)return`<strong>Near snowline</strong><small>within ±${formatElevation(POSITION_NEAR_SNOWLINE_METRES,unitSystem)}</small>`;const side=d>0?'above':'below',label=a>1000?`Far ${side} snowline`:a>300?`Well ${side} snowline`:`Slightly ${side} snowline`;return`<strong>${label}</strong><small>${formatElevation(a,unitSystem)} ${side}</small>`}
  function shortValid(t:number){return new Date(t).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit'})}
  function formatCoordinate(lat:number,lon:number){return`${Math.abs(lat).toFixed(4)}°${lat>=0?'N':'S'}, ${Math.abs(lon).toFixed(4)}°${lon>=0?'E':'W'}`}
  function formatLocal(t:number){return new Date(t).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'})}
  function formatLead(run:number|null,valid:number){return run===null||!Number.isFinite(run)?'Unavailable':`+${Math.max(0,Math.round((valid-run)/3600_000))} h`}
  function snowlineAt(point:CachedPoint,index:number){const r=wetBulbZeroHeight(buildProfile(point.forecast,index));return r.snowLevelM!==null&&Number.isFinite(r.snowLevelM)?r.snowLevelM:null}
  function tendencyText(point:CachedPoint,index:number){const now=snowlineAt(point,index);if(now===null)return'';const target=point.times[index]+TENDENCY_HOURS*3600_000;if(target>point.times.at(-1)!+30*60_000)return'';const fi=nearestIndex(point.times,target);if(fi===index)return'';const future=snowlineAt(point,fi);if(future===null)return'';const d=Math.round((future-now)/((point.times[fi]-point.times[index])/3600_000)/10)*10;return Math.abs(d)<20?'→ Steady':`${d>0?'↑':'↓'} ${formatElevation(Math.abs(d),unitSystem)}/h`}

  function phaseAt(point:CachedPoint,index:number,terrainM:number):TerrainPrecipType|null{const precip=precipMmAt(point.forecast,index);if(precip===null||precip<PRECIP_THRESHOLD_MM_H)return null;return terrainPrecipitationType(buildProfile(point.forecast,index),terrainM)}
  function outlook24(point:CachedPoint,index:number,terrainM:number):PointOutlook24{
    const start=point.times[index],end=Math.min(start+24*3600_000,point.times.at(-1)!);
    let minSnowlineM:number|null=null;
    for(let j=index;j<point.times.length&&point.times[j]<=end+60_000;j++){const sl=snowlineAt(point,j);if(sl!==null&&(minSnowlineM===null||sl<minSnowlineM))minSnowlineM=sl}

    let snowpack=0;
    for(let h=0;h<24;h+=3){const t=start+h*3600_000;if(t>=end)break;const j=nearestIndex(point.times,t),precip=precipMmAt(point.forecast,j),phase=phaseAt(point,j,terrainM);snowpack=estimateNewSnowStep(precip,phase,snowpack,Math.min(3,(end-t)/3600_000)).cumulativeCm}

    const current=phaseAt(point,index,terrainM);
    let transition='';
    if(current){
      for(let j=index+1;j<point.times.length&&point.times[j]<=end+60_000;j++){const next=phaseAt(point,j,terrainM);if(next&&next.key!==current.key){transition=`${current.label} → ${next.label} · ${shortValid(point.times[j])}`;break}}
    }else{
      for(let j=index+1;j<point.times.length&&point.times[j]<=end+60_000;j++){const next=phaseAt(point,j,terrainM);if(next){transition=`Next ${next.label} · ${shortValid(point.times[j])}`;break}}
    }
    return{minSnowlineM:minSnowlineM===null?null:Math.round(minSnowlineM/10)*10,newSnowCm:snowpack,transition}
  }

  async function resolvePlaceName(lat:number,lon:number){
    if(clickedPlaceName)return clickedPlaceName;
    try{
      const d=await geocode('reverse',new URLSearchParams({format:'jsonv2',zoom:'12',lat:String(lat),lon:String(lon)})),a=d?.address??{};
      const local=d?.name||a.city||a.town||a.village||a.municipality||a.county,country=a.country;
      if(local&&country)return String(local)+', '+String(country);if(local)return String(local);
    }catch{}
    return formatCoordinate(lat,lon);
  }
  async function copyText(text:string){if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return}const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.focus();t.select();document.execCommand('copy');t.remove()}
  function favouriteKey(lat:number,lon:number){return`${lat.toFixed(5)},${lon.toFixed(5)}`}
  function readFavourites():any[]{try{const raw=localStorage.getItem(FAVOURITES_STORAGE_KEY),p=raw?JSON.parse(raw):[];return Array.isArray(p)?p:[]}catch{return[]}}
  function isCurrentFavourite(){if(!clickedLatLon)return false;const k=favouriteKey(...clickedLatLon);return readFavourites().some(i=>Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k)}
  async function toggleCurrentFavourite(button:HTMLButtonElement){if(!clickedLatLon)return;const[lat,lon]=clickedLatLon,k=favouriteKey(lat,lon);let items=readFavourites();const exists=items.some(i=>Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k);if(exists)items=items.filter(i=>!(Number.isFinite(Number(i?.lat))&&Number.isFinite(Number(i?.lon))&&favouriteKey(Number(i.lat),Number(i.lon))===k));else{const name=await resolvePlaceName(lat,lon),parts=name.split(',').map(v=>v.trim()).filter(Boolean);items=[{lat,lon,primary:parts[0]||'Saved point',secondary:parts.slice(1).join(', ')},...items].slice(0,30)}try{localStorage.setItem(FAVOURITES_STORAGE_KEY,JSON.stringify(items))}catch{}window.dispatchEvent(new CustomEvent(FAVOURITES_CHANGED_EVENT));button.textContent=exists?'Save':'Saved';button.classList.toggle('saved',!exists);button.title=exists?'Save location':'Remove saved location';button.setAttribute('aria-label',button.title)}
  async function shareCurrentPoint(button:HTMLButtonElement){
    if(!clickedPoint||!clickedLatLon||!clickedPoint.times.length)return;
    const point=clickedPoint,[lat,lon]=clickedLatLon,target=getStoreTimestamp(),index=forecastIntervalIndex(point.times,target);
    if(index<0)return;
    const terrain=clickedMapElevationM,units=unitSystem,place=clickedPlaceName||formatCoordinate(lat,lon),validTime=point.times[index];
    const snowline=snowlineAt(point,index),precip=precipMmAt(point.forecast,index),phase=terrain!==null?phaseAt(point,index,terrain):null;
    const event=terrain!==null?nextWintryEvent(point,terrain,target):null;
    const text=['Wintry forecast',place,'Valid: '+formatLocal(validTime),conditionLabel(precip,phase),
      'Snowline: '+formatElevation(snowline,units),'Terrain: '+formatElevation(terrain,units),'Precipitation: '+formatPrecip(precip,units),
      event?(event.activeNow?'Current':'Next')+' wintry period: '+formatLocal(event.startTime)+' to '+formatLocal(event.endTime):noEventMessage(point,terrain,target),
      event?(event.incomplete?'Snow amount uncertain':'Estimated new snow'+(event.activeNow?' remaining':'')+': '+formatSnow(event.newSnowCm,units)):'',
      'ECMWF atmospheric profile · Windy terrain. Snow amounts are estimates.'].filter(Boolean).join('\n');
    button.disabled=true;
    try{await copyText(text);button.textContent='Copied'}catch{button.textContent='Retry'}
    finally{button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent='Copy'},1600)}
  }

  function metricTile(label:string,value:string,className=''){return`<span class="${className}"><small>${label}</small><strong>${value}</strong></span>`}
  function compactEventSummary(point:CachedPoint,terrainM:number,target:number){
    const event=nextWintryEvent(point,terrainM,target);
    if(!event)return{text:noEventMessage(point,terrainM,target),jumpTime:null as number|null};
    const amount=event.incomplete?' · amount uncertain':event.newSnowCm>0.05?' · est. '+formatSnow(event.newSnowCm,unitSystem)+(event.activeNow?' remaining':''):'';
    if(event.activeNow)return{text:precipitationLabel(event.dominantPhase,event.confidence)+' until '+shortValid(event.endTime)+amount,jumpTime:null as number|null};
    return{text:precipitationLabel(event.dominantPhase,event.confidence)+' · '+shortValid(event.startTime)+amount,jumpTime:event.startTime};
  }
  function labelGrid(args:LabelGridArgs){
    const terrain=metricTile('Terrain',formatElevation(args.terrain,unitSystem),'metric-terrain');
    const snowline=metricTile('Snowline',formatElevation(args.snowline,unitSystem),'metric-snowline');
    const relation=`<div class="snowline-compact-relation">${positionText(args.difference)}<span>${args.precip===null?'Precip unavailable':args.hasPrecip?`Precip ${formatPrecip(args.precip,unitSystem)}`:'Dry'}</span></div>`;
    const grid=`<div class="snowline-label-grid">${terrain}${snowline}</div>`;
    const summary=args.canJump?`<button class="snowline-event-line snowline-event-jump" type="button" title="Jump to next wintry period" aria-label="Jump to next wintry period">${args.eventLine}<span>›</span></button>`:`<div class="snowline-event-line">${args.eventLine}</div>`;
    return`<div class="snowline-valid">${args.valid}</div>${grid}${relation}${summary}<div class="snowline-valid">${clickedPoint?precipPeriodLabel(clickedPoint.forecast):''}</div>`;
  }

  function showClickLabel(lat:number,lon:number,mainText:string,detailHtml='',snowlineColor='#fff',status:ProbeStatus='neutral'){clearClickLayer();clickLayer=L.layerGroup().addTo(map);const accent=statusColor(status);L.circleMarker([lat,lon],{radius:status==='neutral'?4:5,weight:2,color:'#fff',fillColor:accent,fillOpacity:1,interactive:false}).addTo(clickLayer);const detail=detailHtml?`<div class="snowline-label-detail">${detailHtml}</div>`:'',saved=isCurrentFavourite(),actions=clickedPoint&&clickedLatLon?`<button class="snowline-label-chart" type="button" aria-label="Open forecast" title="Open forecast">Forecast</button><button class="snowline-label-favourite${saved?' saved':''}" type="button" aria-label="${saved?'Remove saved location':'Save location'}" title="${saved?'Remove saved location':'Save location'}">${saved?'Saved':'Save'}</button><button class="snowline-label-share" type="button" aria-label="Copy Wintry forecast details" title="Copy Wintry forecast details">Copy</button>`:'',dry=mainText==='DRY';const marker=L.marker([lat,lon],{interactive:true,bubblingMouseEvents:false,zIndexOffset:2000,icon:L.divIcon({className:`snowline-click-label snowline-probe-${status}${dry?' snowline-card-dry':''}`,html:`<span style="--snowline-color:${snowlineColor};--probe-accent:${accent}">${actions}<button class="snowline-label-close" type="button" aria-label="Close Wintry forecast label" title="Close">×</button><div class="snowline-card-kicker">WINTRY FORECAST</div><b>${mainText}</b>${detail}</span>`,iconSize:[228,180],iconAnchor:[114,188]})}).addTo(clickLayer);marker.on('click',(event:any)=>{const original=event?.originalEvent,target=original?.target as HTMLElement|undefined,graph=target?.closest?.('.snowline-label-chart'),jump=target?.closest?.('.snowline-event-jump'),fav=target?.closest?.('.snowline-label-favourite') as HTMLButtonElement|null,share=target?.closest?.('.snowline-label-share') as HTMLButtonElement|null,close=target?.closest?.('.snowline-label-close');if(!graph&&!jump&&!fav&&!share&&!close)return;try{L.DomEvent.stop(original)}catch{}if(graph){if(clickedPoint){forecastTab='graph';chartOpen=true}return}if(jump&&clickedNextEventTime!==null){try{(store as any).set('timestamp',clickedNextEventTime)}catch{}forecastTab='graph';chartOpen=true;return}if(fav){void toggleCurrentFavourite(fav);return}if(share){void shareCurrentPoint(share);return}clearPointState(true)})}

  function updatePersistentClickLabel(){if(!enabled){clearClickLayer();return}if(!clickedPoint||!clickedLatLon||!clickedPoint.times.length)return;clickedNextEventTime=null;const[lat,lon]=clickedLatLon,target=getStoreTimestamp(),first=clickedPoint.times[0],end=Math.min(clickedPoint.times.at(-1)!,first+MAX_FORECAST_HOURS*3600_000);if(target<first-30*60_000||target>end+30*60_000){showClickLabel(lat,lon,'Outside +144 h');return}const index=forecastIntervalIndex(clickedPoint.times,target);if(index<0){showClickLabel(lat,lon,'Forecast unavailable at this time');return}const valid=clickedPoint.times[index],profile=buildProfile(clickedPoint.forecast,index),slr=wetBulbZeroHeight(profile),snowline=slr.snowLevelM!==null&&Number.isFinite(slr.snowLevelM)?slr.snowLevelM:null;if(snowline===null){
      const precip=precipMmAt(clickedPoint.forecast,index),phase=clickedMapElevationM!==null?phaseAt(clickedPoint,index,clickedMapElevationM):null;
      const reason=slr.status==='below-lowest-level'?'WBZ is below the lowest resolved level or absent in a cold column':'No atmospheric crossing resolved';
      const detail=`<div class="snowline-valid">${shortValid(valid)} · ${precipPeriodLabel(clickedPoint.forecast)}</div><div class="snowline-label-grid">${metricTile('Terrain',formatElevation(clickedMapElevationM,unitSystem),'metric-terrain')}${metricTile('Precip',formatPrecip(precip,unitSystem),'')}</div><div class="snowline-event-line">${reason}. ${phase?precipitationLabel(phase):precip!==null&&precip<PRECIP_THRESHOLD_MM_H?'Dry':'Precipitation type unavailable'}</div>`;
      showClickLabel(lat,lon,phase?`${phase.icon} ${precipitationLabel(phase).toUpperCase()}`:precip!==null&&precip<PRECIP_THRESHOLD_MM_H?'DRY':'WBZ unresolved',detail);return
    }const rounded=Math.round(snowline/10)*10,tendency=tendencyText(clickedPoint,index),precip=precipMmAt(clickedPoint.forecast,index),hasPrecip=precip!==null&&precip>=PRECIP_THRESHOLD_MM_H;if(clickedMapElevationM!==null&&Number.isFinite(clickedMapElevationM)){const terrain=Math.round(clickedMapElevationM/10)*10,difference=clickedMapElevationM-snowline,status=statusForDifference(difference),phase=hasPrecip?terrainPrecipitationType(profile,clickedMapElevationM):null,summary=compactEventSummary(clickedPoint,clickedMapElevationM,target);clickedNextEventTime=summary.jumpTime;const grid=labelGrid({valid:shortValid(valid),terrain,snowline:rounded,difference,precip,hasPrecip,eventLine:summary.text,canJump:summary.jumpTime!==null})+(slr.extrapolated?'<div class="forecast-quality">Snowline estimated below the resolved profile</div>':'')+(phase?.confidence==='low'?'<div class="forecast-quality">Limited atmospheric detail; type may differ</div>':'');if(phase){showClickLabel(lat,lon,`${phase.icon} ${precipitationLabel(phase).toUpperCase()}`,grid,colorForLevel(snowline),status);return}showClickLabel(lat,lon,conditionLabel(precip,phase).toUpperCase(),grid,colorForLevel(snowline),status);return}showClickLabel(lat,lon,formatElevation(rounded,unitSystem),`<div class="snowline-label-grid"><span><small>Valid</small><strong>${shortValid(valid)}</strong></span><span><small>Trend</small><strong>${tendency||'—'}</strong></span></div>`,colorForLevel(snowline),'neutral')}

  async function probeLocation(lat:number,lon:number,source:PointSource,placeName:string|null=null){
    if(!enabled||destroyed||!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const keep=chartOpen,my=++clickGeneration;
    clickedPoint=null;clickedMapElevationM=null;clickedNextEventTime=null;
    clickedLatLon=[lat,lon];clickedPlaceName=placeName;pointSource=source;probeLoading=true;
    showClickLabel(lat,lon,'Loading forecast…','<div class="snowline-loading">Checking snow, timing and amounts</div>');
    try{
      const[point,elev,fields]=await Promise.all([loadPoint(lat,lon,3),loadMapElevation(lat,lon),loadSelectedPrecipFields(lat,lon,FORECAST_DAYS)]);
      if(my!==clickGeneration||pointSource!==source||!enabled||destroyed)return;
      if(!point||!point.times.length||!profileIsFresh(point.fetchedAt,point.runTime,activeRunTime)){showClickLabel(lat,lon,'Forecast unavailable','<div class="snowline-loading">Select this place again to retry.</div>');return}
      const aligned=alignSelectedPrecipFields(fields,point.times);
      clickedPoint=Object.keys(aligned).length?{...point,forecast:{...point.forecast,...aligned}}:point;
      clickedMapElevationM=elev;clickedPoint.terrainM=elev;lastChecked=Date.now();
      if(keep)chartOpen=true;updatePersistentClickLabel();
    }finally{if(my===clickGeneration)probeLoading=false}
  }
  export function isEnabled(){return enabled}
  export function selectMapPoint(lat:number,lon:number){if(!enabled||!Number.isFinite(lat)||!Number.isFinite(lon))return;void probeLocation(lat,lon,'map-click')}
  function handlePlaceSelect(event:CustomEvent<PlaceSelection>){if(!enabled||!event?.detail)return;const{lat,lon,primary,secondary}=event.detail;if(!Number.isFinite(lat)||!Number.isFinite(lon))return;const name=[primary,secondary].map(v=>String(v??'').trim()).filter(Boolean).join(', ');pointSource='search';map.panTo([lat,lon],{animate:true});setTimeout(()=>{if(pointSource==='search')void probeLocation(lat,lon,'search',name||null)},120)}
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
  function addTerrainHatching(field:GridPoint[][],layer:any){
    const projected=field.map((row,r)=>row.map((v,c)=>{
      const point=map.latLngToLayerPoint([v.lat,v.lon]),terrain=cache[r]?.[c]?.terrainM;
      return{x:point.x,y:point.y,difference:v.value!==null&&terrain!==null&&terrain!==undefined?terrain-v.value:null};
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
  function renderFromCache(){if(!enabled||!cache.length)return;const target=getStoreTimestamp(),firstPoint=cache.flat().find((p):p is CachedPoint=>p!==null&&p.times.length>0);if(!firstPoint)return;const first=firstPoint.times[0],end=Math.min(firstPoint.times.at(-1)!,first+MAX_FORECAST_HOURS*3600_000);if(target<first-30*60_000||target>end+30*60_000){clearContours();return}const field:GridPoint[][]=[];for(let r=0;r<cache.length;r++){const row:GridPoint[]=[];for(let c=0;c<cache[r].length;c++){const p=cache[r][c];if(!p||!p.times.length){row.push({lat:0,lon:0,value:null});continue}row.push({lat:p.lat,lon:p.lon,value:interpolatedSnowline(p,target)})}field.push(row)}const interval=contourIntervalForZoom(),{field:contourField,levels}=prepareSnowlineContours(field,interval);if(!levels.length){clearContours();return}const next=L.layerGroup(),candidates:LabelCandidate[]=[];
    addTerrainHatching(field,next);
    for(const level of levels){
      const lines=contourPolylines(contourField,level).filter(line=>line.length>=2);
      if(!lines.length)continue;
      const is1000=level%1000===0,is500=level%500===0,color=colorForLevel(level),weight=is1000?2.8:is500?1.9:1;
      const common={interactive:false,lineCap:'round',lineJoin:'round',smoothFactor:.5};
      // Batch each elevation into two paths: a light halo and the coloured contour.
      L.polyline(lines,{...common,color:'#f5fbff',weight:weight+1.8,opacity:is500?.72:.42}).addTo(next);
      L.polyline(lines,{...common,color,weight,opacity:is1000?1:is500?.95:.78}).addTo(next);
      if(is1000||level===-500||(interval===100&&is500)){
        const ranked=lines.map(line=>({line,length:lineLength(line)})).filter(x=>x.length>=110).sort((a,b)=>b.length-a.length).slice(0,3);
        for(const {line,length} of ranked){const point=midpointAlongLine(line);if(point)candidates.push({point,level,color,length,isMajor:is1000})}
      }
    }
    drawDeclutteredLabels(candidates,next);next.addTo(map);const old=contourLayer;contourLayer=next;if(old)try{map.removeLayer(old)}catch{}}
  function loadPreferences(){try{const p=JSON.parse(localStorage.getItem(PREFS_STORAGE_KEY)||'{}');if(typeof p.enabled==='boolean')enabled=p.enabled;if(typeof p.panelHidden==='boolean')panelHidden=p.panelHidden;if(p.forecastTab==='graph'||p.forecastTab==='sounding')forecastTab=p.forecastTab}catch{}unitSystem=loadUnitSystem();prefsReady=true}
  function persistPreferences(){if(!prefsReady)return;try{localStorage.setItem(PREFS_STORAGE_KEY,JSON.stringify({enabled,panelHidden,forecastTab}))}catch{}}
  function refreshUnitDependentUi(){if(renderedUnitSystem===unitSystem)return;renderedUnitSystem=unitSystem;if(!enabled)return;if(cache.length&&!viewportLoading)renderFromCache();updatePersistentClickLabel()}
  $: if(prefsReady){enabled;panelHidden;forecastTab;persistPreferences()}
  $: if(prefsReady){unitSystem;refreshUnitDependentUi()}

  function handleMapNavigation(){if(!enabled)return;if(moveTimer)clearTimeout(moveTimer);moveTimer=setTimeout(refreshViewport,350)}
  function toggleEnabled(){
    if(enabled){register(config.name,'high');refreshViewport();return}
    release(config.name,'high');generation++;refreshEpoch++;pendingProfiles.clear();viewportLoading=false;refreshQueued=false;
    if(moveTimer){clearTimeout(moveTimer);moveTimer=null}clearContours();clearPointState(true);
  }
  onMount(()=>{loadPreferences();if(!enabled)release(config.name,'high');freshnessTimer=setInterval(checkAutomaticRefresh,30_000);document.addEventListener('visibilitychange',checkAutomaticRefresh);window.addEventListener('online',checkAutomaticRefresh);map.on('moveend',handleMapNavigation);map.on('zoomend',handleMapNavigation);try{timestampListener=store.on('timestamp',()=>{if(enabled&&cache.length&&!viewportLoading)renderFromCache();if(enabled)updatePersistentClickLabel()})}catch{}refreshViewport()})
  onDestroy(()=>{destroyed=true;refreshEpoch++;pendingProfiles.clear();if(freshnessTimer)clearInterval(freshnessTimer);document.removeEventListener('visibilitychange',checkAutomaticRefresh);window.removeEventListener('online',checkAutomaticRefresh);generation++;clickGeneration++;refreshQueued=false;if(moveTimer)clearTimeout(moveTimer);map.off('moveend',handleMapNavigation);map.off('zoomend',handleMapNavigation);if(timestampListener!==null)try{store.off(timestampListener)}catch{}clearContours();clearClickLayer();profileCache.clear()})
</script>

<style lang="less">
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
  :global(.snowline-click-label){pointer-events:auto!important}:global(.snowline-click-label>span){position:relative;display:flex;flex-direction:column;gap:6px;width:228px;min-height:146px;box-sizing:border-box;padding:40px 9px 9px;border-radius:14px;border:1px solid rgba(255,255,255,.11);border-top:2px solid var(--probe-accent,rgba(255,255,255,.4));border-bottom:3px solid var(--snowline-color,white);background:linear-gradient(180deg,rgba(11,17,21,.985),rgba(7,12,16,.99));color:#fff;text-align:center;white-space:normal;text-shadow:none;box-shadow:0 10px 30px rgba(0,0,0,.54)}
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
</style>
