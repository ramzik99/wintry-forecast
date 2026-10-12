/** Stop waiting even when a provider ignores AbortSignal; late results are discarded. */
export async function boundedRequest<T>(request:(signal:AbortSignal)=>Promise<T>,timeoutMs:number,parent?:AbortSignal):Promise<T>{
  const controller=new AbortController();
  const cancel=()=>controller.abort();
  if(parent?.aborted)cancel();else parent?.addEventListener('abort',cancel,{once:true});
  let timer:ReturnType<typeof setTimeout>|undefined;
  let rejectAbort:()=>void=()=>{};
  try{
    return await Promise.race([
      new Promise<never>((_,reject)=>{
        rejectAbort=()=>reject(new DOMException('Forecast request cancelled or timed out','AbortError'));
        controller.signal.addEventListener('abort',rejectAbort,{once:true});
        if(controller.signal.aborted)rejectAbort();
        timer=setTimeout(cancel,timeoutMs);
      }),
      controller.signal.aborted?Promise.reject(new DOMException('Forecast request cancelled','AbortError')):request(controller.signal),
    ]);
  }finally{
    clearTimeout(timer);parent?.removeEventListener('abort',cancel);controller.signal.removeEventListener('abort',rejectAbort);
  }
}
