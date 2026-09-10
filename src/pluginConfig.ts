import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
  name: 'windy-plugin-snowline-map-100m',
  version: '301.0.2',
  icon: '❄️',
  title: 'Wintry forecast',
  description: 'Concise terrain-aware winter forecast: type, terrain, snowline, precipitation, estimated new snow and timing first; a clean forecast timeline and optional hover/touch sounding.',
  author: 'Ramzi Kandah',
  repository: 'https://github.com/ramzik99/wintry-forecast',
  desktopUI: 'embedded',
  mobileUI: 'small',
  addToContextmenu: true,
  listenToSingleclick: true,
};

export default config;
