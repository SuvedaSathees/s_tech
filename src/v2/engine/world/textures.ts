/**
 * Procedural surface textures, generated once on the client.
 * Everything tiles, so repeats stay seamless. Swap any of these for scanned
 * PBR sets later (same channel layout: map / roughnessMap / normalMap).
 */
import * as THREE from "three";

type RGB = [number, number, number];

/* ---------- seeded, periodic value noise ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Periodic 2D value noise (period = lattice size) → tileable. */
class TileNoise {
  private grid: Float32Array;
  constructor(private period: number, seed: number) {
    const r = mulberry32(seed);
    this.grid = new Float32Array(period * period);
    for (let i = 0; i < this.grid.length; i++) this.grid[i] = r();
  }
  sample(x: number, y: number) {
    const p = this.period;
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const x0 = ((xi % p) + p) % p, y0 = ((yi % p) + p) % p;
    const x1 = (x0 + 1) % p, y1 = (y0 + 1) % p;
    const g = this.grid;
    const a = g[y0 * p + x0], b = g[y0 * p + x1], c = g[y1 * p + x0], d = g[y1 * p + x1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
}

/** Fractal noise in [0,1], tileable over a unit square sampled at (u,v) ∈ [0,1). */
function fbm(noises: TileNoise[], periods: number[], u: number, v: number) {
  let sum = 0, amp = 0.5, norm = 0;
  for (let i = 0; i < noises.length; i++) {
    sum += noises[i].sample(u * periods[i], v * periods[i]) * amp;
    norm += amp;
    amp *= 0.5;
  }
  return sum / norm;
}

function makeFbm(seed: number, base: number, octaves: number) {
  const periods: number[] = [];
  const noises: TileNoise[] = [];
  for (let i = 0; i < octaves; i++) {
    const p = base * 2 ** i;
    periods.push(p);
    noises.push(new TileNoise(p, seed + i * 101));
  }
  return (u: number, v: number) => fbm(noises, periods, u, v);
}

/* ---------- canvas helpers ---------- */

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(c: HTMLCanvasElement, srgb: boolean, repeat: [number, number] = [1, 1]) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Sobel height → tangent-space normal map (wraps at edges). */
function heightToNormal(h: Float32Array, w: number, hh: number, strength: number) {
  const c = canvas(w, hh);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, hh);
  const at = (x: number, y: number) => h[((y + hh) % hh) * w + ((x + w) % w)];
  for (let y = 0; y < hh; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * w + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export type PBRSet = { map: THREE.Texture; roughnessMap: THREE.Texture; normalMap: THREE.Texture };

/**
 * Generic panelised surface: rows of slabs with random lengths, per-slab tone,
 * fine grain and recessed joints. Used for limestone, basalt, pavers.
 */
function panelSurface(opts: {
  size: number;
  rows: number; // slab rows per tile
  cols: [number, number]; // min/max slabs per row
  joint: number; // joint width, fraction of tile
  base: RGB;
  tone: number; // per-slab brightness variation
  grain: number; // fine texture contrast
  rough: [number, number]; // roughness range
  wet?: number; // puddle strength (lower roughness blotches)
  seed: number;
  vertical?: boolean;
  normalStrength?: number;
  jointDark: number;
}): PBRSet {
  const { size: S, rows, joint, base, tone, grain, rough, seed } = opts;
  const rnd = mulberry32(seed);
  const fine = makeFbm(seed + 7, 16, 5);
  const broad = makeFbm(seed + 13, 3, 4);
  const wetN = makeFbm(seed + 29, 4, 4);

  // slab layout: for each row, sorted break positions
  const rowBreaks: number[][] = [];
  const rowTone: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const n = Math.round(opts.cols[0] + rnd() * (opts.cols[1] - opts.cols[0]));
    const offset = rnd();
    const breaks: number[] = [];
    for (let i = 0; i < n; i++) breaks.push((offset + (i + (rnd() - 0.5) * 0.35) / n + 1) % 1);
    breaks.sort((a, b) => a - b);
    rowBreaks.push(breaks);
    rowTone.push(breaks.map(() => (rnd() - 0.5) * 2 * tone));
  }

  const colC = canvas(S), rC = canvas(S);
  const cctx = colC.getContext("2d")!, rctx = rC.getContext("2d")!;
  const cImg = cctx.createImageData(S, S), rImg = rctx.createImageData(S, S);
  const height = new Float32Array(S * S);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u0 = x / S, v0 = y / S;
      const along = opts.vertical ? v0 : u0;
      const across = opts.vertical ? u0 : v0;
      const rowF = across * rows;
      const row = Math.floor(rowF);
      const inRow = rowF - row;
      const br = rowBreaks[row];
      let slab = 0;
      let dEdge = 1;
      for (let i = 0; i < br.length; i++) {
        const d = Math.abs(((along - br[i] + 1.5) % 1) - 0.5);
        dEdge = Math.min(dEdge, d);
      }
      for (let i = 0; i < br.length; i++) if (along >= br[i]) slab = i;
      if (along < br[0]) slab = br.length - 1;
      const dRow = Math.min(inRow, 1 - inRow) / rows;
      const jointDist = Math.min(dEdge, dRow);
      const j = THREE.MathUtils.smoothstep(jointDist, joint * 0.35, joint);

      const f = fine(u0, v0);
      const b = broad(u0, v0);
      const t = rowTone[row][slab];
      const shade = (1 + t + (f - 0.5) * grain + (b - 0.5) * grain * 0.6) * (opts.jointDark + (1 - opts.jointDark) * j);
      const i4 = (y * S + x) * 4;
      cImg.data[i4] = Math.min(255, base[0] * shade);
      cImg.data[i4 + 1] = Math.min(255, base[1] * shade);
      cImg.data[i4 + 2] = Math.min(255, base[2] * shade);
      cImg.data[i4 + 3] = 255;

      let r = rough[0] + (rough[1] - rough[0]) * (0.55 + (f - 0.5) * 0.8);
      if (opts.wet) {
        const w = THREE.MathUtils.smoothstep(wetN(u0, v0), 0.52, 0.66) * opts.wet;
        r = r * (1 - w) + 0.06 * w;
      }
      r = r * j + 0.95 * (1 - j);
      const rv = Math.max(0, Math.min(255, r * 255));
      rImg.data[i4] = rImg.data[i4 + 1] = rImg.data[i4 + 2] = rv;
      rImg.data[i4 + 3] = 255;

      height[y * S + x] = j * 0.8 + f * 0.2;
    }
  }
  cctx.putImageData(cImg, 0, 0);
  rctx.putImageData(rImg, 0, 0);
  const nC = heightToNormal(height, S, S, opts.normalStrength ?? 2.2);
  return { map: toTexture(colC, true), roughnessMap: toTexture(rC, false), normalMap: toTexture(nC, false) };
}

