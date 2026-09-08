export type HatchPoint = { x:number; y:number; difference:number|null };
type XY = [number,number];

/** Clip each sampled terrain-minus-WBZ triangle to the strictly positive side,
 * then intersect it with parallel screen-space diagonals. Unknown cells stay blank.
 */
export function terrainHatchSegments(grid:HatchPoint[][], spacing=12):XY[][] {
  if (!(spacing>0) || !Number.isFinite(spacing)) return [];
  const segments:XY[][]=[];
  function triangle(vertices:HatchPoint[]) {
    if(vertices.some(p=>p.difference===null || !Number.isFinite(p.difference) || !Number.isFinite(p.x) || !Number.isFinite(p.y)))return;
    const polygon:HatchPoint[]=[];
    for(let i=0;i<3;i++){
      const a=vertices[i],b=vertices[(i+1)%3],da=a.difference!,db=b.difference!;
      if(da>0)polygon.push(a);
      if((da>0)!==(db>0)){
        const f=da/(da-db);
        polygon.push({x:a.x+f*(b.x-a.x),y:a.y+f*(b.y-a.y),difference:0});
      }
    }
    if(polygon.length<3)return;
    const offsets=polygon.map(p=>p.x+p.y),lo=Math.ceil(Math.min(...offsets)/spacing)*spacing,hi=Math.max(...offsets);
    for(let k=lo;k<=hi;k+=spacing){
      const hits:XY[]=[];
      for(let i=0;i<polygon.length;i++){
        const a=polygon[i],b=polygon[(i+1)%polygon.length],den=b.x+b.y-a.x-a.y;
        if(Math.abs(den)<1e-9)continue;
        const f=(k-a.x-a.y)/den;
        if(f>=0&&f<=1)hits.push([a.x+f*(b.x-a.x),a.y+f*(b.y-a.y)]);
      }
      hits.sort((a,b)=>a[0]-b[0]);
      if(hits.length>=2){const a=hits[0],b=hits[hits.length-1];if(Math.hypot(a[0]-b[0],a[1]-b[1])>.1)segments.push([a,b]);}
    }
  }
  for(let r=0;r<grid.length-1;r++)for(let c=0;c<grid[r].length-1;c++){
    const a=grid[r][c],b=grid[r][c+1],d=grid[r+1]?.[c],e=grid[r+1]?.[c+1];
    if(!a||!b||!d||!e||[a,b,d,e].some(p=>p.difference===null))continue;
    triangle([a,b,e]);triangle([a,e,d]);
  }
  // Join touching fragments on the same stripe. Keep genuine gaps (including
  // missing terrain) open, and avoid darker overlaps at triangle boundaries.
  const stripes = new Map<number, XY[][]>();
  for (const segment of segments) {
    const stripe = Math.round((segment[0][0] + segment[0][1]) / spacing);
    const parts = stripes.get(stripe) ?? [];
    parts.push(segment);
    stripes.set(stripe, parts);
  }
  const joined: XY[][] = [];
  for (const parts of stripes.values()) {
    parts.sort((a,b) => a[0][0] - b[0][0]);
    let current: XY[] | null = null;
    for (const part of parts) {
      if (current && part[0][0] <= current[1][0] + 1e-7) {
        if (part[1][0] > current[1][0]) current[1] = part[1];
      } else {
        current = [part[0], part[1]];
        joined.push(current);
      }
    }
  }
  return joined;
}
