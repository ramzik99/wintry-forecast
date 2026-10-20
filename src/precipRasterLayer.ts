export const PRECIP_RASTER_OPACITY=1;
export const PRECIP_RASTER_BLEND='color' as const;
/** Keep weather hues opaque while retaining the existing map's light and shade. */
export function precipitationPane(map:any,name:string){
  const pane=map.getPane(name)||map.createPane(name);
  pane.style.zIndex='390';pane.style.pointerEvents='none';pane.style.mixBlendMode=PRECIP_RASTER_BLEND;
  return pane;
}
export function terrainMapTemplate(tiles:Record<string,string>,kind:string){
  return tiles[kind]??tiles.sznmap??'https://tiles.windy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}/?lang=en';
}
/** Image overlays share Leaflet's geographic transform without mixing WebGL shader state. */
export function precipRasterLayer(L:any,url:string,nw:{lat:number;lon:number},se:{lat:number;lon:number},pane:string){
  const image=new Image();image.src=url;
  const layer=L.imageOverlay(image,[[se.lat,nw.lon],[nw.lat,se.lon]],{
    pane,interactive:false,opacity:PRECIP_RASTER_OPACITY,className:'wintry-raster-tile'
  });
  layer.ready=image.decode().then(()=>true,()=>false);
  return layer;
}
