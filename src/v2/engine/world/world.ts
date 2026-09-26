/**
 * Assembles the hero world: architecture + devices + vehicle + system overlay
 * + atmosphere, and exposes a single `apply(state)` driven by the timeline.
 */
import * as THREE from "three";
import { buildArchitecture } from "./architecture";
import {
  createAccessPanel, createBulletCamera, createDeviceMaterials, createDomeCamera,
  createDoorStation, createHub, createPIR, createSiren, createTouchPanel,
} from "./devices";
import { createNightEnv, createSky, createStudioEnv } from "./environment";
import { radialSprite } from "./textures";
import { carPositionAt } from "../timeline";

export type WorldState = {
  time: number;
  sky: number; // 0 black → 1 blue hour
  fog: number;
  envArch: number; // IBL on architecture
  envDevice: number; // IBL on hardware
  facade: number;
  interior: [number, number, number];
  foyer: number;
  door: number;
  shades: number;
  pool: number;
  key: number; // hero key light
  keySweep: number; // 0..1 across the camera
  rim: number;
  irGlow: number; // camera IR LEDs
  dust: number;
  cctvPan: number; // radians
  cctvTilt: number;
  cctvVisible: boolean;
  panel: "idle" | "scan" | "granted";
  panelT: number;
  car: number; // 0..1 along the approach; <0 hidden
  headlights: number;
  system: number; // network overlay
  cones: number; // camera coverage cones
  touchScene: number;
};

