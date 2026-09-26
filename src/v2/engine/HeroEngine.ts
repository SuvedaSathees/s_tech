/**
 * HeroEngine — framework-agnostic real-time film.
 *
 *   const engine = new HeroEngine(canvas, { onFrame });
 *   engine.setProgress(scrollProgress); // 0..1, smoothed internally
 *   engine.dispose();
 */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { createWorld, type World } from "./world/world";
import { evaluate, type Frame } from "./timeline";
import { FilmShader } from "./post/FilmPass";

export type Quality = "high" | "medium" | "low";

export type HeroFrameInfo = {
  progress: number;
  pov: boolean;
  /** Vehicle bounding box in normalised screen coords (0..1), during the surveillance POV. */
  target: { x: number; y: number; w: number; h: number; dist: number } | null;
};

export type HeroEngineOptions = {
  quality?: Quality;
  onFrame?: (info: HeroFrameInfo) => void;
  /** Called once the first frame has rendered. */
  onReady?: () => void;
};

export function detectQuality(): Quality {
  if (typeof window === "undefined") return "medium";
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarse || small || mem <= 4) return "low";
  return "high";
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export class HeroEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.PerspectiveCamera;
  private world: World;
  private composer: EffectComposer;
  private bokeh: BokehPass | null = null;
  private bloom: UnrealBloomPass;
  private film: ShaderPass;
  private frame: Frame;
  private quality: Quality;
  private target = 0;
  private current = 0;
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();
  private last = 0;
  private elapsed = 0;
  private raf = 0;
  private running = false;
  private ready = false;
  private frameTimes: number[] = [];
  private opts: HeroEngineOptions;
  private lookTarget = new THREE.Vector3();

  constructor(private canvas: HTMLCanvasElement, opts: HeroEngineOptions = {}) {
    this.opts = opts;
    this.quality = opts.quality ?? detectQuality();
    const q = this.quality;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false, stencil: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, q === "high" ? 1.5 : 1));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = q !== "low";
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.02, 1500);
    this.world = createWorld(this.renderer, { reflector: q !== "low", shadows: q !== "low" });

    // hero-camera reference frame (rest pose)
    this.world.apply({ ...evaluate(0, 0, this.dummyFrame()).world, cctvPan: 0 });
    const lens = this.world.lensWorld.clone();
    const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(this.world.cctv.lensAnchor.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), axis).normalize();
    const up = new THREE.Vector3().crossVectors(axis, side).normalize();
    this.frame = {
      lens,
      axis,
      up,
      side,
      body: lens.clone().addScaledVector(axis, -0.15).addScaledVector(up, -0.004),
      panel: this.world.panelPos.clone(),
      door: this.world.doorPos.clone(),
      car: new THREE.Vector3(12.6, 0, 60),
    };

    // post pipeline
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: q === "low" ? 0 : 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.world.scene, this.camera));
    if (q === "high") {
      this.bokeh = new BokehPass(this.world.scene, this.camera, { focus: 1, aperture: 0.001, maxblur: 0.009 });
      this.composer.addPass(this.bokeh);
    }
    this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.7, 0.55, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.film = new ShaderPass(FilmShader);
    this.composer.addPass(this.film);

    this.resize();
  }

  private dummyFrame(): Frame {
    const z = new THREE.Vector3();
    return { body: z, lens: z, axis: new THREE.Vector3(0, 0, 1), up: new THREE.Vector3(0, 1, 0), side: new THREE.Vector3(1, 0, 0), panel: z, door: z, car: z };
  }

  get qualityLevel() {
    return this.quality;
  }

  setProgress(p: number) {
    this.target = Math.min(1, Math.max(0, p));
  }

  /** Jump without smoothing (e.g. on load deep in the page, or for stills). */
  jumpTo(p: number) {
    this.target = this.current = Math.min(1, Math.max(0, p));
  }

  setPointer(nx: number, ny: number) {
    this.pointer.set(nx, ny);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const ds = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    this.film.uniforms.uResolution.value.set(ds.x, ds.y);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.tick();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Render one frame at progress p immediately (stills, tests). */
  renderStill(p: number, time = 2.0, opts: { letterbox?: boolean } = {}) {
    this.jumpTo(p);
    this.noLetterbox = opts.letterbox === false;
    this.renderAt(p, time);
    this.noLetterbox = false;
  }

  private noLetterbox = false;

  private tick() {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.elapsed += dt;
    // critically-damped follow → buttery scrubbing even with coarse wheel input
    this.current += (this.target - this.current) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(this.target - this.current) < 1e-5) this.current = this.target;
    const t0 = performance.now();
    this.renderAt(this.current, this.elapsed);
    this.adapt(performance.now() - t0, dt);
  }

  private renderAt(p: number, time: number) {
    this.frame.car.copy(this.world.carPosition);
    const ev = evaluate(p, time, this.frame);
    this.world.apply(ev.world);

    // gentle pointer parallax (not in the surveillance POV)
    this.pointerSmooth.lerp(this.pointer, 0.05);
    const cam = this.camera;
    cam.position.copy(ev.pos);
    this.lookTarget.copy(ev.target);
    if (!ev.pov) {
      const d = ev.pos.distanceTo(ev.target);
      const k = Math.min(0.025 * d, 0.35);
      cam.position.x += this.pointerSmooth.x * k;
      cam.position.y += this.pointerSmooth.y * k * 0.6;
    }
    cam.lookAt(this.lookTarget);
    // portrait screens: widen vertically so the subject keeps its horizontal framing
    const k = cam.aspect < 1.5 ? Math.min(1.9, 1.5 / cam.aspect) : 1;
    cam.fov = k === 1 ? ev.fov : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(ev.fov) / 2) * k));
    cam.near = THREE.MathUtils.clamp(ev.focus * 0.04, 0.01, 0.6);
    cam.updateProjectionMatrix();

    if (this.bokeh) {
      const u = this.bokeh.uniforms as Record<string, THREE.IUniform>;
      u.focus.value = ev.focus;
      u.aperture.value = ev.aperture;
      this.bokeh.enabled = ev.aperture > 0.00005;
    }
    this.bloom.strength = ev.post.bloom;
    this.renderer.toneMappingExposure = ev.post.exposure;

    const fu = this.film.uniforms;
    fu.uTime.value = time;
    fu.uFade.value = ev.post.fade;
    fu.uFlash.value = ev.post.flash;
    fu.uIR.value = ev.post.ir;
    fu.uSystem.value = ev.post.system;
    fu.uGrain.value = ev.post.grain;
    fu.uLetterbox.value = cam.aspect > 1.2 && !this.noLetterbox ? ev.post.letterbox : 0;

    this.composer.render();

    if (!this.ready) {
      this.ready = true;
      this.opts.onReady?.();
    }
    this.opts.onFrame?.({ progress: p, pov: ev.pov, target: ev.pov ? this.world.projectCar(cam) : null });
  }

  /** Drop expensive passes if the device can't hold ~30fps. */
  private adapt(ms: number, dt: number) {
    if (this.quality === "low") return;
    this.frameTimes.push(Math.max(ms, dt * 1000));
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    if (avg > 36) {
      if (this.bokeh) {
        this.composer.removePass(this.bokeh);
        this.bokeh = null;
      } else if (this.renderer.getPixelRatio() > 1) {
        this.renderer.setPixelRatio(1);
        this.resize();
      } else {
        this.quality = "medium";
      }
    }
  }

  dispose() {
    this.stop();
    this.world.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
