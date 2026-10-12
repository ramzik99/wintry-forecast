/** One prepared view on disk; decoded map frames remain in the smaller RAM cache. */
export class PreparedMapCache<T>{
  private database:Promise<IDBDatabase>|null=null;
  private bytes=0;
  private open(){
    return this.database??=new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open('wintry-prepared-map-v1',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('frames',{keyPath:'key'});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error??new Error('Local map storage unavailable'));
      request.onblocked=()=>reject(new Error('Local map storage is busy'));
    });
  }
  private async transaction<R>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<R>){
    const db=await this.open();
    return new Promise<R>((resolve,reject)=>{
      const tx=db.transaction('frames',mode),request=action(tx.objectStore('frames'));
      tx.oncomplete=()=>resolve(request.result);
      tx.onerror=tx.onabort=()=>reject(tx.error??new Error('Local map storage failed'));
    });
  }
  async clear(){await this.transaction('readwrite',s=>s.clear());this.bytes=0;}
  async put(key:string,value:T){
    // Conservative UTF-16 estimate; refuse overflow without evicting earlier prepared times.
    const bytes=JSON.stringify(value).length*2;
    if(this.bytes+bytes>512*1024*1024)throw new Error('Prepared map is too large. Use a smaller map area.');
    await this.transaction('readwrite',s=>s.put({key,value}));this.bytes+=bytes;
  }
  async get(key:string):Promise<T|null>{const record=await this.transaction<any>('readonly',s=>s.get(key));return record?.value??null;}
  close(){if(this.database)void this.database.then(db=>db.close(),()=>{});this.database=null;}
}
