# Wintry forecast

A Windy plugin for **snowline and precipitation type at local terrain**, with a point forecast and sounding.

## Install and use

1. Sign in to [Windy](https://www.windy.com/), then choose **Menu → Extend your Windy → Install Windy Plugin**.
2. Paste the [1000.1.28 plugin URL](https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.1.28/plugin.min.js) into Windy’s plugin URL field.
3. Search for a place or click the map.
4. Choose a time on Windy’s timeline. Read the type at that point, then use **Forecast** for timing or **Sounding** for the vertical profile.

Hover or touch the forecast graph to inspect it; tap to select that time on Windy’s timeline. The sounding supports hover/touch values, zoom and Fit. Settings contain colours and metric/imperial units. The controller stays compact; mobile controls sit in Windy’s bottom plugin panel. Hiding the controller keeps overlays active; switching Off removes them.

## What to read

- **Precipitation colours:** rain, snow, wet snow, rain/snow mix, ice pellets or freezing rain, diagnosed from melting and refreezing above actual local terrain. Shading is fully opaque and includes elevation relief. Windy’s native labels, borders and controls remain visible.
- **Snowline contours:** estimated wet-bulb-zero height, for comparison with terrain. The snowline alone does not determine precipitation type or snow cover. Elevated warm layers can produce freezing rain or ice pellets below it.
- **Point forecast:** snowline, interval-average precipitation rate, type and next-24-hour liquid total when coverage is complete.
- **Sounding:** temperature, dew point and wet bulb, stopping at an interpolated actual-terrain boundary. The count distinguishes all supplied pressure levels from those above terrain.
- **Diagonal hatching:** dry terrain above the estimated snowline; it is not a forecast of falling or accumulated snow.

The plugin selects Windy’s precipitation-type layer on opening to use its forecast timeline. While **Shading** is active, Windy’s weather colours are covered. Turn off **Shading** to see the selected Windy weather layer. **Plugin calculations use ECMWF**, regardless of the model selected for Windy’s underlying layer. Both map and point requests use the same one-hour sampling setting; available source intervals can be longer. The horizon is the available **144 hours**. Valid times use your device timezone; ECMWF cycle labels use UTC.

## Save and share

Use **Save image** in the forecast or sounding.

## Interpretation and validation

Precipitation type and snowline are forecasts, not observations. Fine terrain detail does not add atmospheric information beyond ECMWF. All complete supplied pressure levels from 1000 hPa upward are retained (currently 14 levels through 150 hPa), including source extrapolations below model terrain. Melting/refreezing and sounding curves stop at actual terrain.

Dry and missing-data areas show neutral terrain. Inspect the point forecast to distinguish dry conditions from missing data. No snowfall-depth or ground-snow prediction is provided.

Automated tests cover calculations, time coverage, missing data, raster opacity, terrain composition and desktop/mobile use. They do **not** establish forecast skill. The phase thresholds remain uncalibrated; see [METHODS.md](METHODS.md). Observed precipitation-type validation is still outstanding.

Current release: **1000.1.28**.
