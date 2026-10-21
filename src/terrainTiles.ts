import { tileLocation, tilePosition, visibleRasterTiles } from './shadingRaster';

export function decodeTerrarium(r:number,g:number,b:number){return r*256+g+b/256-32768;}
export function terrainTileZoom(mapZoom:number){return Math.max(0,Math.min(14,Math.floor(mapZoom)-2));}
type DemTile={pixels:Float32Array;width:number;height:number};
const URL='https://s3.amazonaws.com/elevation-tiles-prod/terrarium';

/** 16 MiB decoded LRU, four concurrent requests, ten-second timeout, shared pending tiles. */
export class TerrainTiles {
  private cache=new Map<string,DemTile>();
  private pending=new Map<string,Promise<boolean>>();
  private failed=new Map<string,number>();
  private controllers=new Set<AbortController>();
  private active=0;
  private waiting:(()=>void)[]=[];
  private alive=true;
  async ensure(bounds:{south:number;north:number;west:number;east:number},zoom:number,isCurrent:()=>boolean,progress:(completed:number,total:number)=>void){
    const z=terrainTileZoom(zoom),nw=tilePosition(bounds.north,bounds.west,z),se=tilePosition(bounds.south,bounds.east,z);
    const pad=1/256,a=tileLocation(nw.x-pad,nw.y-pad,z),b=tileLocation(se.x+pad,se.y+pad,z);
    const tiles=visibleRasterTiles({north:a.lat,south:b.lat,west:a.lon,east:b.lon},z);let next=0,completed=0;
    await Promise.all(Array.from({length:Math.min(4,tiles.length)},async()=>{while(this.alive&&isCurrent()){const tile=tiles[next++];if(!tile)return;await this.load(tile.x,tile.y,z);if(isCurrent())progress(++completed,tiles.length);}}));
  }
  private load(x:number,y:number,z:number):Promise<boolean>{
    const n=2**z;x=((x%n)+n)%n;const key=`${z}/${x}/${y}`;
    if(this.cache.has(key))return Promise.resolve(true);
    const existing=this.pending.get(key);if(existing)return existing;
    if(Date.now()-(this.failed.get(key)??0)<30_000)return Promise.resolve(false);
    const promise=(async()=>{
      while(this.active>=4&&this.alive)await new Promise<void>(resolve=>this.waiting.push(resolve));
      if(!this.alive)return false;this.active++;
      const abort=new AbortController();this.controllers.add(abort);const timer=setTimeout(()=>abort.abort(),10_000);
      try{
        const response=await fetch(`${URL}/${key}.png`,{signal:abort.signal,credentials:'omit'});if(!response.ok)throw new Error(`DEM ${response.status}`);
        const image=await createImageBitmap(await response.blob(),{colorSpaceConversion:'none',premultiplyAlpha:'none'});
        const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});
        if(!ctx){image.close();throw new Error('DEM canvas unavailable');}ctx.drawImage(image,0,0);image.close();
        if(canvas.width!==256||canvas.height!==256)throw new Error('Unexpected DEM dimensions');
        const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data,pixels=new Float32Array(canvas.width*canvas.height);
        for(let i=0;i<pixels.length;i++)pixels[i]=rgba[i*4+3]?decodeTerrarium(rgba[i*4],rgba[i*4+1],rgba[i*4+2]):NaN;
        if(!this.alive)return false;
        this.cache.set(key,{pixels,width:canvas.width,height:canvas.height});while(this.cache.size>64)this.cache.delete(this.cache.keys().next().value!);this.failed.delete(key);return true;
      }catch{if(this.alive){this.failed.set(key,Date.now());while(this.failed.size>64)this.failed.delete(this.failed.keys().next().value!);}return false;}
      finally{clearTimeout(timer);this.controllers.delete(abort);this.pending.delete(key);this.active--;this.waiting.shift()?.();}
    })();this.pending.set(key,promise);return promise;
  }
  sample(lat:number,lon:number,zoom:number):number|null{
    const z=terrainTileZoom(zoom),p=tilePosition(lat,lon,z),n=2**z;
    // Elevation pixels represent their centres; read adjacent tiles at boundaries.
    const xx=p.x*256-.5,yy=p.y*256-.5,x0=Math.floor(xx),y0=Math.floor(yy),fx=xx-x0,fy=yy-y0;
    let sum=0;
    for(const [x,y,w] of [[x0,y0,(1-fx)*(1-fy)],[x0+1,y0,fx*(1-fy)],[x0,y0+1,(1-fx)*fy],[x0+1,y0+1,fx*fy]]){
      if(w<1e-10)continue;const tx=((Math.floor(x/256)%n)+n)%n,ty=Math.floor(y/256),key=`${z}/${tx}/${ty}`,tile=this.cache.get(key);if(!tile)return null;
      const value=tile.pixels[((y%256)+256)%256*256+((x%256)+256)%256];if(!Number.isFinite(value))return null;sum+=w*value;
      this.cache.delete(key);this.cache.set(key,tile);
    }
    return sum;
  }
  retry(){this.failed.clear();}
  destroy(){this.alive=false;for(const abort of this.controllers)abort.abort();for(const resume of this.waiting)resume();this.waiting=[];this.cache.clear();this.failed.clear();}
}