export function limestone(): PBRSet {
  return panelSurface({
    size: 512, rows: 4, cols: [1, 2], joint: 0.0035, jointDark: 0.72,
    base: [200, 190, 174], tone: 0.045, grain: 0.18, rough: [0.62, 0.86], seed: 11, normalStrength: 1.4,
  });
}

export function basalt(): PBRSet {
  return panelSurface({
    size: 512, rows: 10, cols: [1, 2], joint: 0.003, jointDark: 0.5,
    base: [58, 58, 60], tone: 0.1, grain: 0.35, rough: [0.55, 0.85], seed: 23, vertical: true, normalStrength: 3,
  });
}

export function pavers(): PBRSet {
  return panelSurface({
    size: 512, rows: 4, cols: [2, 3], joint: 0.004, jointDark: 0.45,
    base: [82, 80, 78], tone: 0.12, grain: 0.3, rough: [0.4, 0.8], wet: 0.85, seed: 37,
  });
}

/** Board-formed / smooth architectural concrete for soffits and slabs. */
export function concrete(): PBRSet {
  const S = 512;
  const fine = makeFbm(51, 12, 5);
  const blot = makeFbm(53, 2, 4);
  const c = canvas(S), r = canvas(S);
  const cx = c.getContext("2d")!, rx = r.getContext("2d")!;
  const ci = cx.createImageData(S, S), ri = rx.createImageData(S, S);
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const f = fine(u, v), b = blot(u, v);
      const s = 0.82 + (f - 0.5) * 0.12 + (b - 0.5) * 0.22;
      const i = (y * S + x) * 4;
      ci.data[i] = 150 * s; ci.data[i + 1] = 148 * s; ci.data[i + 2] = 144 * s; ci.data[i + 3] = 255;
      const rv = (0.78 + (f - 0.5) * 0.2) * 255;
      ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = rv; ri.data[i + 3] = 255;
      h[y * S + x] = f;
    }
  cx.putImageData(ci, 0, 0);
  rx.putImageData(ri, 0, 0);
  return { map: toTexture(c, true), roughnessMap: toTexture(r, false), normalMap: toTexture(heightToNormal(h, S, S, 1.2), false) };
}

