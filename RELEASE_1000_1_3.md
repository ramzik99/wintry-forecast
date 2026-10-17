# Wintry Forecast 1000.1.3 — terrain-masked interpolation and activation layer

The map interpolation no longer discards an entire pressure level because one
neighbouring mountain column masks that level below model ground. It combines
the available above-ground contributors at each pressure with renormalized
weights, retaining warm valley air. Partial support is explicitly a limited-detail
estimate. Entire missing columns and missing precipitation remain unavailable.

Opening or enabling Wintry Forecast selects Windy's Precipitation type layer.
Changing the background afterward remains possible. The classifier thresholds,
six colours, point precipitation amounts and quantitative guardrails are unchanged.

Validation includes a regression case in which a cold high-terrain corner must
not turn a warm rainy valley cell into snow, plus live-data Windy developer-mode
checks in the Himalayas. This verifies the integration and fixes the identified
map artefact; it is not independent meteorological forecast-skill validation.
