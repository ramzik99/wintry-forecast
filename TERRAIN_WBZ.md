# Atmospheric snowline and map-terrain hatching

The atmospheric wet-bulb zero crossing remains available for comparison with
Windy's local map elevation, including when that elevation is above the crossing.
No local-terrain cutoff is applied to the atmospheric WBZ search. Crossings below
terrain are model-profile diagnostics, not observations of air inside a mountain.
This is not a model-surface mask or a downscaling of model meteorology.

Diagonal hatching marks positive terrain-minus-WBZ on the viewport sampling grid.
Each cell is split into triangles; the positive region is interpolated and clipped
before drawing diagonal strokes. Missing terrain or unresolved WBZ leaves a gap.
Hatching updates with the forecast time and viewport and is removed with contours.
It is not gated by precipitation: the legend explicitly says precipitation is
required. Existing precipitation-type and snow-amount calculations remain separate.

The viewport grid cannot resolve every ridge or valley. Hatching is an approximate
sampled comparison, not a high-resolution terrain mask. A cold lowest profile level
returns an unresolved WBZ with a bound, never a fabricated exact height. Such
profiles still allow precipitation-type display but do not generate numeric contours
or hatching. Temporal gaps remain disconnected.

Run npm test and the production build. A live Windy visual check remains necessary
before release, including map navigation, timeline changes, mountains and dry areas.
