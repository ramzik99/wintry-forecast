import { PRESSURE_LEVELS, type ProfilePoint } from './snowLevel';

export type Weighted<T> = { value:T; weight:number };
export const TILE_SIZE=256, RASTER_SAMPLES=128;
/** Infer physical Web-Mercator zoom from viewport geometry, independent of wrapper zoom conventions. */
export function viewportRasterZoom(width:number,west:number,east:number,fallback:number){
  const span=east-west;
  const zoom=width>0&&span>0?Math.log2(width*360/(TILE_SIZE*span)):fallback;
  return Math.max(0,Math.min(22,Math.ceil((Number.isFinite(zoom)?zoom:fallback)-1e-9)));
}
export function mercatorY(lat:number){return Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360));}
export function tilePosition(lat:number,lon:number,z:number){const n=2**z;return{x:(lon+180)/360*n,y:(1-mercatorY(lat)/Math.PI)/2*n};}
export function tileLocation(x:number,y:number,z:number){const n=2**z;return{lat:Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI,lon:x/n*360-180};}
export function visibleRasterTiles(b:{south:number;north:number;west:number;east:number},z:number){
  const a=tilePosition(b.north,b.west,z),c=tilePosition(b.south,b.east,z),n=2**z;
  const out:{x:number;y:number;z:number}[]=[];
  for(let y=Math.max(0,Math.floor(a.y));y<Math.min(n,Math.ceil(c.y));y++)for(let x=Math.floor(a.x);x<Math.ceil(c.x);x++)out.push({x,y,z});
  return out;
}

/** Cache axes once. Missing corners stay unknown: never interpolate over a failed request. */
export function weatherInterpolator<T extends {lat:number;lon:number}>(grid:(T|null)[][]){
  const row=grid.map((r,i)=>({i,p:r.find(Boolean)})).filter(v=>v.p),cols=(grid[0]??[]).map((_,i)=>({i,p:grid.map(r=>r[i]).find(Boolean)})).filter(v=>v.p);
  if(row.length<2||cols.length<2)return()=>null;
  const a=row[0],b=row.at(-1)!,c=cols[0],d=cols.at(-1)!;
  const dy=(mercatorY(b.p!.lat)-mercatorY(a.p!.lat))/(b.i-a.i),dx=(d.p!.lon-c.p!.lon)/(d.i-c.i);
  if(!(dy>0&&dx>0))return()=>null;
  return(lat:number,lon:number):Weighted<T>[]|null=>{
    const r=a.i+(mercatorY(lat)-mercatorY(a.p!.lat))/dy,k=c.i+(lon-c.p!.lon)/dx;
    if(r< -1e-8||k< -1e-8||r>grid.length-1+1e-8||k>(grid[0]?.length??0)-1+1e-8)return null;
    const rr=Math.max(0,Math.min(grid.length-1,r)),cc=Math.max(0,Math.min(grid[0].length-1,k));
    const r0=Math.floor(rr),r1=Math.min(r0+1,grid.length-1),c0=Math.floor(cc),c1=Math.min(c0+1,grid[0].length-1),fy=rr-r0,fx=cc-c0;
    const out:Weighted<T>[]=[];
    for(const [i,j,w] of [[r0,c0,(1-fy)*(1-fx)],[r0,c1,(1-fy)*fx],[r1,c0,fy*(1-fx)],[r1,c1,fy*fx]]){
      if(w<1e-10)continue;const value=grid[i]?.[j];if(!value)return null;out.push({value,weight:w});
    }
    return out.length?out:null;
  };
}
export function weightedScalar<T>(values:Weighted<T>[],read:(p:T)=>number|null){let sum=0;for(const v of values){const n=read(v.value);if(n===null||!Number.isFinite(n))return null;sum+=v.weight*n;}return sum;}
/** Fractional wet coverage softens wet/dry edges without blending phase colours or intensity bands. */
export function wetCoverage<T>(values:Weighted<T>[],read:(p:T)=>number|null){return weightedScalar(values,p=>{const n=read(p);return n===null||!Number.isFinite(n)?null:n>0?1:0;});}

/** Interpolate continuous T/Td/height by pressure, then calculate Tw; never mix categorical colours. */
export function blendedProfile(values:Weighted<ProfilePoint[]>[],wetBulb:(t:number,td:number,p:number)=>number):ProfilePoint[]{
  if(values.length===1)return values[0].value;
  const result:ProfilePoint[]=[];
  for(const first of values[0].value){
    let temp=0,dew=0,height=0,complete=true;
    for(const v of values){const p=v.value.find(p=>p.level===first.level);if(!p){complete=false;break;}temp+=v.weight*p.tempC;dew+=v.weight*p.dewpointC;height+=v.weight*p.heightM;}
    if(complete)result.push({...first,tempC:temp,dewpointC:Math.min(temp,dew),heightM:height,wetBulbC:wetBulb(temp,Math.min(temp,dew),first.pressureHpa)});
  }
  return result.sort((a,b)=>a.heightM-b.heightM);
}

/**
 * Match valid columns on a fixed pressure-coordinate list without discarding
 * low-level air from all four corners when one corner is mountainous.
 * Outside each column's support, repeat its endpoint at the SAME height and
 * pressure (zero thickness), never use model fields beneath its ground.
 * Native wet-bulb values are calculated once by buildProfile, then interpolated.
 */
export function continuousProfileBlender(){
  const columns=new WeakMap<ProfilePoint[],ProfilePoint[]>();
  function prepare(profile:ProfilePoint[]){
    const hit=columns.get(profile);if(hit)return hit;
    if(profile.length<2)return [];
    const sorted=[...profile].sort((a,b)=>b.pressureHpa-a.pressureHpa);
    const out=PRESSURE_LEVELS.map(level=>{
      const pressure=Number(level.slice(0,-1));
      if(pressure>=sorted[0].pressureHpa)return sorted[0];
      if(pressure<=sorted[sorted.length-1].pressureHpa)return sorted[sorted.length-1];
      let i=0;while(i<sorted.length-2&&pressure<sorted[i+1].pressureHpa)i++;
      const a=sorted[i],b=sorted[i+1];
      const f=(Math.log(pressure)-Math.log(a.pressureHpa))/(Math.log(b.pressureHpa)-Math.log(a.pressureHpa));
      const lerp=(x:number,y:number)=>x+(y-x)*f;
      return {level,pressureHpa:pressure,heightM:lerp(a.heightM,b.heightM),
        tempC:lerp(a.tempC,b.tempC),dewpointC:lerp(a.dewpointC,b.dewpointC),
        wetBulbC:lerp(a.wetBulbC,b.wetBulbC)};
    });
    columns.set(profile,out);return out;
  }
  return(values:Weighted<ProfilePoint[]>[]):ProfilePoint[]=>{
    const prepared=values.map(v=>({points:prepare(v.value),weight:v.weight}));
    if(!prepared.length||prepared.some(v=>!v.points.length))return [];
    const result:ProfilePoint[]=[];
    for(let i=0;i<PRESSURE_LEVELS.length;i++){
      let heightM=0,tempC=0,dewpointC=0,wetBulbC=0,pressureHpa=0;
      for(const v of prepared){
        const p=v.points[i],w=v.weight;
        heightM+=w*p.heightM;tempC+=w*p.tempC;dewpointC+=w*p.dewpointC;
        wetBulbC+=w*p.wetBulbC;pressureHpa+=w*p.pressureHpa;
      }
      result.push({level:PRESSURE_LEVELS[i],heightM,tempC,dewpointC:Math.min(tempC,dewpointC),wetBulbC,pressureHpa});
    }
    return result;
  };
}
