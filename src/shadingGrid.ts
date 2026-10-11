export type ViewBounds = { south:number; north:number; west:number; east:number };
export type ShadingCell = { lat:number; lon:number; bounds:[number,number][] };
const R=6378137;
const project=(lat:number)=>R*Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360));
const latitude=(y:number)=>(2*Math.atan(Math.exp(y/R))-Math.PI/2)*180/Math.PI;
const longitude=(x:number)=>x/R*180/Math.PI;

/** Global anchors survive small pans and zooms; the budget coarsens broad overviews. */
export function metricGrid(bounds:ViewBounds,metres:number,budget:number,padded=false){
  const mid=(bounds.south+bounds.north)/2;
  // Fixed latitude bands keep adjacent viewports on the same cacheable lattice.
  const band=Math.round(mid/5)*5,cos=Math.max(.087,Math.cos(band*Math.PI/180));
  let step=metres/cos;
  const x0=R*bounds.west*Math.PI/180,x1=R*bounds.east*Math.PI/180;
  const y0=project(bounds.south),y1=project(bounds.north);
  const indices=()=>({west:Math.floor(x0/step),east:Math.ceil(x1/step),south:Math.floor(y0/step),north:Math.ceil(y1/step)});
  let ix=indices();
  const count=()=>padded?(ix.east-ix.west+1)*(ix.north-ix.south+1):(ix.east-ix.west)*(ix.north-ix.south);
  while(count()>budget){step*=2;ix=indices();}
  const rows=ix.north-ix.south+(padded?1:0),cols=ix.east-ix.west+(padded?1:0);
  const points:{lat:number;lon:number;r:number;c:number;bounds:[number,number][]}[]=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x=(ix.west+c)*step,y=(ix.south+r)*step;
    const south=Math.max(bounds.south,latitude(y)),north=Math.min(bounds.north,latitude(y+step));
    const west=Math.max(bounds.west,longitude(x)),east=Math.min(bounds.east,longitude(x+step));
    points.push({lat:latitude(y+(padded?0:step/2)),lon:longitude(x+(padded?0:step/2)),r,c,bounds:[[south,west],[south,east],[north,east],[north,west]]});
  }
  return {rows,cols,points,metres:step*cos};
}

/** Nominal 9 km at zoom 8, then halve spacing per zoom level; never chase subpixel detail. */
export function terrainSpacing(zoom:number,lat:number){
  const pixels=156543.03392*Math.cos(lat*Math.PI/180)/2**zoom;
  return Math.max(12*pixels,9000/2**Math.max(0,Math.floor(zoom)-8));
}

/** Find the owning weather sample without extending across unknown holes. */
export function nearestWeatherSample<T extends {lat:number;lon:number}>(grid:(T|null)[][],lat:number,lon:number):T|null{
  if(!grid.length||!grid[0].length)return null;
  const rows=grid.map((line,i)=>({i,p:line.find(Boolean)})).filter(x=>x.p);
  const cols=grid[0].map((_,i)=>({i,p:grid.map(line=>line[i]).find(Boolean)})).filter(x=>x.p);
  if(rows.length<2||cols.length<2)return null;
  const a=rows[0],b=rows.at(-1)!,c=cols[0],d=cols.at(-1)!;
  const dy=(project(b.p!.lat)-project(a.p!.lat))/(b.i-a.i),dx=(d.p!.lon-c.p!.lon)/(d.i-c.i);
  if(dy<=0||dx<=0)return null;
  const rr=a.i+(project(lat)-project(a.p!.lat))/dy,cc=c.i+(lon-c.p!.lon)/dx;
  if(rr<0||rr>grid.length-1||cc<0||cc>grid[0].length-1)return null;
  return grid[Math.round(rr)]?.[Math.round(cc)]??null;
}
