<div class="shade-types" aria-label="Precipitation type colours">
  {#each types as type}
    <span>{@html precipitationIconSvg(type.code)}{type.label}</span>
  {/each}
</div>
<script lang="ts">
  import { precipitationIconSvg } from './precipIcons';
  const types = [
    {code:'snow',label:'Snow'}, {code:'wet-snow',label:'Wet snow'},
    {code:'mix',label:'Mix'}, {code:'rain',label:'Rain'},
    {code:'ice-pellets',label:'Ice pellets'}, {code:'freezing-rain',label:'Freezing rain'},
    {code:'uncertain',label:'Type unresolved'},
  ] as const;
</script>
<style>
  .shade-types{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px;font-size:11px;margin-top:8px;color:#d7e3e9}
  span{display:flex;align-items:center;min-height:22px;line-height:1.2;gap:6px}
  span :global(svg){width:19px;height:19px;flex:none;filter:drop-shadow(0 0 .75px #ffffffc0)}
  :global(#device-mobile) .shade-types{grid-template-columns:repeat(3,minmax(0,1fr));font-size:10px}
  :global(#device-mobile) span :global(svg){width:15px;height:15px}
</style>
