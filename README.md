# Wintry forecast for Windy

**Published 1000.1.7** — terrain-aware winter-weather guidance from sampled
ECMWF profiles and local terrain. Six physical types are displayed; limited-detail point diagnoses are qualified
with “possible”, while unsupported snow amounts remain unavailable. Independent forecast-skill validation
is still required; this is not a calibrated high-confidence forecast.

## Use

Opening/enabling the plugin preserves your selected Windy weather layer.
Windy weather stays beneath the translucent plugin shading. Contours, markers
and the Windy interface remain above it. No additional base-map overlay is added. Search for a place or select a map point. The point card
shows the diagnosed precipitation type, terrain, estimated snowline and average
precipitation. **Forecast** opens the timeline; **Sounding** keeps the atmospheric
profile available without crowding the map controls.

- **Contours:** estimated snowline contours.
- **Shading:** six physical precipitation types in their existing Windy colours.
  Type hues stay fixed. Translucency keeps the underlying Windy layer visible, and wet/dry support fades at the edges to avoid hard grid-shaped borders.
  Edge opacity is not an intensity scale or a probability. Windy's own weather and map supply the live background.
  No decorative terrain brightness or hatching is applied.
  Weather and terrain inputs finish loading, and every image decodes, before the previous complete shading frame is replaced.
  Stale frames are discarded after navigation or settings changes.
  Elevation detail follows raster zoom, up to DEM zoom 14, while adapting large views to a 64-tile / 16 MiB cache.
  If detailed terrain coverage is incomplete, the entire view uses the coarse estimate consistently.
  No extra unresolved-type colour or question-mark icon. Missing/unclassifiable
  profiles remain blank rather than receiving an invented type.
  Warm levels available in valley columns are retained when neighbouring mountain
  columns mask them; partial horizontal support remains a limited-detail estimate.
- **Optional icons:** precipitation symbols and ECMWF forecast lightning; off by default for new preferences.
- Shading and icons become available from zoom level 8; contours are independent.
- Search, saved locations, metric/imperial units and image export are retained.
- Controls remain compact on desktop and mobile; forecast windows stay on screen
  after resizing. Your selected Windy layer stays active when opening, enabling or closing the plugin.

## Download MP4

**Download MP4** renders and encodes the current map area one frame at a time,
through available forecast times up to 144 hours, and starts the download automatically.
The full animation is not stored on disk, so it cannot hit the former 512 MB preparation limit.
H.264 support is required; browsers without it retain optional timeline preparation.

The video uses a geographic background with the same shading opacity and wet/dry edges as the map, plus enabled type
icons and snowline contours, timestamps and a colour legend. It excludes Windy's
weather layer and forecast lightning. Five forecast hours
correspond to one video second. The longest video dimension is bounded at 1280 px.
Encoding happens in the browser without uploading the frames.

A single progress indicator, cancellation and a repeat-download link are available.
The repeat link saves the finished video without re-rendering it. Moving/zooming,
new data or changing relevant settings cancels an in-progress export. Large views
can take several minutes; normal map viewing does not require exporting. Missing forecast
periods stay blank. Filling the optional timeline cache does not interrupt preparation.
Geographic tiles and forecast lightning can load independently of the weather profiles.

## Quantities and interpretation

- Precipitation is the **average rate over the source interval**, not instantaneous
  intensity. Next-24-hour liquid totals require complete supported coverage.
- **Snowfall total** is estimated gross fresh snowfall. It does not decrease when
  later melt occurs and does not represent total snow already on the ground.
- **Snowfall amounts** remain heuristic, are rounded to whole centimetres/inches
  (positive sub-unit amounts use `<1`) and become unavailable across wet intervals
  with insufficient atmospheric detail. Rounding is display precision, not a calibrated error range.
- **Remaining ground snow and wind–terrain exposure** are removed from the user
  interface. Their experimental research functions remain in source.
- **Thermal snowline** is a wet-bulb-zero proxy, rounded to 100 m / 500 ft. A
  zero crossing across more than 1400 m or an extrapolation below the profile is
  withheld. Contours preserve missing-data gaps; this proxy is not an exact
  precipitation-type boundary.
- Fine terrain detail does not create a finer atmospheric forecast. The point
  precipitation feed can differ in coverage from Windy's native weather layer.
- Phase rules and snow ratios need independent calibration. Low-detail and
  borderline point diagnoses use “possible”. Internal detail flags
  are not calibrated probabilities. Wider gaps may reduce coverage in this version.

See [method, equations and scientific limits](METHODS.md),
[release notes](RELEASE_1000_1_7.md) and [release history](docs/RELEASE_HISTORY.md).

## Development and publication

Node.js 24; `npm install`, `npm test`, `npm run build`. Built files are in `dist`.
The package and plugin configuration must contain the same three-part version.
GitHub runs unit, build and browser MP4 checks. This release passed 117 unit tests and live Windy desktop / Android mobile-emulation checks,
including normal clicks/taps, timeline changes, panning, point forecast and sounding views, layer cleanup and a complete MP4 download.
The downloaded H.264 file was decoded independently with FFmpeg; all 142 available hourly frames passed the black-frame check.
[Live checks and independent video decode](https://github.com/ramzik99/wintry-forecast/actions/runs/39436537745).
 Version 1000.1.7 was published from
tested source using the isolated `publish-wintry-forecast-1000.1.7` publishing branch.

[Repository](https://github.com/ramzik99/wintry-forecast) ·
[Published 1000.1.7](https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.1.7/plugin.min.js)

## Sources and licences

Weather data/API and map interface: Windy / ECMWF. Geographic background: Windy / Mapy.com / OpenStreetMap contributors.
Elevation data: Mapzen / Tilezen Terrain
Tiles via AWS; [terrain source attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
Point elevations use Windy's elevation service. Map data credits remain on the
Windy map and exported video. MP4 encoding uses
[Mediabunny](https://mediabunny.dev/) (MPL-2.0). Plugin licence: MIT.
