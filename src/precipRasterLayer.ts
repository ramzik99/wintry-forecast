export const PRECIP_RASTER_ID = 'wintry-precip-shading';
const GEOGRAPHIC_BACKGROUND = '#d5d0bd';
const UPPER_WEATHER_LAYERS = ['gl-particles', 'radar-coverage'];

export type PrecipRasterTile = {
  nw: { lat: number; lon: number };
  se: { lat: number; lon: number };
  terrain: HTMLCanvasElement | null;
  phase: HTMLCanvasElement | null;
};

/** Project adjacent tiles to shared pixel edges and cover the entire viewport. */
export function drawPrecipRaster(
  ctx: CanvasRenderingContext2D,
  tiles: PrecipRasterTile[],
  project: (point: [number, number]) => { x: number; y: number },
) {
  ctx.fillStyle = GEOGRAPHIC_BACKGROUND;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = false;
  for (const { nw, se, terrain, phase } of tiles) {
    const start = project([nw.lon, nw.lat]), end = project([se.lon, se.lat]);
    const x = Math.round(start.x), y = Math.round(start.y);
    const width = Math.round(end.x) - x, height = Math.round(end.y) - y;
    if (width <= 0 || height <= 0 || x >= ctx.canvas.width || y >= ctx.canvas.height ||
        x + width <= 0 || y + height <= 0) continue;
    if (terrain) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(terrain, x, y, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (phase) ctx.drawImage(phase, x, y, width, height);
  }
}

/**
 * Composite under Windy's geographic raster and above its weather renderers.
 * The forecast selection and native timeline stay attached to Windy's product.
 */
export function createPrecipRaster(map: any, basemapOrder: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  let active = false, tiles: PrecipRasterTile[] = [], dirty = true;
  let program: WebGLProgram | null = null, texture: WebGLTexture | null = null;
  const hidden = new Map<string, 'visible' | undefined>();

  const invalidate = () => { dirty = true; map.triggerRepaint(); };
  const layer = {
    id: PRECIP_RASTER_ID,
    type: 'custom',
    onAdd(_map: unknown, gl: WebGL2RenderingContext) {
      program = compileRasterProgram(gl);
      texture = gl.createTexture();
      dirty = true;
    },
    render(gl: WebGL2RenderingContext) {
      if (!ctx || !program || !texture) return;
      const { clientWidth: width, clientHeight: height } = map.getCanvas();
      if (!width || !height) return;
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (dirty || canvas.width !== width || canvas.height !== height) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        drawPrecipRaster(ctx, tiles, point => map.project(point));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        dirty = false;
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    onRemove(_map: unknown, gl: WebGL2RenderingContext) {
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      texture = program = null;
    },
  };

  function sync() {
    if (!active) return;
    if (!map.getLayer(PRECIP_RASTER_ID)) map.addLayerToBucket(layer, basemapOrder - 1);
    // Windy's LeafletGL fork omits MapLibre's layout mutators.
    if (!map.setLayoutProperty || !map.getLayoutProperty) return;
    for (const id of UPPER_WEATHER_LAYERS) {
      if (!map.getLayer(id)) {
        hidden.delete(id);
        continue;
      }
      const visibility = map.getLayoutProperty(id, 'visibility');
      if (visibility === 'none') continue;
      if (!hidden.has(id)) hidden.set(id, visibility);
      map.setLayoutProperty(id, 'visibility', 'none');
    }
  }

  return {
    setActive(value: boolean) {
      if (active === value) return;
      active = value;
      if (value) {
        map.on('styledata', sync);
        map.on('move', invalidate);
        map.on('resize', invalidate);
        map.getCanvas().addEventListener('webglcontextrestored', invalidate);
        sync();
      } else {
        map.off('styledata', sync);
        map.off('move', invalidate);
        map.off('resize', invalidate);
        map.getCanvas().removeEventListener('webglcontextrestored', invalidate);
        if (map.getLayer(PRECIP_RASTER_ID)) map.removeLayer(PRECIP_RASTER_ID);
        for (const [id, visibility] of hidden) {
          if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'none') {
            map.setLayoutProperty(id, 'visibility', visibility ?? 'visible');
          }
        }
        hidden.clear();
        tiles = [];
      }
    },
    setTiles(next: PrecipRasterTile[]) {
      tiles = next;
      invalidate();
    },
  };
}

function compileRasterProgram(gl: WebGL2RenderingContext) {
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  if (!program) throw new Error('Wintry raster program unavailable');
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, `#version 300 es
        out vec2 uv;
        void main() {
          vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
          gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
          uv = vec2(corner.x, 1.0 - corner.y);
        }`],
      [gl.FRAGMENT_SHADER, `#version 300 es
        precision mediump float;
        uniform sampler2D image;
        in vec2 uv;
        out vec4 colour;
        void main() { colour = texture(image, uv); }`],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Wintry raster shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'Wintry raster shader failed');
      }
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'Wintry raster program failed');
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    for (const shader of shaders) gl.deleteShader(shader);
  }
}

/** Apply label-free elevation relief to phase colours; preserve dry/missing alpha. */
export function colourTerrainTile(phase:HTMLCanvasElement,terrain:CanvasImageSource){
  const result=document.createElement('canvas');result.width=phase.width;result.height=phase.height;
  const ctx=result.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.drawImage(terrain,0,0,result.width,result.height);
  const relief=ctx.getImageData(0,0,result.width,result.height).data;
  ctx.clearRect(0,0,result.width,result.height);ctx.drawImage(phase,0,0);
  const pixels=ctx.getImageData(0,0,result.width,result.height);
  for(let i=0;i<pixels.data.length;i+=4){
    if(!pixels.data[i+3])continue;
    for(let c=0;c<3;c++)pixels.data[i+c]=Math.round(pixels.data[i+c]*relief[i+c]/255);
  }
  ctx.putImageData(pixels,0,0);return result;
}

/** Northwest light at 45 degrees; bounded ambient light keeps each type readable. */
export function terrainIllumination(west:number,east:number,north:number,south:number,metres:number){
  if(![west,east,north,south,metres].every(Number.isFinite)||metres<=0)return 235;
  const dx=(east-west)/(2*metres),dy=(north-south)/(2*metres);
  const light=(.5*dx-.5*dy+Math.SQRT1_2)/Math.hypot(dx,dy,1);
  return Math.round(Math.max(100,Math.min(255,235+150*(light-Math.SQRT1_2))));
}
