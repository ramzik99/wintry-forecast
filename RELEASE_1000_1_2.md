# Wintry Forecast 1000.1.2 — six precipitation types

Removes the separate Type unresolved category, slate shading, question-mark
symbols, compact-panel key and legend entries from the map, forecast, PNG and
MP4 outputs. Rain, snow, wet snow, mix, ice pellets and freezing rain retain their
existing colours. Limited-detail diagnoses show their estimated physical type;
point, forecast and sounding labels qualify those estimates with “possible”.

Insufficient profiles still cannot produce an invented physical type. Low-detail
wet intervals continue to block snowfall totals, precise event timing and
no-wintry-weather claims. Independent liquid totals, snowline guards, compact
controls and existing export features remain.

Verification: 106 automated tests and the production build pass; the TypeScript
source check passes with skipLibCheck. Browser preview verification is recorded
with the review artifact. Forecast-skill validation remains outstanding.
