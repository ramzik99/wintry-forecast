# Precipitation type

A simple Windy plugin that estimates precipitation type from melting and refreezing in the ECMWF wet-bulb profile at ground elevation.

- Six types: snow, wet snow, rain/snow mix, rain, ice pellets and freezing rain.
- Terrain remains visible in full-opacity precipitation shading; Windy's layers remain underneath.
- Click a point for its type and selected time. Windy's timeline controls forecast time.
- On/off, search, refresh, information and MP4 download. No snowline contours, sounding, snowfall totals or event outlook.
- Blank areas can be dry or unavailable. Missing profiles are never converted to a made-up type.

The classifier integrates positive wet-bulb temperature through warm layers and negative temperature below them to estimate melting and refreezing. This is a model estimate, not an observed precipitation report.

## Validation

Run `npm test`, `npm run build`, `node test/map-export-browser.mjs` and `node test/windy-live.mjs`. The live test opens Windy in Chromium, checks desktop/mobile controls, terrain shading, timeline changes, point labels, teardown and a complete MP4 export. CI independently decodes the video with FFmpeg.

`test/webcam-profiles.mjs` compares model profiles with four timestamped NPS webcam frames from 20 October 2026. These cameras show dry conditions; existing ground snow is not counted as falling snow. They test occurrence only and do not validate freezing rain, ice pellets or snowfall. Results are stored with the CI artifacts.

Package identity remains `windy-plugin-snowline-map-100m` so existing installations can update.
