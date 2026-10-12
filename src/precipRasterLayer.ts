let sequence=0;
/** Put precipitation above weather, below Windy's geographic base map. */
export function precipRasterLayer(L:any,url:string,nw:{lat:number;lon:number},se:{lat:number;lon:number},baseMapBucket:number,pane:string){
  const id=`wintry-precip-${Date.now()}-${++sequence}`,layer=new L.Layer();
  let gl:any=null,fallback:any=null;
  layer.onAdd=function(host:any){
    gl=host.maplibreMap;
    if(gl?.addLayerToBucket){
      try{
        gl.addSource(id,{type:'image',url,coordinates:[[nw.lon,nw.lat],[se.lon,nw.lat],[se.lon,se.lat],[nw.lon,se.lat]]});
        const spec={id,type:'raster',source:id,paint:{'raster-opacity':1,'raster-fade-duration':0,'raster-resampling':'nearest'}};
        if(host.addMapLibreOrderedLayerToBucket)host.addMapLibreOrderedLayerToBucket(spec,baseMapBucket-1);else gl.addLayerToBucket(spec,baseMapBucket-1);
        return;
      }catch(error){if(gl.getLayer(id))gl.removeLayer(id);if(gl.getSource(id))gl.removeSource(id);gl=null;console.warn('Wintry geographic layer ordering unavailable',error);}
    }
    fallback=L.imageOverlay(url,[[se.lat,nw.lon],[nw.lat,se.lon]],{pane,interactive:false,opacity:1,className:'wintry-raster-tile'}).addTo(host);
  };
  layer.onRemove=function(host:any){
    if(gl){if(gl.getLayer(id)){if(host.removeMapLibreOrderedLayer)host.removeMapLibreOrderedLayer(id);else gl.removeLayer(id);}if(gl.getSource(id))gl.removeSource(id);gl=null;}
    if(fallback){host.removeLayer(fallback);fallback=null;}
  };
  return layer;
}
