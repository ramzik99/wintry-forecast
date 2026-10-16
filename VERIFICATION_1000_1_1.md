# Verification — 1000.1.1 candidate

- 106 automated tests pass, including nine new guidance regression tests.
- Production Rollup build passes; existing Mediabunny top-level-this rewrite
  warnings remain benign and unchanged.
- TypeScript source check passes with `--skipLibCheck --incremental false`.
- Chrome local preview checks use simulated data, not observed meteorology:
  supported snow remains available; sparse profiles show unresolved type and
  unavailable snow amount while preserving a 24 mm liquid total; sounding remains
  usable with adequate data and clearly unavailable with insufficient data.
- At 390 × 844 the forecast window remains inside the viewport (left 6 px,
  right 384.4 px). Main Windy controls were not changed except a short uncertainty
  colour key. A live Windy integration check of this candidate is pending publication.
- Full 144-hour live MP4 export was not repeated. MP4 code is retained with the
  extra legend category; existing video tests pass. The prior release passed a
  short actual Chrome H.264 encoding check.

The tests establish implementation behaviour, not atmospheric forecast skill.
Guardrail thresholds and snow ratios are uncalibrated. Additional withheld types
and contour gaps are an intentional reduction in unsupported coverage.
