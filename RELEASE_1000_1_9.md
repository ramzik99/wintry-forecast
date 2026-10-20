# 1000.1.9

Precipitation shading uses 100% layer opacity. Label-free hillshade calculated from the loaded elevation data retains terrain relief within the opaque type colours. A northwest light source at 45 degrees and bounded ambient light shade actual slopes. Phase hues are retained; relief brightness is not precipitation intensity. Smooth wet/dry edges and transparent dry/missing areas remain.

The live map and MP4 reuse the same opaque shaded tiles. Elevation relief is cached with a bounded 32-tile cache and requires no additional map requests. No extra geographic labels or opaque background layer are added to the live map. Incomplete elevation coverage retains the existing coarse-data behavior. Opening/enabling selects Windy's Precipitation type layer. Contours, markers and the interface remain above the shading.

Validation: 119 unit tests; build; live Windy full-opacity/relief and dry-gap checks at zoom 9 and 12; desktop/mobile controls; complete MP4 download and independent H.264 decoding.

[Checks](https://github.com/ramzik99/wintry-forecast/actions/runs/39444765575)
