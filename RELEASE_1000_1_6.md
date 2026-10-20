# Wintry forecast 1000.1.6

This release repairs the shading and geographic background seen in Windy.

- Replace the mixed WebGL raster path with geographic image overlays. Live screenshot comparisons reproduced black raster textures in Windy's WebGL path; checking that a layer existed did not catch the problem.
- Fade wet/dry spatial support instead of painting every tiny positive contribution at full opacity. This removes artificial rectangular borders while retaining each phase hue. Entirely dry or unknown samples remain transparent.
- Keep precipitation visible at close zoom. Draw translucent categorical colours over a continuous selected geographic map, below contours, markers and interface controls.
- Load complete geographic background tiles independently of precipitation masks. Decode complete shading frames before swapping them, and discard stale swaps after navigation or settings changes.
- Sample elevation at the shading raster's detail, up to DEM zoom 14. Adapt large viewports to the 64-tile, 16 MiB elevation cache and verify coverage is still retained before using it.
- Avoid an accidental extra raster zoom caused by floating-point map bounds.
- Match MP4 background selection, categorical resampling and shading opacity to the live map.
- Keep the existing six precipitation types, missing-data handling, point forecasts, sounding and compact controller.

## Verification

- 117 unit tests passed, including the wet/dry edge-opacity regression.
- Live Windy checks passed at zoom 9 and 12, including measured screenshot colour checks. The actual wet fixture contained 474,764 partially covered edge pixels.
- Normal desktop clicks and Android mobile-emulation taps passed inside Windy's external-plugin host. Layer toggles, settings, hide/show, point forecast, sounding, timeline changes, panning and resource cleanup passed.
- The actual six-day export downloaded successfully. Independent FFmpeg decoding verified H.264, 390 × 1040 pixels, 142 available hourly frames and 28.4 seconds, with no black segments.
- Synthetic export checks also verified 145 frames with one held raster and cancellation.
- The final release build verifies package/configuration/bundle versions before publication.

[Live tests](https://github.com/ramzik99/wintry-forecast/actions/runs/39433580152) · [Independent decode](https://github.com/ramzik99/wintry-forecast/actions/runs/39434571044)

Runtime source was tested at `2f6fce4c7652d5803dea7cf75983aacbd19cdef3`. The release source `6923fd42bab4f9572715d8a3f86d8d2ff2bbcced` adds help-text corrections and the independent-decoding test workflow; its runtime behaviour is unchanged.

Install/update URL: https://windy-plugins.com/458307/windy-plugin-snowline-map-100m/1000.1.6/plugin.min.js

The browser checks use live Windy with real ECMWF data and real map tiles. Desktop and Android mobile emulation are exercised in Chromium; this is not physical-device Safari/iOS testing. Rendering checks do not establish forecast skill or independently validate the precipitation-type diagnosis.
