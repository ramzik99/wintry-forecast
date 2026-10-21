# Wintry forecast

The plugin's core features are snowline contours, precipitation-type shading, point forecasts and soundings. It uses ECMWF atmospheric profiles and local terrain, and follows Windy's timeline.

The forecast chart shows snowline, precipitation amount/rate and precipitation type. The sounding shows temperature, dew point and wet bulb. Search, saved places, units, image export and map MP4 export remain available.

Snowfall-centimetre estimates, remaining snow-layer depths, event predictions and experimental terrain-flow diagnostics are removed from the interface and image exports. No ground snow-depth prediction is provided. Snowline and precipitation type remain model-based forecasts, not observations.

Version 1000.1.20 retains all complete supplied pressure levels from 1000 hPa upward, including those below model terrain. The sounding displays the pressure-level count and range (currently 14 supplied levels, 1000–150 hPa). Precipitation shading remains tied to forecast wet areas. Point forecasts, soundings, terrain relief and automatic Windy precipitation-type selection remain available.


Actual-terrain masking: source profiles retain all complete supplied pressure levels from 1000 hPa upward. Sounding curves and precipitation-type melting/refreezing stop at actual local terrain, with an interpolated terrain boundary. Model orography does not remove source levels. The atmospheric snowline diagnostic remains available for comparison with terrain.
