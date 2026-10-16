# Release checks — 1000.1.0

16 October 2026. Consolidates the MP4 feature from main and the snowfall/reliability
work from PR #35. The earlier 1000.0.14 candidate was not published.

- **97 Node tests passed.** Six additional checks cover fractional video source
  boundaries and blocked, stalled, successful and quota-failed local storage.
  Existing water-budget, coverage, terrain, rendering and MP4 tests remain green.
- TypeScript application source passes with `--skipLibCheck`; pre-existing Windy
  declaration/DOM-worker library conflicts remain outside this source check.
- Production build succeeds; package and built configuration both use 1000.1.0.
  Mediabunny retains its existing top-level `this` rewrite warnings during bundling.
- Chrome encoded three simulated canvas frames into a loadable H.264 MP4
  (3,322 bytes, 1.0-second duration). This is an encoder smoke test, not a full
  six-day live-map export or a guarantee of support on every mobile browser.
- Forecast/sounding and missing-data behaviour retain the previously checked
  responsive layout. New source-coverage notes remain visible without an event.
- Video encoder availability is independent of map preparation. Storage open and
  transaction waits have a ten-second deadline; late opens close their connection.
- Quantitative ECMWF precipitation is not altered. Experimental retained-layer
  and terrain-flow estimates remain labelled; no observed-weather skill gain is
  established by software tests. See [METHODS.md](METHODS.md).

The exact release revision and remote build result are recorded in PR #35.
Publication must be confirmed by the manual publish workflow and the versioned
Windy plugin URL; a successful build alone does not establish publication.
