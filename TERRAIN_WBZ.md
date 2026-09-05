# WBZ above local map terrain

The WBZ calculation uses Windy's elevation lookup at each requested coordinate,
in metres above sea level. It excludes pressure-level heights below that local
map elevation before finding the first warm-to-cold wet-bulb zero crossing.
This applies to contour sample points as well as selected locations, forecast
charts, event minima and sounding WBZ markers. Elevation requests are cached.

A cold lowest retained level is not an exact WBZ height. Such a profile returns
an unresolved result, with the lowest retained height as a bound. Missing terrain,
insufficient levels and absence of a crossing also return no numeric WBZ. Forecast
lines break at these times; no terrain-crossing time is inferred across a gap.
Event minima use only resolved values and can therefore miss the actual minimum.

This is a **local map-terrain cutoff**, not a model-surface-pressure mask.
It does not downscale ECMWF temperature or humidity, correct model orography,
or establish conditions in an unresolved near-surface layer. Map elevation is
itself a gridded estimate. In a valley below model terrain, a level above map
terrain might still be below the model surface. Precipitation-type and estimated
snow-amount calculations retain their existing methods. WBZ is a thermal proxy,
not an exact observed snowfall limit.

Validation: `npm test`, then `npm run build` (Linux) or run Rollup with
`SERVE=false` (Windows). Before release, inspect a lowland, mountain and
below-sea-level location inside Windy, including a cold unresolved profile,
terrain-lookup failure, timeline changes, contours and the sounding panel.
