# 1000.1.8

Opening, reopening and enabling Wintry forecast select Windy's Precipitation type layer. The plugin shading sits above it at 55% opacity, allowing the underlying Windy weather and terrain detail to remain visible. There is no extra opaque terrain overlay. Contours, markers and Windy's interface remain above the shading. A user can choose a different Windy layer while the plugin is open.

Smooth wet/dry edges, decoded complete-frame swaps, terrain-aware diagnosis, compact mobile/desktop controls and streaming MP4 downloads are retained. MP4 uses the same 55% shading opacity over its geographic background; Windy's weather layer and lightning remain excluded from video.

Validation: 117 unit tests, build, live desktop/mobile opening and enable behavior, visible alpha blending at zoom 9 and 12, controls, navigation, cleanup, complete MP4 download and independent H.264 decoding.

[Checks](https://github.com/ramzik99/wintry-forecast/actions/runs/39438707442)
