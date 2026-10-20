# Precipitation type 1000.1.11 — verification

The controller and point card now show precipitation type and time. Snowline, atmospheric-detail messages, snowfall totals, sounding and event outlook have been removed. The phase comes directly from the wet-bulb profile: melting through warm air, refreezing below the warm layer and ground-level wet-bulb temperature. Missing data stays unavailable.

## Camera observations

Frames were downloaded and visually inspected on 20 October 2026. Camera timestamps, converted to UTC:

| Camera | Frame time (UTC) | Visible observation |
|---|---|---|
| Paradise Visitor Center | 17:59:02 | Clear sky, dry pavement; no visible falling precipitation |
| Longmire | 18:03:04 | Clear sky, dry road; no visible falling precipitation |
| Yellowstone West Entrance | 17:59:41 | Clear sky, dry road; no visible falling precipitation |
| Mount Washburn northeast | 18:00:24 | Clear sky, patches of ground snow; no visible falling precipitation |

Sources: [Mount Rainier cameras](https://www.nps.gov/mora/learn/photosmultimedia/webcams.htm), [Yellowstone cameras](https://www.nps.gov/yell/learn/photosmultimedia/webcams.htm), [Mount Rainier elevation information](https://www.nps.gov/mora/planyourvisit/weather.htm), [Mount Washburn elevation](https://www.nps.gov/places/000/mount-washburn.htm).

Coordinates, elevation inputs, forecast run, matching interval, precipitation and conditional melting/refreezing diagnosis are recorded by `test/webcam-profiles.mjs` in the CI artifact `webcam-profiles.json`. Yellowstone positions are approximate. The camera times are instantaneous, while forecast precipitation represents an interval; that limits precise occurrence comparisons.

These frames check dry conditions only. Ground snow is not evidence of falling snow. No claim of webcam validation for snow, rain/snow mix, ice pellets or freezing rain is made. Controlled profile tests cover the melting/refreezing branches; wet-weather observational verification remains outstanding.

## Result

All four matched ECMWF intervals had 0 mm precipitation (3-hour equivalent), so the plugin reports **Dry** at each location. These are four consistent dry-condition examples, not a precipitation-type skill score. The feed returned the 20 October 2026 00 UTC run; this comparison uses that returned run, not a claimed newer cycle.

## Software checks

All 122 tests passed. The real Windy browser test passed desktop and mobile controls, point labels, on/off, native layer switching, timeline changes, panning and cleanup. Exact palette, missing-data gaps, smooth wet/dry edges, terrain composition and visible opaque raster pixels passed at zooms 9 and 12. Synthetic MP4 cancellation passed. A full live mobile MP4 downloaded (2,251,877 bytes, 390 × 1040, 28.4 seconds) and was independently decoded with FFmpeg with no black-frame intervals detected.

[Full CI run](https://github.com/ramzik99/wintry-forecast/actions/runs/39472571133) includes screenshots, movie, video metadata and webcam profile results in its artifact.
