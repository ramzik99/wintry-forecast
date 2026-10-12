/** Bounded, shared requests for geographic tiles used only inside wet-area masks. */
export class GeographicTiles {
  private cache=new Map<string,Promise<HTMLImageElement>>();
  private pending=new Set<HTMLImageElement>();
  get(url:string){
    const hit=this.cache.get(url);if(hit){this.cache.delete(url);this.cache.set(url,hit);return hit;}
    const request=new Promise<HTMLImageElement>((resolve,reject)=>{
      const img=new Image();img.crossOrigin='anonymous';this.pending.add(img);
      const finish=()=>{clearTimeout(timeout);this.pending.delete(img);img.onload=null;img.onerror=null;};
      const timeout=setTimeout(()=>{finish();img.src='';reject(new Error('Geographic tile timed out'));},10000);
      img.onload=()=>{finish();resolve(img)};
      img.onerror=()=>{finish();reject(new Error('Geographic tile unavailable'))};img.src=url;
    });
    this.cache.set(url,request);while(this.cache.size>32)this.cache.delete(this.cache.keys().next().value!);
    void request.catch(()=>{if(this.cache.get(url)===request)this.cache.delete(url)});return request;
  }
  destroy(){for(const img of this.pending)img.src='';this.pending.clear();this.cache.clear();}
}
