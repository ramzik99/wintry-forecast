# Candidate verification — 16 October 2026

Base: `d76aeab`, including merged MP4 PR #34. Candidate: 1000.0.14.
Not merged into main or published by this change.

- Node test suite: **91 passed**, including five existing MP4 tests and eleven
  new reliability tests. Synthetic checks cover water conservation, cold settling,
  dry warm melt, hourly/three-hourly integration, fractional windows, missing
  precipitation/profiles, source support boundaries, positive traces, model-ground
  masking and wind reversal/above-terrain level selection.
- TypeScript source check: passes with `--skipLibCheck`. The unfiltered project
  check encounters pre-existing Windy declaration and DOM/worker library conflicts.
- Production Rollup build: succeeds. Mediabunny emits top-level `this` rewrite
  warnings from dependency modules; the generated unminified dependency bundle
  also contains trailing whitespace. Application source whitespace check passes
  with CRLF recognised as an end-of-line convention.
- Chrome local UI fixture: forecast and sounding views load. At 390 × 844 px,
  the chart remains on screen; resizing from desktop also keeps it visible.
  Missing-data mode shows unavailable day totals, a truncated snowfall curve,
  and an uncertain event amount rather than a complete storm total.
- Chrome real encoder smoke test: the preserved exporter encoded three synthetic
  canvas frames into a 3,368-byte MP4 that loaded with a 1.0-second duration.
  This tests the encoder, not a live Windy map capture or a full six-day export.
- `src/mapForecastVideo.ts` and its existing test file are identical to main at
  `d76aeab`. The MP4 controls/progress/cancellation/download link are retained.
- Terrain-flow work runs only when inspecting a point forecast. It reuses weather
  data and bounded DEM loading; no uplift work is added to every raster pixel.

These are implementation and synthetic UI checks. No observed-weather skill,
ground snow-depth accuracy, global loading-time guarantee or live Windy/mobile-app
end-to-end performance claim has been established. See [METHODS.md](METHODS.md).
