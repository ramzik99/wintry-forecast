<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { register, release, singleclick } from '@windy/singleclick';
  import Plugin from './plugin.svelte';
  import config from './pluginConfig';

  let plugin: any = null;

  function normaliseLatLon(value: any): { lat: number; lon: number } | null {
    if (!value) return null;
    const lat = Number(value.lat ?? value.latitude ?? value.latlng?.lat);
    const lon = Number(value.lon ?? value.lng ?? value.longitude ?? value.latlng?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  function selectLocation(value: unknown) {
    const position = normaliseLatLon(value);
    if (!position) return;
    plugin?.selectMapPoint?.(position.lat, position.lon);
  }

  export const onopen = (params: unknown) => {
    selectLocation(params);
  };

  onMount(() => {
    singleclick.on(config.name, selectLocation as any);
    register(config.name, 'high');
  });

  onDestroy(() => {
    singleclick.off(config.name, selectLocation as any);
    release(config.name, 'high');
  });
</script>

<Plugin bind:this={plugin} />

