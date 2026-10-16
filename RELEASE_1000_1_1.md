# Wintry Forecast 1000.1.1 — candidate

Precipitation can be forecast while its local type remains unresolved. This
release makes that distinction visible instead of drawing a specific type from
sparse vertical profiles.

- Public map shading, icons, point labels, forecast and sounding use the same
  abstention policy. Slate / question mark means wet, type unresolved.
- Unknown wet types cannot become zero snowfall or a no-wintry-weather outlook.
  Known ECMWF liquid totals remain available independently.
- Gross snow estimates use coarse display rounding and retain their heuristic
  caveat. Remaining ground snow and wind–terrain exposure are removed from the UI;
  their research functions remain in source. Extra exposure DEM requests are removed.
- Numeric thermal snowline displays omit cold-column extrapolations and crossings
  with insufficient vertical spacing. Missing-data contour gaps are preserved.
- Events do not bridge unresolved wet intervals. Borderline type labels say “possible”.
- Search, saved locations, units, layer controls, compact layout, point forecasts,
  sounding/image export and prepared-map MP4 remain. The video legend includes
  unresolved type; raster cache keys include the plugin version.

These changes make the presentation of uncertainty more conservative. They do
not establish forecast accuracy or calibrated high-confidence guidance. Local
station/snow observations and held-out event comparisons remain necessary.