export function createWorld(renderer: THREE.WebGLRenderer, opts: { reflector: boolean; shadows: boolean }) {
  const scene = new THREE.Scene();
  const sky = createSky();
  scene.add(sky.mesh);
  const fogColor = new THREE.Color(0x1f3048);
  scene.fog = new THREE.FogExp2(fogColor.clone(), 0.012);

  const nightEnv = createNightEnv(renderer);
  const studioEnv = createStudioEnv(renderer);
  scene.environment = nightEnv;

  const arch = buildArchitecture({ reflector: opts.reflector });
  scene.add(arch.root);

  // ambient: cool sky fill + moon
  const hemi = new THREE.HemisphereLight(0x4d6a94, 0x0b0a09, 0.0);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9fb4ff, 0);
  moon.position.set(-30, 40, -25);
  scene.add(moon);

  /* ---------- hardware ---------- */
  const dm = createDeviceMaterials();
  const deviceMats = Object.values(dm) as THREE.Material[];
  for (const m of deviceMats) if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) (m as THREE.MeshStandardMaterial).envMap = studioEnv;

  const cctv = createBulletCamera(dm);
  cctv.group.position.copy(arch.anchors.cctvMount);
  cctv.group.rotation.y = -0.32; // face the garden & entrance
  scene.add(cctv.group);

  const panel = createAccessPanel(dm);
  panel.group.position.copy(arch.anchors.panelMount);
  scene.add(panel.group);

  const station = createDoorStation(dm);
  station.group.position.copy(arch.anchors.stationMount);
  scene.add(station.group);

  const touch = createTouchPanel(dm);
  touch.group.position.copy(arch.anchors.touchPanelMount);
  touch.group.rotation.y = Math.PI / 2;
  scene.add(touch.group);

  const hub = createHub(dm);
  hub.position.copy(arch.anchors.hub);
  scene.add(hub);

  const domes = arch.anchors.soffitDomes.map((p) => {
    const d = createDomeCamera(dm);
    d.position.copy(p);
    d.rotation.x = Math.PI / 2; // +Z → down
    scene.add(d);
    return d;
  });
  arch.anchors.pirs.forEach((p, i) => {
    const s = createPIR(dm);
    s.position.copy(p);
    if (i === 0) s.rotation.y = -Math.PI / 2;
    if (i === 2) s.rotation.y = Math.PI / 2;
    s.rotation.x = 0.25;
    scene.add(s);
  });
  const siren = createSiren(dm);
  siren.group.position.copy(arch.anchors.siren);
  siren.group.rotation.y = -Math.PI / 2;
  scene.add(siren.group);

  /* ---------- hero lighting for the product reveal ---------- */
  const key = new THREE.SpotLight(0xfff3e4, 0, 6, 0.22, 0.85, 1.2);
  key.castShadow = opts.shadows;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.camera.near = 0.2;
  key.shadow.camera.far = 6;
  const keyTarget = new THREE.Object3D();
  scene.add(key, keyTarget);
  key.target = keyTarget;
  const rim = new THREE.SpotLight(0x9fc3ff, 0, 5, 0.3, 0.9, 1.3);
  const rimTarget = new THREE.Object3D();
  scene.add(rim, rimTarget);
  rim.target = rimTarget;

  // dust in the key light
  const dustCount = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dp = new Float32Array(dustCount * 3);
  const dseed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 1.6;
    dp[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    dseed[i] = Math.random();
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  dustGeo.setAttribute("seed", new THREE.BufferAttribute(dseed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uPixel: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float seed; uniform float uTime; uniform float uPixel; varying float vA;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * 0.012 * (0.4 + seed) + seed * 1.2, 1.2) - 0.6;
        p.x += sin(uTime * 0.2 + seed * 40.0) * 0.03;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPixel * (1.5 + seed * 3.5) * (1.0 / -mv.z);
        vA = 0.25 + 0.75 * fract(seed * 13.7);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.0, 0.94, 0.86) * a * uAlpha * vA, 1.0); }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.position.copy(arch.anchors.cctvMount).add(new THREE.Vector3(0.1, 0, 0.4));
  dust.frustumCulled = false;
  scene.add(dust);

  /* ---------- vehicle (seen at night / in IR: headlights + silhouette) ---------- */
  const car = new THREE.Group();
  const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.75, 4.8),
    new THREE.MeshPhysicalMaterial({ color: 0x0b0c0e, metalness: 0.8, roughness: 0.25, clearcoat: 1 }),
  );
  carBody.position.y = 0.62;
  car.add(carBody);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.55, 2.6),
    new THREE.MeshPhysicalMaterial({ color: 0x050607, metalness: 0.2, roughness: 0.05, clearcoat: 1 }),
  );
  cabin.position.set(0, 1.2, 0.2);
  car.add(cabin);
  const hlMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xeaf2ff).multiplyScalar(0) });
  for (const sx of [-0.72, 0.72]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.05), hlMat);
    hl.position.set(sx, 0.78, -2.41);
    car.add(hl);
  }
  const glowTex = radialSprite("rgba(235,242,255,1)", "rgba(235,242,255,0)");
  const flareMat = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, transparent: true });
  for (const sx of [-0.72, 0.72]) {
    const s = new THREE.Sprite(flareMat);
    s.position.set(sx, 0.78, -2.5);
    s.scale.setScalar(0.9);
    car.add(s);
  }
  const beam = new THREE.SpotLight(0xe8f0ff, 0, 40, 0.45, 0.7, 1.2);
  beam.position.set(0, 0.8, -2.4);
  const beamTarget = new THREE.Object3D();
  beamTarget.position.set(0, 0, -14);
  car.add(beam, beamTarget);
  beam.target = beamTarget;
  car.rotation.y = 0; // drives toward -Z
  scene.add(car);
  const carBox = new THREE.Box3();

  /* ---------- system overlay: nodes, links, coverage cones, perimeter beam ---------- */
  const system = new THREE.Group();
  scene.add(system);
  const nodeTex = radialSprite("rgba(255,236,205,1)", "rgba(255,236,205,0)");
  const nodeMat = new THREE.SpriteMaterial({ map: nodeTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0, color: 0xe3c48f });
  const devicePoints: THREE.Vector3[] = [
    arch.anchors.cctvMount.clone().add(new THREE.Vector3(0, 0.08, 0.2)),
    arch.anchors.panelMount.clone(),
    arch.anchors.stationMount.clone(),
    arch.anchors.touchPanelMount.clone(),
    arch.anchors.siren.clone(),
    ...arch.anchors.soffitDomes.map((p) => p.clone().add(new THREE.Vector3(0, -0.1, 0))),
    ...arch.anchors.pirs.map((p) => p.clone()),
  ];
  const hubPoint = arch.anchors.hub.clone().add(new THREE.Vector3(0, 0.1, 0));
  const nodes = [hubPoint, ...devicePoints].map((p, i) => {
    const s = new THREE.Sprite(nodeMat);
    s.position.copy(p);
    s.scale.setScalar(i === 0 ? 2.2 : 1.2);
    system.add(s);
    return s;
  });
  const linkUniforms = { uTime: { value: 0 }, uAlpha: { value: 0 } };
  const linkMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: linkUniforms,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uTime; uniform float uAlpha; varying vec2 vUv;
      void main(){
        float pulse = smoothstep(0.92, 1.0, fract(vUv.x * 3.0 - uTime * 0.6));
        vec3 base = vec3(0.89, 0.77, 0.56);
        float a = (0.45 + pulse * 2.2) * uAlpha;
        gl_FragColor = vec4(base * a, 1.0);
      }`,
  });
  for (const p of devicePoints) {
    const mid = hubPoint.clone().lerp(p, 0.5);
    mid.y = Math.max(hubPoint.y, p.y) + 1.6 + hubPoint.distanceTo(p) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(hubPoint, mid, p);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.03, 6, false), linkMat);
    tube.renderOrder = 20;
    system.add(tube);
  }
  // perimeter beam
  const beamMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3326), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const beamLine = new THREE.Mesh(new THREE.BoxGeometry(1, 0.012, 0.012), beamMat);
  const [b0, b1] = arch.beamPosts;
  beamLine.position.copy(b0).lerp(b1, 0.5);
  beamLine.scale.x = b0.distanceTo(b1);
  system.add(beamLine);
  const perimeter = new THREE.Mesh(new THREE.BoxGeometry(1, 0.01, 0.01), beamMat);
  perimeter.position.set(-25, 1.25, 34.2);
  perimeter.scale.x = 69;
  system.add(perimeter);

  // coverage cones (gradient volumes) for the hero camera and domes
  const coneUniforms = { uAlpha: { value: 0 } };
  const coneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: coneUniforms,
    vertexShader: `varying float vL; varying vec3 vN; varying vec3 vV;
      void main(){ vL = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uAlpha; varying float vL; varying vec3 vN; varying vec3 vV;
      void main(){ float edge = pow(1.0 - abs(dot(vN, vV)), 1.5); float fall = pow(vL, 1.6);
        gl_FragColor = vec4(vec3(0.95, 0.82, 0.6) * (0.015 + edge * 0.12) * fall * uAlpha, 1.0); }`,
  });
  const makeCone = (len: number, radius: number) => {
    const g = new THREE.ConeGeometry(radius, len, 48, 1, true);
    g.translate(0, -len / 2, 0); // apex at origin, opening along -Y
    g.rotateX(-Math.PI / 2); // opening along +Z
    return new THREE.Mesh(g, coneMat);
  };
  const heroCone = makeCone(12, 4.6);
  cctv.lensAnchor.add(heroCone);
  domes.forEach((d) => {
    const c = makeCone(3.2, 2.4);
    c.position.z = 0.07;
    d.add(c);
  });

  /* ---------- per-frame application ---------- */
  const tmp = new THREE.Vector3();
  const lensWorld = new THREE.Vector3();
  const apply = (s: WorldState) => {
    sky.uniforms.uBrightness.value = s.sky;
    (scene.fog as THREE.FogExp2).color.copy(fogColor).multiplyScalar(Math.max(0.02, s.sky));
    (scene.fog as THREE.FogExp2).density = s.fog;
    scene.environmentIntensity = s.envArch;
    hemi.intensity = 1.1 * s.sky;
    moon.intensity = 0.35 * s.sky;
    for (const m of deviceMats) if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) (m as THREE.MeshStandardMaterial).envMapIntensity = s.envDevice;
    arch.glass.envMapIntensity = 1.6 * s.envArch;

    arch.setLighting({ facade: s.facade, interior: s.interior, foyer: s.foyer, door: s.door, shades: s.shades, pool: s.pool, time: s.time });

    // hero camera
    cctv.head.rotation.y = s.cctvPan;
    cctv.head.rotation.x = s.cctvTilt;
    cctv.group.visible = s.cctvVisible;
    cctv.irLeds.emissiveIntensity = s.irGlow * 0.5;
    cctv.group.updateMatrixWorld(true);
    cctv.lensAnchor.getWorldPosition(lensWorld);

    // key light sweeps an arc in front of the camera, rim sits behind
    const a = THREE.MathUtils.lerp(-1.25, 1.1, s.keySweep);
    key.position.set(lensWorld.x + Math.sin(a) * 1.6, lensWorld.y + 0.9, lensWorld.z + Math.cos(a) * 1.2 - 0.1);
    keyTarget.position.copy(lensWorld).add(tmp.set(0, 0.02, -0.12));
    key.intensity = 9 * s.key;
    rim.position.set(lensWorld.x - 0.6, lensWorld.y + 0.7, lensWorld.z - 1.3);
    rimTarget.position.copy(lensWorld).add(tmp.set(0, 0.05, -0.15));
    rim.intensity = 14 * s.rim;

    dustMat.uniforms.uTime.value = s.time;
    dustMat.uniforms.uAlpha.value = s.dust;
    dust.visible = s.dust > 0.001;

    panel.setState(s.panel, s.panelT);
    touch.draw(s.touchScene);

    // vehicle: approaches along the driveway toward the house
    car.visible = s.car >= 0;
    if (car.visible) {
      car.position.copy(carPositionAt(s.car));
      hlMat.color.setRGB(1, 1, 1).multiplyScalar(2.5 * s.headlights);
      flareMat.opacity = 0.55 * s.headlights;
      beam.intensity = 70 * s.headlights;
    } else {
      beam.intensity = 0;
    }

    // system overlay
    system.visible = s.system > 0.001 || s.cones > 0.001;
    nodeMat.opacity = s.system;
    nodes.forEach((n, i) => n.scale.setScalar((i === 0 ? 2.2 : 1.1) * (1 + 0.15 * Math.sin(s.time * 3 + i))));
    linkUniforms.uTime.value = s.time;
    linkUniforms.uAlpha.value = s.system;
    beamMat.opacity = s.system * (0.75 + 0.25 * Math.sin(s.time * 8));
    coneUniforms.uAlpha.value = s.cones;
  };

  const projectCar = (camera: THREE.Camera) => {
    if (!car.visible) return null;
    carBox.setFromObject(carBody);
    carBox.expandByObject(cabin);
    const pts = [
      new THREE.Vector3(carBox.min.x, carBox.min.y, carBox.min.z), new THREE.Vector3(carBox.max.x, carBox.max.y, carBox.max.z),
      new THREE.Vector3(carBox.min.x, carBox.max.y, carBox.min.z), new THREE.Vector3(carBox.max.x, carBox.min.y, carBox.max.z),
      new THREE.Vector3(carBox.min.x, carBox.min.y, carBox.max.z), new THREE.Vector3(carBox.max.x, carBox.max.y, carBox.min.z),
    ];
    let x0 = 1, y0 = 1, x1 = -1, y1 = -1;
    for (const p of pts) {
      p.project(camera);
      if (p.z > 1) return null;
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    return { x: (x0 + 1) / 2, y: (1 - y1) / 2, w: (x1 - x0) / 2, h: (y1 - y0) / 2, dist: camera.position.distanceTo(car.position) };
  };

  return {
    scene,
    apply,
    cctv,
    lensWorld,
    panelPos: arch.anchors.panelMount,
    doorPos: new THREE.Vector3(6.8, 1.6, -0.4),
    projectCar,
    carPosition: car.position,
    dispose: () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      nightEnv.dispose();
      studioEnv.dispose();
    },
  };
}

export type World = ReturnType<typeof createWorld>;