/** Dark walnut, vertical grain. */
export function walnut(): PBRSet {
  const S = 512;
  const grainN = makeFbm(71, 4, 5);
  const fine = makeFbm(73, 32, 3);
  const c = canvas(S), r = canvas(S);
  const cx = c.getContext("2d")!, rx = r.getContext("2d")!;
  const ci = cx.createImageData(S, S), ri = rx.createImageData(S, S);
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const warp = grainN(u * 0.5, v * 0.08) * 6;
      const ring = 0.5 + 0.5 * Math.sin((u * 38 + warp) * Math.PI);
      const f = fine(u, v);
      const s = 0.62 + ring * 0.28 + (f - 0.5) * 0.12;
      const i = (y * S + x) * 4;
      ci.data[i] = 92 * s; ci.data[i + 1] = 62 * s; ci.data[i + 2] = 44 * s; ci.data[i + 3] = 255;
      const rv = (0.42 + ring * 0.14) * 255;
      ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = rv; ri.data[i + 3] = 255;
      h[y * S + x] = ring * 0.3 + f * 0.1;
    }
  cx.putImageData(ci, 0, 0);
  rx.putImageData(ri, 0, 0);
  return { map: toTexture(c, true), roughnessMap: toTexture(r, false), normalMap: toTexture(heightToNormal(h, S, S, 1.5), false) };
}

/** Subtle micro-roughness for powder-coated / anodised hardware. */
export function microRough(seed = 91, base = 0.35, amp = 0.12): THREE.Texture {
  const S = 256;
  const n = makeFbm(seed, 64, 2);
  const c = canvas(S);
  const x = c.getContext("2d")!;
  const img = x.createImageData(S, S);
  for (let i = 0; i < S * S; i++) {
    const v = (base + (n((i % S) / S, Math.floor(i / S) / S) - 0.5) * amp * 2) * 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return toTexture(c, false);
}

/** Tileable ripple normal map for water. */
export function waterNormal(): THREE.Texture {
  const S = 512;
  const n = makeFbm(101, 6, 5);
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = n(x / S, y / S);
  return toTexture(heightToNormal(h, S, S, 6), false);
}

/** Lawn / planting beds seen at night: dark, rough, low-frequency variation. */
export function lawn(): PBRSet {
  const S = 512;
  const n = makeFbm(131, 8, 5), b = makeFbm(137, 2, 3);
  const c = canvas(S), r = canvas(S);
  const cx = c.getContext("2d")!, rx = r.getContext("2d")!;
  const ci = cx.createImageData(S, S), ri = rx.createImageData(S, S);
  const h = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const f = n(u, v), g = b(u, v);
      const s = 0.7 + (f - 0.5) * 0.5 + (g - 0.5) * 0.4;
      const i = (y * S + x) * 4;
      ci.data[i] = 34 * s; ci.data[i + 1] = 44 * s; ci.data[i + 2] = 30 * s; ci.data[i + 3] = 255;
      ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = 240; ri.data[i + 3] = 255;
      h[y * S + x] = f;
    }
  cx.putImageData(ci, 0, 0);
  rx.putImageData(ri, 0, 0);
  return { map: toTexture(c, true), roughnessMap: toTexture(r, false), normalMap: toTexture(heightToNormal(h, S, S, 4), false) };
}

/** Soft radial sprite (for glows, dust, device nodes). */
export function radialSprite(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  const c = canvas(128);
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.45)"));
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Warm interior "plate" seen through a strip window: gradient + soft practicals. */
export function interiorPlate(w = 1024, h = 256): THREE.Texture {
  const c = canvas(w, h);
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#3a2414");
  g.addColorStop(0.55, "#8a5a32");
  g.addColorStop(1, "#2a1a10");
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  // soft pools of light from lamps
  for (let i = 0; i < 6; i++) {
    const px = (i + 0.5) * (w / 6) + (i % 2 ? 30 : -20);
    const rg = x.createRadialGradient(px, h * 0.35, 4, px, h * 0.35, h * 0.9);
    rg.addColorStop(0, "rgba(255,214,160,0.95)");
    rg.addColorStop(0.3, "rgba(255,170,100,0.35)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = rg;
    x.fillRect(0, 0, w, h);
  }
  // shelving / furniture silhouettes
  x.filter = "blur(6px)";
  x.fillStyle = "rgba(20,12,8,0.5)";
  x.fillRect(w * 0.08, h * 0.62, w * 0.22, h * 0.38);
  x.fillRect(w * 0.55, h * 0.7, w * 0.3, h * 0.3);
  for (let i = 0; i < 4; i++) x.fillRect(w * (0.36 + i * 0.035), h * 0.2, 6, h * 0.8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Soft vertical pleats for sheer curtains. */
export function pleats(): THREE.Texture {
  const c = canvas(256, 8);
  const x = c.getContext("2d")!;
  for (let i = 0; i < 256; i++) {
    const v = 0.78 + 0.22 * Math.sin((i / 256) * Math.PI * 2 * 6) * Math.sin((i / 256) * Math.PI * 2 * 1.5 + 1);
    x.fillStyle = `rgb(${v * 255},${v * 250},${v * 242})`;
    x.fillRect(i, 0, 1, 8);
  }
  return toTexture(c, true, [3, 1]);
}
