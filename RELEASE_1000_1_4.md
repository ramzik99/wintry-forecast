# Wintry Forecast 1000.1.4

Large map animations previously stopped when their prepared raster frames exceeded a fixed 512 MiB local-storage budget. MP4 export now renders and encodes sequentially while retaining one source raster, without storing the entire animation in IndexedDB. Hourly captions and contours still update even when precipitation raster intervals are shared.

The control is now **Download MP4** with one progress bar, cancellation and automatic download. The repeat-download link reuses the completed video. Optional timeline caching stops accepting additional frames when full without failing preparation; storage problems do not block this fallback.

Validation: 110 unit tests and a successful plugin build. A Chromium browser test exported a valid 145-frame H.264 MP4, verified its file signature, confirmed one retained source raster and checked cancellation. Tested source: ffa3ffdcd8921a67edecc05dbab40dcaffa43940.
