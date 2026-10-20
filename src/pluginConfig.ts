import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
  name: 'windy-plugin-snowline-map-100m',
  version: '1000.1.9',
  icon: '❄️',
  title: 'Wintry forecast',
  description: 'Terrain-aware precipitation-type guidance with six physical types, qualified limited-detail estimates, ECMWF precipitation, approximate snowfall, forecast/sounding views and prepared-map MP4 export.',
  author: 'Ramzi Kandah',
  repository: 'https://github.com/ramzik99/wintry-forecast',
  desktopUI: 'embedded',
  mobileUI: 'small',
  addToContextmenu: true,
  listenToSingleclick: true,
};

export default config;
