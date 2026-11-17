export const PRECIP_RASTER_ID = 'wintry-precip-shading';
const CLOSE_ZOOM_RASTER_ID = 'wintry-precip-shading-close';
const CLOSE_ZOOM = 11; // MapLibre zoom 11 is Windy zoom 12, where the outdoor map becomes opaque.
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
  overOutdoorMap = false,
) {
  if (overOutdoorMap) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = GEOGRAPHIC_BACKGROUND;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.imageSmoothingEnabled = false;
  for (const { nw, se, terrain, phase } of tiles) {
    const start = project([nw.lon, nw.lat]), end = project([se.lon, se.lat]);
    const x = Math.round(start.x), y = Math.round(start.y);
    const width = Math.round(end.x) - x, height = Math.round(end.y) - y;
    if (width <= 0 || height <= 0 || x >= ctx.canvas.width || y >= ctx.canvas.height ||
        x + width <= 0 || y + height <= 0) continue;
    if (terrain && !overOutdoorMap) {
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
export function createPrecipRaster(map: any) {
  let active = false, tiles: PrecipRasterTile[] = [];
  const hidden = new Map<string, 'visible' | undefined>();

  function createPass(id: string, overOutdoorMap: boolean) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: overOutdoorMap });
    let dirty = true;
    let program: WebGLProgram | null = null, texture: WebGLTexture | null = null;
    return {
      id,
      type: 'custom',
      invalidate() { dirty = true; },
      onAdd(_map: unknown, gl: WebGL2RenderingContext) {
        program = compileRasterProgram(gl, overOutdoorMap);
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
          drawPrecipRaster(ctx, tiles, point => map.project(point), overOutdoorMap);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, overOutdoorMap);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
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
  }

  const layer = createPass(PRECIP_RASTER_ID, false);
  // Above the opaque outdoor map, retain detail by compositing wet colours with geography.
  // The lower pass already covers all weather, including behind transparent phase pixels.
  const closeLayer = createPass(CLOSE_ZOOM_RASTER_ID, true);
  const invalidate = () => { layer.invalidate(); closeLayer.invalidate(); map.triggerRepaint(); };

  function position(pass: typeof layer, before?: string) {
    const order: string[] = map.getLayersOrder();
    const current = order.indexOf(pass.id);
    if (current < 0) map.addLayer(pass, before);
    else if (current + 1 !== (before ? order.indexOf(before) : order.length)) map.moveLayer(pass.id, before);
  }

  function sync() {
    if (!active) return;
    const order: string[] = map.getLayersOrder();
    const basemap = order.find(id => id === 'raster-basemap' || id === 'topoMap');
    position(layer, basemap);
    if (basemap === 'raster-basemap' && map.getZoom() >= CLOSE_ZOOM) {
      const above = map.getLayersOrder().slice(map.getLayersOrder().indexOf(basemap) + 1)
        .find((id: string) => id !== CLOSE_ZOOM_RASTER_ID);
      position(closeLayer, above);
    } else if (map.getLayer(CLOSE_ZOOM_RASTER_ID)) map.removeLayer(CLOSE_ZOOM_RASTER_ID);
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
        map.on('zoom', sync);
        map.getCanvas().addEventListener('webglcontextrestored', invalidate);
        sync();
      } else {
        map.off('styledata', sync);
        map.off('move', invalidate);
        map.off('resize', invalidate);
        map.off('zoom', sync);
        map.getCanvas().removeEventListener('webglcontextrestored', invalidate);
        if (map.getLayer(CLOSE_ZOOM_RASTER_ID)) map.removeLayer(CLOSE_ZOOM_RASTER_ID);
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

function compileRasterProgram(gl: WebGL2RenderingContext, overOutdoorMap: boolean) {
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
        void main() { colour = texture(image, uv) * ${overOutdoorMap ? '0.80' : '1.0'}; }`],
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
