let sequence=0;
export const PRECIP_RASTER_OPACITY=.68;
export function terrainMapTemplate(tiles:Record<string,string>,kind:string){
  return tiles[kind]??tiles.sznmap??'https://tiles.windy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}/?lang=en';
}
/** One continuous geographic background; never clipped to changing precipitation masks. */
export function terrainBackgroundLayer(L:any,url:string,baseMapBucket:number,pane:string){
  const id=`wintry-background-${++sequence}`,layer=new L.Layer();let gl:any=null,fallback:any=null;
  layer.onAdd=function(host:any){
    gl=host.maplibreMap;
    if(gl&&typeof host.addMapLibreOrderedLayerToBucket==='function'){
      try{
        gl.addSource(id,{type:'raster',tiles:[url],tileSize:256,maxzoom:16});
        host.addMapLibreOrderedLayerToBucket({id,type:'raster',source:id,paint:{'raster-opacity':1,'raster-fade-duration':0}},baseMapBucket-1);return;
      }catch(error){if(gl.getLayer(id))host.removeMapLibreOrderedLayer(id);if(gl.getSource(id))gl.removeSource(id);gl=null;console.warn('Wintry terrain background unavailable',error);}
    }
    fallback=L.tileLayer(url,{pane,interactive:false,opacity:1,maxZoom:22,maxNativeZoom:16}).addTo(host);
  };
  layer.onRemove=function(host:any){
    if(gl){if(gl.getLayer(id))host.removeMapLibreOrderedLayer(id);if(gl.getSource(id))gl.removeSource(id);gl=null;}
    if(fallback){host.removeLayer(fallback);fallback=null;}
  };
  return layer;
}
/** Above geographic imagery at every zoom; translucency keeps terrain readable. */
export function precipRasterLayer(L:any,url:string,nw:{lat:number;lon:number},se:{lat:number;lon:number},baseMapBucket:number,pane:string,onNativeMap?:(gl:any)=>void){
  const id=`wintry-precip-${Date.now()}-${++sequence}`,layer=new L.Layer();
  let gl:any=null,fallback:any=null;
  layer.onAdd=function(host:any){
    gl=host.maplibreMap;
    if(gl&&(typeof host.addMapLibreOrderedLayerToBucket==='function'||typeof gl.addLayerToBucket==='function')){
      try{
        onNativeMap?.(gl);
        gl.addSource(id,{type:'image',url,coordinates:[[nw.lon,nw.lat],[se.lon,nw.lat],[se.lon,se.lat],[nw.lon,se.lat]]});
        const spec={id,type:'raster',source:id,paint:{'raster-opacity':PRECIP_RASTER_OPACITY,'raster-fade-duration':0,'raster-resampling':'nearest'}};
        if(host.addMapLibreOrderedLayerToBucket)host.addMapLibreOrderedLayerToBucket(spec,baseMapBucket+2);else gl.addLayerToBucket(spec,baseMapBucket+2);
        return;
      }catch(error){
        if(gl.getLayer(id)){if(host.removeMapLibreOrderedLayer)host.removeMapLibreOrderedLayer(id);else gl.removeLayer(id);}
        if(gl.getSource(id))gl.removeSource(id);
        gl=null;
        console.warn('Wintry geographic layer ordering unavailable',error);
      }
    }
    fallback=L.imageOverlay(url,[[se.lat,nw.lon],[nw.lat,se.lon]],{pane,interactive:false,opacity:PRECIP_RASTER_OPACITY,className:'wintry-raster-tile'}).addTo(host);
  };
  layer.onRemove=function(host:any){
    if(gl){
      if(gl.getLayer(id)){if(host.removeMapLibreOrderedLayer)host.removeMapLibreOrderedLayer(id);else gl.removeLayer(id);}
      if(gl.getSource(id))gl.removeSource(id);
      gl=null;
    }
    if(fallback){host.removeLayer(fallback);fallback=null;}
  };
  return layer;
}
