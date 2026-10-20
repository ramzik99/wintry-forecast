# Release history

## 1000.1.7 — 20 October 2026

Preserves the selected Windy weather layer beneath translucent Wintry shading. Removes the extra opaque geographic overlay and automatic Precipitation type selection. Smooth edges, terrain diagnosis, compact controls and streaming MP4 remain.

117 unit tests, live desktop/mobile selection and shading checks, complete MP4 download and independent H.264 decoding passed. [Release notes](../RELEASE_1000_1_7.md).

## 1000.1.6 — 20 October 2026

Continuous geographic terrain background, translucent precipitation colours, smooth wet/dry edges and decoded frame swaps. Repairs the black WebGL raster textures and close-zoom shading loss. Screen and MP4 rendering share the same background and opacity.

117 unit tests, live Windy desktop/mobile-host checks and a complete independently decoded MP4 passed. [Release notes](../RELEASE_1000_1_6.md).

## Archived notes

# Wintry forecast for Windy

A convenience-first Windy external plugin for terrain-aware winter-weather guidance using **ECMWF vertical profiles** and **Windy local terrain**.

The interface is designed to answer five questions quickly: **what will fall, where is the snowline, how does terrain compare, how much precipitation/new snow is expected, and when?** Technical detail stays available in the Forecast and Sounding views.

## Development candidate

**1000.0.14 — not published.** Shared interval accounting, separate snowfall and
experimental remaining-layer estimates, below-model-ground masking when known,
and a point-only terrain-flow diagnostic. Rainfall amounts remain ECMWF values;
forecast skill has not been independently validated.
[Changes](V1000_0_14.md) · [Method, equations and limitations](METHODS.md).

## Previous release notes

**1000.0.13**

