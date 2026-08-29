# Wintry forecast for Windy

## v100: convenience first

**Feature-complete:** v100.1 focuses on five-second answers and depth on demand. Future releases are intended to be bug fixes and UI polish rather than new forecast metrics.

The default interface is designed to answer five questions quickly: **what will fall, where is the snowline, how does terrain compare, how much precipitation/new snow is expected, and when?** Technical detail stays in the Forecast and Sounding tabs.

A Windy.com external plugin for terrain-aware winter-weather guidance using **ECMWF vertical profiles** and **Windy local terrain**.

The plugin follows Windy's forecast timeline out to **+144 hours** and combines a thermal snowline diagnostic with point-based precipitation-type guidance.

## What it shows

### Map

- Adaptive **snowline contours** that update with the Windy forecast time
- Contour spacing of approximately:
  - 500 m at broad scales
  - 200 m at regional scales
  - 100 m at local scales
- Decluttered contour labels
- Exact point labels for any normal map click while the plugin is active

### Point forecast

A selected point shows:

- Local Windy terrain elevation
- Thermal snowline
- Position relative to the snowline
- Precipitation rate
- Terrain-aware precipitation type when precipitation is present
- A deliberately simplified map label: current precipitation type, **terrain elevation**, snowline, terrain/snowline relationship, precipitation and valid local time
- A single next-event line for the first terrain-relevant wintry event through +144 h
- Quick controls for the forecast graph, favourites, sharing and closing

The precipitation-type diagnosis can identify:

- Snow
- Wet snow
- Rain/snow mix
- Rain
- Ice pellets / sleet
- Freezing rain

### Forecast window

The forecast window contains:

- A **144-hour graph** of snowline, precipitation, precipitation type and estimated new snow
- A compact next/current wintry-period summary with timing, type and estimated new snow
- A **forecast sounding** with temperature, dew point and wet-bulb temperature
- Sounding hover/touch inspection plus simple zoom and fit controls

Forecast valid times are displayed using the device/browser local timezone and locale. ECMWF model-run cycle labels remain in UTC (`Z`).

Estimated new snow is calculated from forecast precipitation, terrain-aware precipitation type and wet-bulb conditions. It is **not existing snow depth or snowpack**.

## Map interaction

When Wintry forecast is **On**:

- A normal map click opens the plugin's point label.
- That click is intercepted so it does not also open Windy's native point picker.
- Windy's own pointer is independent of the plugin and can be opened separately, including through Windy's context/right-click controls.
- Opening or moving Windy's pointer does not create or move the plugin point label.

This separation prevents the two point-selection systems from competing with each other.

## Search and saved places

The panel includes:

- Place search using OpenStreetMap Nominatim
- Current device location
- Locally saved favourite points
- A clear control
- A hide/show panel control

Saved places are stored locally in the browser/app environment.

## Snowline calculation

For each sampled point, the plugin requests an ECMWF meteogram profile and uses pressure-level:

- Temperature
- Dew-point temperature
- Geopotential height
- Pressure

Current pressure levels:

`1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150 hPa`

Wet-bulb temperature is solved using a pressure-aware psychrometric relation. The plugin then finds the lowest upward crossing from wet-bulb temperature above 0°C to wet-bulb temperature at or below 0°C and linearly interpolates its height.

That wet-bulb-zero height is used as the plugin's **thermal snowline proxy**.

If the lowest resolved atmospheric level is already at or below 0°C wet bulb, the lowest available level is used as the available estimate rather than pretending the true lower crossing is resolved.

## Terrain-aware precipitation type

For a selected point, the atmospheric profile is intersected with Windy's local terrain elevation. The precipitation-type algorithm evaluates positive wet-bulb energy in warm layers and sub-zero wet-bulb energy below them.

This is a profile-based diagnostic, not ECMWF precipitation-type output. Sparse pressure-level structure and marginal thermal profiles can reduce confidence.

Precipitation type is only diagnosed when precipitation reaches **0.1 mm/h**.

## Contour generation and performance

The plugin does not download a complete ECMWF gridded snowline field. It samples vertical profiles across the visible map and reconstructs contours using marching squares.

Sampling density increases with zoom:

| Zoom | Sampling grid |
| --- | --- |
| ≤ 4 | 9 × 15 |
| 5–6 | 13 × 21 |
| 7–8 | 17 × 27 |
| 9+ | 19 × 31 |

Up to **12 profile requests** are processed concurrently. Profiles are cached, and viewport refreshes are queued to avoid unnecessary redraw competition.

Precipitation-field discovery is also cached for each forecast object so the graph does not repeatedly scan the same data structure.

## Interpretation

The snowline is a **thermal rain–snow boundary proxy**, not proof that snowfall is occurring.

Actual precipitation type and accumulation still depend on precipitation availability and intensity, local terrain, boundary-layer structure, unresolved vertical layers, model error and other microphysical processes.

Use the map contours for spatial context and the point forecast for local detail.

## Project structure

- `src/plugin.svelte` — main Windy UI, map interaction, point loading and contours
- `src/PlaceSearch.svelte` — place search, geolocation and saved points
- `src/SnowlineChart.svelte` — 144-hour point forecast graph
- `src/SoundingChart.svelte` — interactive forecast sounding
- `src/snowLevel.ts` — wet-bulb and thermal snowline calculation
- `src/precip.ts` — precipitation-field selection and normalization
- `src/precipType.ts` — terrain-aware precipitation-type diagnosis
- `src/snowAccum.ts` — estimated forecast-created new snow
- `src/eventOutlook.ts` — v20 next-wintry-event detection and summary
- `src/terrainCrossing.ts` — snowline/terrain crossing timing
- `src/contours.ts` — marching-squares contour generation and stitching
- `src/selectedPrecip.ts` — supplemental ECMWF precipitation loading
- `src/pluginConfig.ts` — Windy plugin metadata

## Local development

```bash
npm install
npm start
```

A browser warning for the local self-signed development certificate can be normal when using Windy's plugin devtools.

## Build

Unix-like systems:

```bash
npm run build
```

Windows:

```bash
npm run build:win
```

The compiled plugin is written to `dist/`.

## Publishing

The repository includes a Windy plugin publishing workflow. Keep the Windy API key in GitHub Actions secrets as `WINDY_API_KEY`; never commit it to the repository.

Each published release must use a new version number.

## v21 feature-complete release

- Metric / Imperial display units
- ECMWF run freshness
- Event confidence plus Start / Peak / End timeline
- Elevation-impact guidance and estimated new snow by elevation
- On-demand next-event outlook for saved places
- Stronger freezing-rain / ice-pellet hazard emphasis
- Persistent panel, enable/disable, tab and unit preferences
- Hover/touch sounding inspection for pressure, height, temperature, dew point and wet bulb

## Current version

**200.0.1**

### 200.0.1 compatibility fixes

- Metric / Imperial changes immediately re-render map contours, point labels, charts and exported chart values.
- While the plugin is open, normal left-clicks are claimed by the plugin so Windy's native point picker is not opened.

## Author

Ramzi Kandah


## v200: convenience freeze

v200 is the final convenience-first interface: fast point answers, a clean +144 h forecast, and optional sounding depth. Future changes should be bug fixes, compatibility updates, or small UI polish rather than new forecast metrics.

