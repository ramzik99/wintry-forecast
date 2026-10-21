# Wintry forecast for Windy

**Restored 1000.1.0 · update 1000.1.14** — terrain-aware winter-weather guidance from sampled ECMWF
profiles and local terrain. The release combines the existing map and MP4 features
with consistent precipitation/snowfall accounting and bounded storage waits.

## Use

Enable the plugin, search for a place or select a point on the map. The point card
shows the diagnosed precipitation type, terrain, estimated snowline and average
precipitation. **Forecast** opens the timeline; **Sounding** keeps the atmospheric
profile available without crowding the map controls.

- **Contours:** estimated snowline and dry-terrain hatching.
- **Shading:** one fixed Windy colour per diagnosed precipitation type.
- **Icons:** precipitation symbols and ECMWF forecast lightning.
- Shading and icons become available from zoom level 8; contours are independent.
- Search, saved locations, metric/imperial units and image export are retained.
- Controls remain compact on desktop and mobile; forecast windows stay on screen
  after resizing. The plugin works over Windy's available background layers.

## Prepare map forecast and MP4

**Prepare & download MP4** prepares the current map area through available times,
up to 144 hours, then encodes a video in browsers with H.264 support. If the encoder
is unavailable, map preparation still completes for faster timeline playback.

The video includes a geographic background, precipitation shading, enabled type
icons and snowline contours, timestamps and a colour legend. It excludes Windy's
weather layer, forecast lightning and dry-terrain hatching. Five forecast hours
correspond to one video second. The longest video dimension is bounded at 1280 px.
Encoding happens in the browser without uploading the frames.

Progress, cancellation and a repeat-download link are available. Moving/zooming,
new data or changing relevant settings invalidates the prepared area. Preparation
can take several minutes; normal map viewing does not require it. Missing forecast
periods stay blank. Local storage failures and timeouts leave the normal timeline
usable. Windy's background and forecast lightning manage their loads separately.

## Quantities and interpretation

- Precipitation is the **average rate over the source interval**, not instantaneous
  intensity. Next-24-hour liquid totals require complete supported coverage.
- **Snowfall total** is estimated gross fresh snowfall. It does not decrease when
  later melt occurs and does not represent total snow already on the ground.
- **Remaining layer** is a separate experimental estimate of forecast-created snow
  after settling/melt. Missing thermal data can make this estimate unavailable.
- **Terrain flow** is experimental upslope/down-slope exposure from above-terrain
  winds and broad terrain slopes. It does not increase or reduce ECMWF rainfall.
- Fine terrain detail does not create a finer atmospheric forecast. The point
  precipitation feed can differ in coverage from Windy's native weather layer.
- Phase rules, snow ratios and remaining-layer coefficients need independent
  calibration. Input-detail labels are not calibrated probabilities.

See [method, equations and scientific limits](METHODS.md),
[release notes](RELEASE_1000_1.md) and [release history](docs/RELEASE_HISTORY.md).

## Development and publication

Node.js 24; `npm install`, `npm test`, `npm run build`. Built files are in `dist`.
The package and plugin configuration must contain the same three-part version.
GitHub runs tests/build checks; publication uses the existing manual
`publish-plugin` workflow. Version 1000.1.0 is the full version of “1000.1”.

[Repository](https://github.com/ramzik99/wintry-forecast) ·
[Previously published 1000.0.13](https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.0.13/plugin.min.js)

## Sources and licences

Weather data/API and map interface: Windy / ECMWF. Terrain shading: Mapzen Terrain
Tiles via AWS; [terrain source attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
Point elevations use Windy's elevation service. Map data credits remain on the
Windy map and exported video. MP4 encoding uses
[Mediabunny](https://mediabunny.dev/) (MPL-2.0). Plugin licence: MIT.


This update restores the 1000.1.0 source and interface. The only product changes are removal of limited-detail/unresolved wording and the version number required to distribute the restoration. Missing numerical values remain blank (—).
