# 1000.1.7

The live map preserves the selected Windy weather layer beneath translucent Wintry precipitation shading. Opening and enabling the plugin no longer switch Windy to Precipitation type. The additional opaque geographic overlay has been removed; Windy's own weather and map stay visible. Contours, markers and the Windy interface remain above the shading.

Smooth wet/dry edges, decoded complete-frame swaps, terrain-aware diagnosis and mobile controls are retained. Elevation data still refines precipitation diagnosis; it does not add a visible terrain background. MP4 exports retain their geographic background and exclude Windy's weather layer and lightning.

Validation: 117 unit tests, build, actual Windy desktop/mobile layer preservation, temperature/rain selection, controls, shading pixels, navigation, cleanup and full MP4 download, followed by independent H.264 decoding.

[Checks](https://github.com/ramzik99/wintry-forecast/actions/runs/39436537745)
