# Method and interpretation — 1000.1.0

## What the product estimates

The plugin post-processes sampled ECMWF thermodynamic profiles at local terrain
height. Fine terrain pixels add terrain detail; they do not create new atmospheric
observations or increase the native resolution of ECMWF. Rainfall amounts remain
the sampled ECMWF amounts. Independent forecast-skill validation remains required.

## Time and missing data

All internal precipitation values are **three-hour-equivalent liquid amounts**.
For an overlap of `dt` hours, liquid input is `P3 * dt / 3` mm. Rate displays divide
`P3` by three. Both precipitation totals and snowfall use the same supported time
intervals, clipped to the actual source coverage and the 144-hour horizon. A
24-hour request always represents 24 hours; an incomplete window is unavailable.
Missing/negative precipitation is not dry weather. Positive traces are wet in the
map, point forecast, sounding and event detection.

## Thermodynamics and precipitation type

The pressure-aware numerical wet-bulb calculation and phase thresholds are
unchanged. All complete supplied pressure levels from 1000 hPa upward are retained,
including levels below source-model terrain. Below-model-ground source values may
be extrapolated. The sounding counts all supplied pressure levels and shows how
many can be plotted when source values are incomplete. The surface entry is
separate and is not counted as a pressure level. Precipitation diagnosis follows
the retained column down to local site terrain; wet/dry shading still uses
forecast precipitation.

The classifier integrates positive and negative wet-bulb areas in **°C·m**.
The plugin's thresholds are heuristic, not a verified implementation of the
published Bourgouin energy algorithm. Its high/medium/low labels are input-detail
and threshold flags, **not calibrated probabilities**. Melting/refreezing layer
methods are motivated by [Bourgouin (2000)](https://journals.ametsoc.org/view/journals/wefo/15/5/1520-0434_2000_015_0583_amtdpt_2_0_co_2.xml).

## Snowfall versus the remaining new layer

Gross estimated snowfall is `P3 * dt / 3 * f_s * SLR / 10` cm, where `f_s` is the
snow fraction of liquid input (0–1), and `SLR` is fresh snow depth divided by liquid
water depth. The existing phase/temperature-dependent fractions and ratios remain
heuristic. Gross snowfall cannot decrease when snow melts later.

The separate **experimental remaining-layer estimate** starts with no existing
snow. Its state is SWE in mm and depth in cm. Density is `100 * SWE / depth`
kg/m³. Settling changes depth, not SWE. Melt reduces SWE and exports the same
amount of water. The budget is `SWE_end + melt = SWE_start + snowfall_SWE`.
Dry hours still use their thermal profile; if that profile is missing while snow
is present, remaining snow becomes unavailable rather than silently ignoring melt.

Provisional parameters, explicitly not calibrated: settling rates 0.003, 0.006
or 0.010 per hour by local wet-bulb temperature; melt proxy
`min(2, 0.25 * max(Tw, 0))` mm SWE/hour; maximum compacted density 450 kg/m³.
Quarter-hour integration steps align hourly and three-hourly constant forcing.
Radiation, ground heat, initial snow, liquid retention/refreezing and drifting are
absent. The coefficients and use of Tw require independent evaluation; numerical
water conservation is not evidence of accurate ground snow depth. Operational
energy/mass-balance models include substantially more processes:
[NOAA NOHRSC model description](https://www.nohrsc.noaa.gov/technology/).

## Terrain-flow diagnostic

At an inspected point, a lazy DEM request samples four points 2 km away in the
cardinal directions. Central differences give dimensionless broad terrain slopes
`dh/dx` and `dh/dy`. The wind level closest to 1 km above the actual terrain is
selected among available levels 0.2–2 km above terrain. Missing data, polar and
dateline edge cases leave this optional diagnostic unavailable.

`w_proxy = u * dh/dx + v * dh/dy` has units m/s. It describes kinematic wind
exposure, not actual model vertical velocity. A ±0.05 m/s display deadband marks
weak/cross-slope flow. Model-layer RH is shown for context; no precipitation
enhancement is inferred from RH or this display threshold.

This **does not multiply precipitation amounts**. A quantitative orographic
precipitation model also needs airflow, moisture transport, conversion/fallout
and evaporation assumptions; a local upslope multiplier can violate water
conservation. See [Smith & Barstad (2004)](https://journals.ametsoc.org/doi/abs/10.1175/1520-0469%282004%29061%3C1377%3AALTOOP%3E2.0.CO%3B2).
The diagnostic is not an implementation of their linear precipitation model.

## What still needs data and validation

Quantitative redistribution needs source grid-cell geometry, co-timed winds and
moisture/stability, a treatment of precipitation already resolved by ECMWF, and
tests of area-integrated water budgets. Local station precipitation and measured
snowfall/depth are needed to calibrate coefficients and compare skill against raw
ECMWF on withheld storms and sites. Webcams can support time-matched visible
conditions; snow already on a slope cannot verify current falling phase or depth.

Runtime and synthetic tests check accounting, coverage and implementation. They
cannot establish meteorological accuracy. No AI model has been trained here.
