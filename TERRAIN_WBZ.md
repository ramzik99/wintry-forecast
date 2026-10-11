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
Hatching is restricted to samples with known zero precipitation. Wet samples,
including light positive amounts, and missing precipitation leave gaps. Cells
with any wet or unknown corner are excluded from hatching. Existing point
precipitation-type and snow-amount calculations remain separate.

Weather profiles use a nominal 9 km local grid (225-node budget, coarser overview).
Terrain shading refines beyond zoom 8 (512-cell budget), reusing source profiles
and precipitation amounts. Fine terrain changes phase, not rainfall resolution.
Each known wet sample uses the existing precipitation-type colour with light
(<0.5 mm/3h), moderate (>=0.5 and <3 mm/3h) or heavy (>=3 mm/3h) opacity.
The amounts are normalized three-hour equivalents. Sample tiles have discrete
type/intensity colours; shading does not invent values across missing samples.
Contours (including dry-terrain hatching), shading and ECMWF forecast lightning
have separate saved toggles. Lightning comes from raw thunder/lightdens tiles,
never terrain refinement or CAPE; symbols do not represent observed strikes.

The viewport grid cannot resolve every ridge or valley. Hatching is an approximate
sampled comparison, not a high-resolution terrain mask. A cold lowest profile level
returns a below-profile status and a bounded extrapolated diagnostic, not a resolved
crossing. Display contours clamp that value to −500 m; hatching retains the raw
terrain comparison. Missing point values remain unknown; contour interpolation
can bridge missing viewport samples.

Run npm test and the production build. A live Windy visual check remains necessary
before release, including map navigation, timeline changes, mountains and dry areas.
