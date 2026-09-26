/**
 * Product studio — renders the hardware models as dark, product-photography
 * style stills (used for the Solutions imagery). Open /studio to re-render or
 * export them; replace with real product photography whenever it exists.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  createAccessPanel, createAlarmKeypad, createBulletCamera, createDeviceMaterials, createDomeCamera,
  createDoorStation, createPIR, createSiren, createTouchPanel,
} from "./world/devices";
import { createStudioEnv } from "./world/environment";
import { FilmShader } from "./post/FilmPass";

export const PRODUCTS = ["cctv", "access", "doorphone", "alarm", "automation"] as const;
export type ProductId = (typeof PRODUCTS)[number];

type Shot = { build: (m: ReturnType<typeof createDeviceMaterials>) => THREE.Object3D; cam: [number, number, number]; look: [number, number, number]; fov: number; key: [number, number, number] };

const SHOTS: Record<ProductId, Shot> = {
  cctv: {
    build: (m) => {
      const g = new THREE.Group();
      const cam = createBulletCamera(m);
      cam.group.rotation.y = 0.32;
      cam.irLeds.emissiveIntensity = 0.25;
      g.add(cam.group);
      const dome = createDomeCamera(m, m.graphite);
      dome.position.set(-0.22, -0.06, 0.02);
      dome.rotation.set(-0.25, 0.55, 0);
      g.add(dome);
      return g;
    },
    cam: [0.36, 0.2, 0.78],
    look: [-0.02, 0.06, 0.14],
    fov: 30,
    key: [0.6, 0.9, 0.6],
  },
  access: {
    build: (m) => {
      const g = new THREE.Group();
      const p = createAccessPanel(m);
      p.setState("granted", 0);
      p.group.rotation.y = -0.38;
      g.add(p.group);
      return g;
    },
    cam: [0.12, 0.05, 0.62],
    look: [0.0, 0.0, 0.0],
    fov: 30,
    key: [0.5, 0.8, 0.8],
  },
  doorphone: {
    build: (m) => {
      const g = new THREE.Group();
      const s = createDoorStation(m);
      s.group.position.set(-0.08, 0, 0);
      s.group.rotation.y = 0.28;
      g.add(s.group);
      const t = createTouchPanel(m, 0.24, 0.15);
      t.group.position.set(0.16, 0.0, -0.08);
      t.group.rotation.y = -0.32;
      g.add(t.group);
      return g;
    },
    cam: [0.02, 0.06, 0.74],
    look: [0.04, 0.0, 0],
    fov: 30,
    key: [-0.6, 0.9, 0.8],
  },
  alarm: {
    build: (m) => {
      const g = new THREE.Group();
      const k = createAlarmKeypad(m);
      k.rotation.y = 0.3;
      k.position.set(-0.1, 0, 0);
      g.add(k);
      const pir = createPIR(m);
      pir.position.set(0.12, 0.05, -0.02);
      pir.rotation.y = -0.4;
      g.add(pir);
      const s = createSiren(m);
      s.group.scale.setScalar(0.6);
      s.group.position.set(0.14, -0.1, -0.06);
      s.group.rotation.y = -0.35;
      s.lensMat.emissiveIntensity = 1.2;
      g.add(s.group);
      return g;
    },
    cam: [0.02, 0.05, 0.72],
    look: [0.02, 0.0, 0],
    fov: 30,
    key: [0.6, 0.9, 0.7],
  },
  automation: {
    build: (m) => {
      const g = new THREE.Group();
      const t = createTouchPanel(m, 0.3, 0.19);
      t.draw(1);
      t.group.rotation.y = -0.36;
      g.add(t.group);
      return g;
    },
    cam: [0.08, 0.06, 0.6],
    look: [0.0, 0.0, 0],
    fov: 32,
    key: [-0.5, 0.8, 0.8],
  },
};

export class ProductStudio {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  private composer: EffectComposer;
  private content = new THREE.Group();
  private key: THREE.SpotLight;
  private film: ShaderPass;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.camera.aspect = width / height;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.08;
    this.scene.background = new THREE.Color(0x050506);

    // cyclorama backdrop with a soft light pool behind the product
    const cyc = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 4, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.92, side: THREE.BackSide }),
    );
    cyc.position.set(0, 0, 2.4);
    this.scene.add(cyc);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.35, metalness: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.key = new THREE.SpotLight(0xfff4e6, 4, 5, 0.4, 0.9, 1.2);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0003;
    this.scene.add(this.key, this.key.target);
    const rim = new THREE.SpotLight(0xa9c6ff, 5, 5, 0.5, 1, 1.2);
    rim.position.set(-0.8, 0.8, -1.0);
    this.scene.add(rim, rim.target);
    const back = new THREE.SpotLight(0xc9ab78, 3, 6, 0.6, 1, 1.4);
    back.position.set(0.2, 1.2, -0.6);
    back.target.position.set(0, -0.2, -1.4);
    this.scene.add(back, back.target);
    this.scene.add(this.content);

    const rt = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.setSize(width, height);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(width / 2, height / 2), 0.18, 0.4, 1.4));
    this.composer.addPass(new OutputPass());
    this.film = new ShaderPass(FilmShader);
    this.film.uniforms.uResolution.value.set(width, height);
    this.film.uniforms.uGrain.value = 0.035;
    this.film.uniforms.uVignette.value = 0.55;
    this.composer.addPass(this.film);

    this.studioEnv = createStudioEnv(this.renderer);
  }

  private studioEnv: THREE.Texture;

  render(id: ProductId) {
    this.content.clear();
    const m = createDeviceMaterials();
    for (const mat of Object.values(m)) {
      const s = mat as THREE.MeshStandardMaterial;
      if (s.isMeshStandardMaterial) {
        s.envMap = this.studioEnv;
        s.envMapIntensity = 1.1;
      }
    }
    const shot = SHOTS[id];
    const obj = shot.build(m);
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.content.add(obj);
    this.camera.fov = shot.fov;
    this.camera.position.set(...shot.cam);
    this.camera.lookAt(...shot.look);
    this.camera.updateProjectionMatrix();
    this.key.position.set(...shot.key);
    this.key.target.position.set(...shot.look);
    this.composer.render();
    return this.renderer.domElement;
  }

  dispose() {
    this.composer.dispose();
    this.renderer.dispose();
  }
}
