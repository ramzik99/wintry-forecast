/** One prepared view on disk; decoded map frames remain in the smaller RAM cache. */
export class PreparedMapCache<T>{
  private database:Promise<IDBDatabase>|null=null;
  private bytes=0;
  constructor(private readonly maxBytes=512*1024*1024){}
  private open(){
    return this.database??=new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('wintry-prepared-map-v1',1);
      let settled=false;
      const fail=(error:Error|DOMException)=>{if(!settled){settled=true;clearTimeout(timer);reject(error);}};
      const timer=setTimeout(()=>fail(new Error('Local map storage timed out')),10000);
      request.onupgradeneeded=()=>request.result.createObjectStore('frames',{keyPath:'key'});
      request.onsuccess=()=>{if(settled){request.result.close();return;}settled=true;clearTimeout(timer);resolve(request.result);};
      request.onerror=()=>fail(request.error??new Error('Local map storage unavailable'));
      request.onblocked=()=>fail(new Error('Local map storage is busy'));
    });
  }
  private async transaction<R>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<R>){
    const db=await this.open();
    return new Promise<R>((resolve,reject)=>{
      const tx=db.transaction('frames',mode);
      let settled=false;
      const fail=(error:Error|DOMException)=>{if(!settled){settled=true;clearTimeout(timer);reject(error);}};
      const timer=setTimeout(()=>{fail(new Error('Local map storage timed out'));try{tx.abort();}catch{}},10000);
      tx.onerror=tx.onabort=()=>fail(tx.error??new Error('Local map storage failed'));
      try{
        const request=action(tx.objectStore('frames'));
        tx.oncomplete=()=>{if(!settled){settled=true;clearTimeout(timer);resolve(request.result);}};
      }catch(error){
        fail(error instanceof Error?error:new Error('Local map storage failed'));try{tx.abort();}catch{}
      }
    });
  }
  async clear(){await this.transaction('readwrite',s=>s.clear());this.bytes=0;}
  async put(key:string,value:T){
    // Bound optional timeline caching; video export renders directly without this store.
    const bytes=JSON.stringify(value).length*2;
    if(this.bytes+bytes>this.maxBytes)return false;
    await this.transaction('readwrite',s=>s.put({key,value}));this.bytes+=bytes;return true;
  }
  async get(key:string):Promise<T|null>{const record=await this.transaction<any>('readonly',s=>s.get(key));return record?.value??null;}
  close(){if(this.database)void this.database.then(db=>db.close(),()=>{});this.database=null;}
}
