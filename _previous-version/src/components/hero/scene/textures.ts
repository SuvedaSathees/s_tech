import * as THREE from "three";

/**
 * Procedural surface textures generated on a canvas at load time.
 * They break up perfectly uniform CG surfaces (the #1 tell of "3D render")
 * without shipping any image files. Swap for scanned KTX2 PBR sets in
 * production (see README → Assets).
 */

const cache = new Map<string, THREE.Texture>();

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function fractalCanvas(size: number, seed: number, octaves: number, contrast: number, base: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = `rgb(${base},${base},${base})`;
  ctx.fillRect(0, 0, size, size);
  const r = rng(seed);
  for (let o = 0; o < octaves; o++) {
    const cells = 4 * Math.pow(2, o);
    const cell = size / cells;
    const layer = document.createElement("canvas");
    layer.width = layer.height = cells;
    const lctx = layer.getContext("2d")!;
    const img = lctx.createImageData(cells, cells);
    for (let i = 0; i < cells * cells; i++) {
      const v = Math.floor(r() * 255);
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    lctx.putImageData(img, 0, 0);
    ctx.globalAlpha = contrast / (o + 1.2);
    ctx.globalCompositeOperation = "overlay";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // draw with wrap so the texture tiles
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) ctx.drawImage(layer, dx * size, dy * size, size + cell, size + cell);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  return c;
}

export function noiseTexture(key: string, opts: { size?: number; seed?: number; octaves?: number; contrast?: number; base?: number; repeat?: number; color?: boolean } = {}) {
  const k = key + JSON.stringify(opts);
  if (cache.has(k)) return cache.get(k)!;
  const { size = 512, seed = 7, octaves = 6, contrast = 0.55, base = 128, repeat = 1, color = false } = opts;
  const canvas = fractalCanvas(size, seed, octaves, contrast, base);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  cache.set(k, tex);
  return tex;
}

/** Vertical wood-grain-like streaks for slats / door. */
export function grainTexture(key: string, seed = 3) {
  if (cache.has(key)) return cache.get(key)!;
  const w = 256,
    h = 1024;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const r = rng(seed);
  ctx.fillStyle = "#7a5a40";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 380; i++) {
    const x = r() * w;
    const lw = 0.4 + r() * 2.2;
    const a = 0.04 + r() * 0.14;
    ctx.strokeStyle = r() > 0.5 ? `rgba(40,24,14,${a})` : `rgba(160,120,86,${a * 0.7})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    let xx = x;
    ctx.moveTo(xx, 0);
    for (let y = 0; y <= h; y += 32) {
      xx += (r() - 0.5) * 1.6;
      ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

/** Large-format stone paving: joints + subtle per-tile tone variation. */
export function pavingTexture(key: string, tiles = 8, seed = 11) {
  if (cache.has(key)) return cache.get(key)!;
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const r = rng(seed);
  const t = size / tiles;
  for (let i = 0; i < tiles; i++)
    for (let j = 0; j < tiles * 2; j++) {
      const v = 150 + Math.floor(r() * 40);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(i * t, j * (t / 2), t, t / 2);
    }
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * t, 0);
    ctx.lineTo(i * t, size);
    ctx.stroke();
  }
  for (let j = 0; j <= tiles * 2; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * (t / 2));
    ctx.lineTo(size, j * (t / 2));
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}
