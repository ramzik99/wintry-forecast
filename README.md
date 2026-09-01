# Wintry forecast for Windy

A convenience-first Windy external plugin for terrain-aware winter-weather guidance using **ECMWF vertical profiles** and **Windy local terrain**.

The interface is designed to answer five questions quickly: **what will fall, where is the snowline, how does terrain compare, how much precipitation/new snow is expected, and when?** Technical detail stays available in the Forecast and Sounding views.

## Current release

**200.0.3**

v200 is the convenience freeze: the plugin is feature-complete. Future releases should be limited to bug fixes, compatibility updates, scientific corrections, and small UI polish rather than new forecast metrics.

## What it shows

### Map

- Adaptive **snowline contours** that follow Windy's forecast time
- Approximate contour spacing of 500 m at broad scales, 200 m regionally, and 100 m locally
- Decluttered contour labels
- Exact point guidance for a normal map click while the plugin is active

### Selected point

A selected point shows:

- Windy terrain elevation
- Thermal snowline
- Position relative to the snowline
- Forecast precipitation
- Terrain-aware precipitation type when precipitation is present
- A simplified current-condition label
- The next terrain-relevant wintry period through +144 h
- Quick controls for the forecast graph, favourites, sharing and closing

Diagnosed precipitation types are:

- Snow
- Wet snow
- Rain/snow mix
- Rain
- Ice pellets / sleet
- Freezing rain

### Forecast window

The forecast window contains:

- A **144-hour graph** of snowline, precipitation, precipitation type and estimated new snow
- A compact current/next wintry-period summary
- A **forecast sounding** with temperature, dew point and wet-bulb temperature
- Hover/touch sounding inspection plus simple zoom and fit controls

Forecast valid times use the device/browser timezone and locale. ECMWF cycle labels remain in UTC (`Z`).

## Snowline calculation

For each sampled point, the plugin requests an ECMWF meteogram profile using pressure-level:

- Temperature
- Dew-point temperature
- Geopotential height
- Pressure

Current pressure levels:

`1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150 hPa`

Wet-bulb temperature is solved with a pressure-aware psychrometric relation. The plugin finds the lowest upward crossing from wet-bulb temperature above 0°C to wet-bulb temperature at or below 0°C and linearly interpolates its height.

That wet-bulb-zero height is used as the plugin's **thermal snowline proxy**. It is a rain/snow-boundary diagnostic, not proof that snowfall is occurring.

If the lowest resolved atmospheric level is already at or below 0°C wet bulb, the lowest available level is used rather than pretending a lower crossing is resolved.

## Terrain-aware precipitation type

For a selected point, the atmospheric profile is intersected with Windy's local terrain elevation. The precipitation-type algorithm evaluates positive wet-bulb energy in warm layers and sub-zero wet-bulb energy below them.

This is a profile-based diagnostic, not ECMWF native precipitation-type output. Sparse pressure-level structure and marginal thermal profiles can reduce confidence.

Precipitation type is diagnosed only once the normalized precipitation signal reaches **0.1 mm per 3-hour-equivalent amount**.

## Estimated new snow

Estimated new snow is calculated from:

1. forecast liquid precipitation,
2. terrain-aware precipitation type,
3. a snow fraction for marginal/mixed precipitation,
4. a temperature-dependent fresh-snow ratio, and
5. modest settling and melt of the forecast-created layer.

The precipitation input is normalized to a **3-hour-equivalent amount** and integrated using the actual represented forecast interval, so hourly and 3-hourly sampling remain consistent.

Ice pellets, freezing rain and rain are not counted as new snow. Mixed and wet snow are handled conservatively without double-penalising both the snow fraction and snow-to-liquid ratio.

**Estimated new snow is not ECMWF snow depth, observed snow depth, or a full snowpack model.** It should be treated as forecast guidance. Real accumulation can differ because of cloud microphysics, precipitation intensity, wind, radiation, ground temperature, compaction, melting and local terrain effects.

## Map interaction

When Wintry forecast is **On**:

- A normal map click opens the plugin's point label.
- That click is intercepted so it does not simultaneously open Windy's native point picker.
- Windy's own pointer remains independent and can still be opened through Windy's controls.

This separation prevents the two point-selection systems from competing with each other.

## Search and saved places

The panel includes:

- Place search using OpenStreetMap Nominatim
- Current device location
- Locally saved favourite points
- Clear and hide/show controls

Saved places are stored locally in the browser/app environment.

## Contour generation and performance

The plugin does not download a complete ECMWF gridded snowline field. It samples vertical profiles across the visible map and reconstructs contours using marching squares.

Sampling density increases with zoom:

| Zoom | Sampling grid |
| --- | --- |
| ≤ 4 | 9 × 15 |
| 5–6 | 13 × 21 |
| 7–8 | 17 × 27 |
| 9+ | 19 × 31 |

Up to **12 profile requests** are processed concurrently. Profiles are cached, viewport refreshes are queued, and precipitation-field discovery is cached per forecast object.

## Interpretation

Use the map contours for spatial context and the point forecast for local detail. Actual precipitation type and accumulation still depend on model error, precipitation availability and intensity, unresolved vertical structure, local terrain and microphysical processes.

## Project structure

- `src/plugin.svelte` — main Windy UI, map interaction, point loading and contours
- `src/PlaceSearch.svelte` — place search, geolocation and saved points
- `src/SnowlineChart.svelte` — +144 h point forecast graph
- `src/SoundingChart.svelte` — interactive forecast sounding
- `src/snowLevel.ts` — wet-bulb and thermal snowline calculation
- `src/precip.ts` — precipitation-field selection and normalization
- `src/precipType.ts` — terrain-aware precipitation-type diagnosis
- `src/snowAccum.ts` — estimated forecast-created new snow
- `src/eventOutlook.ts` — next-wintry-event detection and summary
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

The repository includes a manual Windy publishing workflow. Keep the Windy API key in GitHub Actions secrets as `WINDY_API_KEY`; never commit it to the repository.

Every Windy release must use a new version. CI now verifies that:

- `package.json` version matches `src/pluginConfig.ts`, and
- the generated `dist/plugin.json` carries the same version.

This prevents accidental re-publication of an old Windy version.

## 200.0.3 production hardening

- Preserves the improved snow-fraction / snow-to-liquid separation for mixed and wet snow.
- Keeps ice pellets out of the estimated new-snow total.
- Removes hidden first-step precipitation guessing from the snow-physics function; accumulation now follows the represented forecast interval consistently.
- Adds CI and publishing checks to prevent metadata-version drift.
- Cleans outdated and contradictory release documentation.

## Author

Ramzi Kandah
