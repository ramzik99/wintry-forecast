# Wintry Forecast 1000.1.5

Precipitation shading now uses flat legend colours, without artificial terrain lighting, diagonal dry-terrain hatching or additional geographic images masked inside wet areas. Shading samples use a globally aligned 128-by-128 tile grid with categorical colour resampling, so neighbouring tiles share the same sampling lattice.

Weather and terrain inputs are completed before replacing the displayed shading frame. Incomplete terrain coverage uses a consistent coarse estimate across the view instead of a tile-by-tile mix of detailed and coarse terrain. Missing weather remains blank. Terrain still informs precipitation type; these changes simplify presentation rather than establish new forecast skill.

Icons remain optional and are off by default for new preferences. Existing saved preferences are honoured. One-click MP4 export, progress, cancellation, repeat download, contours and point forecasts remain available.

Validation: 113 unit tests, successful plugin build, Chromium checks for exact palette colours, adjacent-tile joins and missing-data gaps, and a valid 145-frame H.264 MP4 with bounded frame retention and cancellation. Tested source: 5e8b4fb288b7d0cd5ffaab8ba455e8b7f9b132c6.
