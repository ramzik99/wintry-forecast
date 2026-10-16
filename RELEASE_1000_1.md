# Wintry forecast 1000.1.0

Consolidated release of the compact map controls, terrain-aware precipitation
diagnosis, consistent snowfall accounting and prepared-map MP4 export.

- Preserves independent contours, shading and icons, the Windy type colours,
  visible place search, saved locations, forecast/sounding views and image export.
- Separates gross snowfall from the experimental remaining new-snow layer.
  Settling preserves snow water; dry warm hours can melt that layer.
- Uses the same supported forecast intervals for liquid totals, snowfall and
  events. Unknown periods remain unknown; partial days are not called 24 hours.
- Positive traces are wet across views; invalid negative amounts stay missing.
- Masks pressure levels below model terrain when that metadata is available.
- Adds point-only experimental upslope/down-slope guidance without modifying
  ECMWF rainfall amounts or adding uplift work to raster pixels.
- Keeps forecast and sounding windows visible after screen resizing.
- Preserves prepared-map MP4 export with cancellation, timestamps and legend.
  Forecast preparation now remains available without a supported video encoder.
- Video timestamps include shorter source-coverage boundaries between hours.
- Local map storage fails with a clear error after ten seconds rather than
  leaving preparation waiting indefinitely. Completed frames remain readable.
- Shows missing-coverage notes even when there is no detected wintry event.

The remaining-layer model and terrain-flow guidance are experimental. Existing
snow cover, radiation, drifting and a full ground energy budget are not modelled.
No independent forecast-skill improvement is claimed. Details: [METHODS.md](METHODS.md).

Publishing uses the repository's existing manual `publish-plugin` workflow after
the version, tests and production build are verified.