**Prepare & download MP4** now prepares the current area and then creates a real
H.264 MP4 in the browser. The video includes a geographic background, precipitation
shading, enabled type icons and snowline contours, local forecast timestamps and
a legend. It uses five forecast hours per video second, with hourly contour frames
and explicit missing-interval boundaries. A shorter forecast stays shorter; unknown
weather remains blank. Windy's selected weather layer, forecast lightning and
dry-terrain hatching are excluded. Browser H.264 support is checked before preparation;
unsupported browsers show a message and normal timeline use remains available.
Progress and cancellation cover preparation and encoding. After export, a download
link remains available if the browser blocked the automatic download. The encoded
video has a maximum dimension of 1280 pixels and is created without uploading frames.
MP4 encoding/muxing uses the bundled [Mediabunny](https://mediabunny.dev/) dependency
(MPL-2.0). Version 1000.0.13 is published and available through the link below.

Point cards and the graph now explicitly show average precipitation in mm/h or
in/h. The graph also reports next-24-hour liquid accumulation with its start/end
times. It integrates non-overlapping supported intervals from the loaded forecast,
independently of phase, and marks incomplete windows unavailable. Shorter source
intervals cannot be stretched over unsampled hours. Tiny positive amounts display
as below a rounding threshold instead of falsely becoming zero. Fixed map type
colours and the rendering/preparation cache remain unchanged.

Final convenience release: a stage-weighted percentage ring follows normal map
updates for enabled contours, shading and icons. It measures processed forecast
samples, terrain tiles and raster work, stays below 100% while jobs are running,
and disappears when loading finishes. It is not a download-byte or accuracy percentage.

Forecast and elevation requests now stop waiting even if a provider ignores
cancellation. Data status under Choose a place reports profile and precipitation
availability; incomplete coverage has a visible warning. Unknown samples stay
blank and are never labelled dry. The ECMWF point feed and Windy's native
precipitation layer can have different wet coverage. This release does not claim
to remove that source difference or establish improved forecast accuracy.

Prepare map forecast stores all available represented intervals for the current
view, up to 144 hours, with cancellation and storage-failure fallback. Prepared
frames are invalidated when the view, model run or forecast data changes. Shading
retains one fixed Windy colour per type; contours, shading and icons stay independent.

Compact 260 px desktop / 250 px phone-width panel, with location settings collapsed after selection. Forecast and Sounding remain directly accessible. The panel sits on the left above the timeline, away from right-side map controls, and can minimize to a small button. Use Windy's existing timeline to change forecast time; the duplicate slider and day shortcuts have been removed from both views.

[Published plugin](https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.0.13/plugin.min.js) · [Release notes and verification](V1000.md)

v300 prioritizes quick, easy, reliable local snow forecasts. The point card gives the immediate answer; the graph and sounding remain optional.

### 301.0.2 contour direction

Reversed the palette: violet at -500 m, indigo at 500 m, blue at 1500 m, green at 2500 m, yellow at 3500 m, orange at 4500 m, and red at 6000 m. Fixed elevation stops, smooth colour transitions, and contrasting outlines remain.

### 301.0.1 ROYGBIV contours

Contours progress from red at -500 m through orange (500 m), yellow (1500 m), green (2500 m), blue (3500 m), indigo (4500 m), and violet (6000 m). Colours interpolate between fixed elevations and keep contrasting outlines and elevation labels.

### 301.0.0 refinement release

Uses 301.0.0 to advance beyond the previous v300 releases, as required by Windy. Forecast time axes reject invalid samples without shifting data. Timeline inspection uses the active interval; phase bands and snow totals align with interval boundaries. Unknown gaps stay blank. Next-day image totals require full coverage of that day. Sounding confidence labels match the point card. Superseded location requests cannot replace a newer selection.

### 300.0.6 contour contrast

Contours use opaque elevation colours, stronger strokes and a contrasting dark or white casing for clearer visibility across map backgrounds.

### 300.0.5 concise outlook

Removed the later-data warning text. Partial outlooks still state their supported duration, and unknown precipitation and unsupported snow totals remain unavailable.

### 300.0.4 forecast clarity

Partial dry forecasts retain their valid information. Cumulative snow curves stop at the first unavailable interval instead of continuing through gaps. Duplicate missing-data notes are removed when the outlook already explains its coverage; exports no longer present a complete snow estimate for incomplete data. Includes the point-card footer removal and usable-outlook-window fix.

### 300.0.3 clearer forecasts and controls

The point card no longer repeats the precipitation-period footer. When a later forecast gap prevents a complete outlook, the summary reports the verified no-wintry-precipitation window and distinguishes it from unavailable later data. Missing current data remains explicitly unavailable.

The graph uses daily +24 through +144 h ticks from the first forecast sample, larger precipitation-type labels in two rows, and removes the bottom explanatory notes. Shorter forecasts leave the remaining horizon blank instead of stretching the data.

Low-confidence precipitation estimates say “Snow possible” (or the corresponding type) consistently on the point card, forecast graph, event summary, copy and image export. The supporting note explains limited atmospheric detail instead of contradicting a definite headline. Event labels use the confidence of the whole event.

Removed the manual Refresh button and automatic-refresh status text. Refresh continues in the background using the existing schedule and retry handling. The installed version remains visible. Hatching uses bold, widely spaced diagonal stripes beneath contour lines and labels with touching fragments joined across triangle boundaries, removing overlaps while preserving missing-data gaps.

### 300.0.2 automatic refresh, version and clearer contours

The compact footer shows the installed version and automatic update status. Forecasts refresh every 15 minutes while enabled, visible and online; overdue checks run when returning to the tab or reconnecting. Failed map loads retry after two minutes, including failures on first open. Active requests are allowed to finish before another automatic refresh.

Contours have a light outline for contrast, stronger major elevations and quieter terrain hatching underneath. Labels use screen-space length and spacing, avoid clipped map edges and can identify separate contour segments. Paths are batched by elevation to reduce rendering overhead. The contour field, interpolation and −500 m floor are unchanged.

### 300.0.1 automatic search

Search starts after three characters and a 450 ms typing pause. Photon provides suggestions; outdated requests are cancelled and repeat queries cached. Saved places appear only inside Saved, with all saved entries available in a scrolling list.

### 300.0.0 compact controls

- Smaller main panel with a single-row forecast toolbar and quick saved-place shortcuts.
- Clear appears only when needed; search, location, units and refresh remain directly accessible.
- Preserves the −500 m contour floor, raw cold-column diagnostics and missing-data safeguards.

### 200.0.13 convenience and reliability

- Tap a saved-place shortcut or the map for the local forecast; open Forecast, Save the place, or Copy a short summary.
- Read the current/next wintry interval and estimated new snow. During an active interval, the amount is the estimated snow **remaining from the selected time**.
- Missing precipitation and uncertain precipitation type are explicitly labelled. A missing forecast is never treated as dry weather.
- Refresh checks current data; profiles expire after 15 minutes. Older responses cannot replace a newer model run, and viewport fields do not combine known different runs.
- Unit changes immediately update the graph and sounding. Mobile windows scroll; forecast and sounding images can be saved.
- The contour field and range never fall below −500 m. Internal cold-column diagnostics and terrain comparisons retain their original values.
- Signed warm/cold-layer integration splits at zero before measuring area. This is an arithmetic correction, not a calibration of the empirical phase thresholds.
- Cross-platform production builds use the same Node entry point on Windows and Unix.

## What it shows

### Map

- Precipitation shading uses the Windy palette: cyan rain, magenta freezing rain,
  dark red-brown ice pellets, grey snow, green wet snow and yellow-green mix.
  Each type has one fixed colour; precipitation intensity is not encoded in shading.
  Zero precipitation is unshaded, and unknown precipitation or phase stays blank.
- Weather profiles start at nominal 9 km locally, with coarser broad overviews.
  Terrain refines beyond zoom 8 while reusing those profiles and precipitation totals.
  Separate **Contours**, **Shading** and **Icons** controls retain their settings; Icons includes forecast lightning.
- Precipitation icons use the same terrain-aware phase as shading, with matching
  colours. They reuse existing wet samples (no extra weather requests), stay spaced
  across the screen and are capped at 80 markers. Dry and missing samples stay blank.
- Lightning symbols use raw ECMWF `thunder/lightdens` forecast tiles through Windy's
  tile interpolator, independently of the selected base layer. They show forecast
  activity, not observed strikes. The display threshold is 0.025 native density
  units; missing data stays blank. At most 80 spaced samples and 6 concurrent
  tile reads reuse Windy's tile cache. No CAPE-based lightning diagnosis is used.
- Terrain-above-snowline hatching appears only over known dry samples. It is part
  of the contour layer and disappears when contours are hidden.
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

If the lowest resolved atmospheric level is already below 0°C wet bulb, a bounded downward extrapolation keeps the diagnostic finite. Its status remains below the resolved profile. Display contours are clamped to −500 m; the raw estimate remains available for terrain comparisons.

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

- Explicitly submitted place search using OpenStreetMap Nominatim (typing only filters saved places)
- Current device location
- Locally saved favourite points
- Clear and hide/show controls

Saved places are stored locally in the browser/app environment; the first three are available as one-tap shortcuts.

Automatic place search uses [Photon](https://github.com/komoot/photon), which supports search-as-you-type. Its public endpoint permits reasonable use without an availability guarantee; a larger deployment should use a dedicated instance. User-requested reverse lookups use a paced Nominatim client queue and in-memory cache. The public service prohibits autocomplete and applies a one-request-per-second limit to the whole application, not each user. A distributed deployment needs a shared rate-limited proxy or an appropriate provider before aggregate traffic exceeds that limit. See the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/). Client pacing alone does not enforce an application-wide limit.

## Contour generation and performance

The plugin does not download a complete ECMWF gridded snowline field. It samples vertical profiles across the visible map and reconstructs contours using marching squares.

Weather samples use a globally anchored metric grid: nominal 9 km locally,
coarsened when needed to stay within 225 viewport nodes, or 450 at zoom 5 and
below for a denser overview. Contours use these profiles.
Terrain shading uses up to 512 cells (1024 at zoom 5 and below), halving nominal spacing each zoom beyond 8
while maintaining at least 12 screen pixels between samples. It reuses the nearest
weather profile and rainfall amount; this does not create higher-resolution rainfall.
Missing owners remain blank.

Up to 12 profile requests run concurrently. Partial shading appears before all
requests finish. Terrain uses four concurrent tile requests and cached elevations;
cancellation stops obsolete work. Six type colours are rendered in raster tiles.
Lightning uses zoom-adaptive display spacing and its own cancellable, bounded
tile sampling; the underlying ECMWF field remains at its native resolution.

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

The panel has larger layer controls, matching icon legends, an independent Icons
legend, a manual Refresh button, and a general Updating status covering weather,
terrain and lightning work. Map coordinates are wrapped before forecast requests
when navigating across the date line.

At every zoom, lightning samples use the visible footprint of each display
cell so symbols stay inside the map even in very small viewports.
This changes symbol placement and sampling, not the ECMWF forecast resolution.

## Tiled precipitation preview (11 October 2026)

Shading uses globally anchored 256-pixel raster tiles, with 96 diagnosis samples per axis. Tile zoom is inferred from visible map width and longitude bounds, keeping diagnosis samples at about 2–4 screen pixels even with Windy's wrapper zoom conventions and fractional zoom. Bilinear interpolation of precipitation and pressure-level temperature/dew point/height replaces nearest-neighbour weather blocks. Wet bulb is recalculated before phase classification; category colours remain discrete, with one colour per type. Missing forecast corners remain transparent.

Mapzen Terrarium elevation tiles are decoded locally and interpolated across tile boundaries. Terrain data zoom follows the physical map zoom minus two, capped at 14; original terrain resolution varies by location. Four concurrent terrain requests, pending-request sharing, a 64-tile decoded LRU (16 MiB), ten-second timeout and failure cooldown keep work bounded. Cached weather terrain supplies an explicitly identified coarse fallback. Point forecasts continue using Windy elevation. Timeline changes reuse weather profiles, DEM tiles and bounded prepared frames. Raster work yields between tiles and cancels stale render jobs. Icons reuse the same interpolation and terrain diagnosis.

Terrain endpoint: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png . See [terrain attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md); credits are included in How it works. Weather samples still target 9 km locally and use bounded overview sampling; this preview does not download every native ECMWF cell globally. Forecast accuracy has not yet been validated against observations.


### Selected Windy layer and fixed shading strength

Wintry keeps the selected Windy layer. Valid wet diagnoses use fully opaque precipitation pixels; known dry and missing weather remain transparent. Each precipitation type uses one fixed colour, with no intensity gradient or opacity slider. DEM relief modulates the colours without revealing the underlying weather layer.

A separate geographic foreground draws cached map tiles at 45% opacity, clipped to the same wet-area mask. This retains roads, labels and terrain above the opaque colours while leaving dry areas unchanged. It uses Windy's geographic tile templates and an outdoor-map fallback. Up to four requests per render, shared pending requests, a 32-image cache on narrow screens or 96 images on wider screens, and ten-second timeout bound loading. Failed tiles are reported. DOM image overlays are the verified live path; native MapLibre ordering is available where the host exposes it.

Below zoom 8, Shading and Icons controls are disabled and their overlays removed. Zooming closer restores their checked choices. Contours remains independent. Icons combines precipitation symbols and raw ECMWF forecast lightning.

Palette matches the Windy precipitation-type legend: rain cyan #0099b6; freezing rain magenta #900096; mixed ice/ice pellets dark red-brown #510c0f; snow grey #b2b2b2; wet snow green #569456; rain/snow mix yellow-green #95a109. Shading, icons, point phase headings and charts share these hues. Precipitation amounts remain available in point forecasts. Ice pellets remain the plugin diagnosed class; matching the Mixed ice colour does not equate the classifications.

Live Windy close-ups verified opaque wet colours and outdoor-map road/terrain visibility. Native city weather annotations still describe native Windy forecasts. Missing or unavailable forecast intervals remain transparent. A complete live grid (55/55 points at the tested noon forecast) had no missing profiles, amounts or phase diagnoses; unshaded rectangles were zero precipitation in the point feed while the native map showed precipitation type. Known limitation in this release: the point precipitation feed and native map precipitation-type mask can disagree. Do not fill those areas with invented precipitation or claim they are missing-data gaps. Differences from native ECMWF output are not an accuracy validation. Version 1000.0.9 includes opaque precipitation, geographic foreground, the revised palette, combined precipitation/lightning icons, and zoom-dependent controls. The release retains the known point/map precipitation discrepancy.


### Fast timeline preview (12 October 2026)

Map shading and precipitation icons reuse frames for the actual represented forecast interval. Moving between hours inside that interval does not rebuild the raster or request new point profiles. Up to six frames are retained under an estimated pixel budget of 48 MiB on narrow screens and 96 MiB on wider screens, and one next interval is prepared in the background after foreground loading settles. New model runs, refreshed profiles, terrain changes and viewport or control changes invalidate the relevant frames. Obsolete rendering is cancelled; a new foreground frame replaces the previous frame atomically while Updating is shown. Dry intervals skip raster allocation. This cache does not create hourly source profiles where only coarser intervals exist.

Forecast lightning retains six previously viewed time/view frames for up to fifteen minutes, with model-run and refresh invalidation. Unseen lightning hours can still require data. Windy's selected background layer also controls its own time-dependent requests; the plugin cannot eliminate those loads. Caches are bounded to keep activation and memory use manageable rather than downloading the global forecast.

Verification: 65 unit tests, synthetic desktop/mobile raster and icon regressions, named point card checks, and a timeline cache fixture. The fixture verified no new point requests or raster rebuilds within one represented interval, reuse of the prepared next interval, immediate return to cached wet frames, dry-frame clearing, rapid-time cancellation and lightning revisit reuse. Fixture timings are not an internet performance benchmark or evidence of forecast skill. Version 1000.0.6 includes these optimizations, the Windy legend palette and named point labels with visible pointers.

### Control and request reliability preview

Precipitation icons are prepared with each bounded cached map frame and shown only when Icons is enabled. Switching Icons does not invalidate or repaint precipitation shading. Duplicate move-end and zoom-end notifications for the same viewport are ignored. Initial loading paints one early partial view and the complete view, avoiding repeated partial raster rebuilds. Raster work also yields every twelve rows to keep input responsive at unchanged sample resolution. Prefetch is skipped when it cannot retain both the current and next frame within the memory budget, and an oversized next frame is not repeatedly prepared. Supplemental precipitation requests stop waiting after twelve seconds and pass cancellation to Windy; late provider results are discarded. Refresh, disable and destruction cancel tracked forecast requests. Timeout or cancellation retains unknown precipitation as unknown rather than inventing dry or wet values.

Validation: 69 unit tests, including hanging-provider timeout, cancellation, late-response rejection and completed-request cleanup; timeline regression verifies icon switching without new raster allocations or forecast-profile requests. Desktop/mobile point-card and map regression checks are retained. Version 1000.0.7 includes these improvements; no intensity overlay or intensity controls are added.

### Prepare & download MP4

The optional Prepare & download MP4 button prepares all distinct represented forecast intervals for the current map footprint, up to 144 hours, then encodes and downloads an MP4. It uses already loaded weather profiles and the same 96-by-96 diagnosis samples per 256-pixel tile. The timeline remains the time selector. Progress, a rough preparation-time estimate and cancellation are available. Each completed frame stores its precipitation PNG tiles, masked geographic detail and type symbols in the plugin's own IndexedDB store; decoded frames still use the bounded RAM cache. Geographic tile images are shared across prepared times to avoid repeated downloads for an unchanged view. The local prepared view has a conservative 512 MiB serialized-data limit, and storage quota or access errors stop preparation with a visible message while normal timeline rendering stays usable. Completed times survive cancellation within the current view. Cached timeline frames are session data; the downloaded MP4 is a separate file that can be kept and shared.

Moving or zooming the map, changing shading, refreshing, disabling, a new model run or expired profiles invalidates preparation. Foreground time changes take priority; obsolete background work is discarded and preparation resumes for the remaining times when the view remains valid. Automatic refresh waits until preparation stops; profile freshness checks still apply. Forecast lightning and Windy's background layer are outside this prepared shading/type-icon cache and can still load for unseen times. Preparing an entire detailed view can take several minutes and is not necessary for normal use. No intensity overlay or new intensity scale is added.

Synthetic browser verification prepared all 145 hourly fixture timestamps, then evicted a wet frame from RAM and restored it from disk without new raster pixel allocation or forecast-profile requests. Geographic detail and type symbols restored correctly. Cancellation, map navigation invalidation and a simulated local-storage quota failure were verified. These fixture results are not live-network timing or scientific accuracy measurements.

MP4 verification: automated timing, horizon/gap, dimension, unsupported-browser and
image-cancellation checks; Chrome H.264 encoding followed by playback, decoded-colour
and duration checks; export cancellation; synthetic landscape and portrait map
composition checks using the plugin's actual export functions. These checks verify
video generation and layout, not live Windy integration or forecast skill.
