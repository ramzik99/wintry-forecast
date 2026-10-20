export const PRECIP_RASTER_OPACITY=1;

/** Geographic pane below contours and interface. */
export function precipitationPane(map:any,name:string){
  const pane=map.getPane(name)||map.createPane(name);
  pane.style.zIndex='390';pane.style.pointerEvents='none';
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

/** Bake geographic luminance into full-opacity phase colours; preserve dry/missing alpha. */
export function colourTerrainTile(phase:HTMLCanvasElement,terrain:CanvasImageSource){
  const result=document.createElement('canvas');result.width=phase.width;result.height=phase.height;
  const ctx=result.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.drawImage(terrain,0,0,result.width,result.height);
  ctx.globalCompositeOperation='color';ctx.drawImage(phase,0,0);
  ctx.globalCompositeOperation='destination-in';ctx.drawImage(phase,0,0);
  ctx.globalCompositeOperation='source-over';return result;
}
