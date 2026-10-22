# Method and interpretation

## Scope

Wintry forecast diagnoses precipitation type at actual local terrain and displays an atmospheric snowline estimate. It provides a point forecast, sounding, and forecast/sounding image exports. It does not predict snowfall depth or existing ground snow. Earlier experimental snow-layer and terrain-flow outputs are absent from the product.

## Data and time

Calculations use sampled ECMWF profiles and liquid precipitation through the available 144-hour horizon. Map and point profile requests both use a one-hour sampling setting; the source may supply longer intervals. Source-run checks reject older/mismatched data. Forecast gaps stay missing, and a complete 24-hour total requires continuous known coverage.

Internally, precipitation amounts are three-hour-equivalent liquid millimetres. For an overlap of dt hours, liquid input is P3 × dt / 3; rate displays divide P3 by three. Positive traces are wet. Zero is dry; missing or invalid values are not dry.

## Atmospheric profile and terrain

All complete supplied pressure levels at or above 1000 hPa in altitude are retained: currently 1000, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200 and 150 hPa. Each usable level requires temperature, dew point and geopotential height. The surface entry is separate. Missing fields are not fabricated.

No source-model-orography mask is applied. Values below model terrain may be source extrapolations. The classifier and sounding clip the resulting profile at actual local terrain, interpolating its boundary. Precipitation cannot melt or refreeze in layers below that boundary. If actual terrain is below the lowest supplied level, its endpoint thermodynamic values are held down to terrain and flagged internally as extrapolated.

Map terrain comes from Mapzen Terrain Tiles, served by the public AWS dataset. Point terrain comes from Windy’s elevation service. Interpolated weather samples and differing terrain sources can cause small map/point differences. A whole-frame coarse-terrain fallback avoids mixing partial DEM patches with fine terrain.

## Wet bulb and snowline

Pressure-aware wet bulb is solved numerically from temperature, dew point and pressure using the ventilated psychrometer relation.

The displayed snowline is the lowest resolved positive-to-nonpositive wet-bulb crossing with increasing height, including an elevated melting layer above a cold surface. It is a wet-bulb-zero diagnostic, not a verified prediction of the lowest falling-snow or accumulation height.

An entirely nonpositive column has no resolved crossing. The existing bounded downward extrapolation supplies a continuous mapping diagnostic. The assumed gradient is constrained to −12 to −1 °C/km (default −6 °C/km), with at most 4000 m of downward extrapolation. The contour display floor is −500 m; raw diagnostic values remain separate.

## Precipitation type

The classifier integrates positive wet-bulb area for melting and negative area beneath the lowest warm node for refreezing, in °C·m, down to actual terrain. All available heights above terrain are considered.

Existing heuristic thresholds are 150, 500 and 1100 °C·m for melting and 800 °C·m for refreezing; the warm-node threshold is 0.2°C. Surface wet bulb also distinguishes snow, wet snow, mix and rain. These thresholds are unchanged in this release and are not a verified implementation of the published Bourgouin energy algorithm.

Internal high/medium/low flags describe source gaps, extrapolation and proximity to thresholds. They are not calibrated probabilities. Low-confidence labels use “possible”; no numerical certainty is claimed.

Layer-based diagnosis is motivated by [Bourgouin (2000)](https://journals.ametsoc.org/view/journals/wefo/15/5/1520-0434_2000_015_0583_amtdpt_2_0_co_2.xml).

## Rendering

Profiles and precipitation are interpolated before diagnosis; categorical type colours are not blended. Every wet, classified pixel has alpha 255. Dry, unknown or unclassifiable pixels are transparent. DEM illumination changes colour luminance while preserving alpha, so opaque colours override Windy’s weather colours while showing relief. This is elevation-derived relief, rather than visibility through an opaque layer.

Windy’s interface and labels remain above the overlay.

## Validation status

Unit and browser tests check implementation, data coverage and visible behavior. Synthetic rain, snow, melting/refreezing and terrain-boundary tests are physical sanity checks, not independent forecast-skill evidence.

No verified observational skill score or calibrated uncertainty is available. A defensible evaluation needs forecasts archived before their valid times, time-matched reports of falling precipitation, station elevations, and event/site holdouts. Assess rain, snow, mixed and freezing types separately across lead times, comparing against raw ECMWF/Windy. Webcams can support visible falling phase when time and location are established; snow already on a slope cannot verify present falling type or depth.

Do not tune thresholds on the same cases used to report validation skill.
