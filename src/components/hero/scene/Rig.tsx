"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { heroStore, setAnchor } from "@/lib/heroStore";
import { ramp, SCENES } from "@/config/heroTimeline";
import { W, SUBJECT, subjectState } from "./world";
import { CameraHead, CeilingMount, useCameraMaterials } from "./CCTVCamera";
import { NETWORK_NODES } from "./Network";

/** Shared per-frame camera effects state (read by post-processing). */
export const camFx = { focus: new THREE.Vector3(), bokeh: 4, focusDist: 1 };

/* ------------------------------------------------------------------ path */
const C = W.cctv;
const dir = W.cctvAim.clone().sub(C).normalize();
const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
const up = new THREE.Vector3(0, 1, 0);
const off = (d: number, r: number, u: number) => C.clone().addScaledVector(dir, d).addScaledVector(right, r).addScaledVector(up, u);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Key = { p: number; pos: THREE.Vector3; tgt: THREE.Vector3; fov: number };
const KEYS: Key[] = [
  { p: 0.0, pos: off(0.3, 1.3, 0.02), tgt: off(0.02, 0, 0), fov: 24 },
  { p: 0.1, pos: off(0.75, 0.95, -0.06), tgt: off(0.04, 0, 0), fov: 24 },
  { p: 0.19, pos: off(1.0, 0.5, -0.16), tgt: off(0.04, -0.02, 0.08), fov: 25 },
  { p: 0.26, pos: off(2.0, -0.2, 0.2), tgt: off(0.6, -0.1, -0.1), fov: 30 },
  { p: 0.34, pos: v(16.5, 4.0, 22.5), tgt: v(0.2, 2.1, 3.0), fov: 33 },
  { p: 0.42, pos: v(13.2, 5.1, 19.6), tgt: v(1.6, 1.0, 8.0), fov: 33 },
  { p: 0.5, pos: v(9.8, 4.1, 17.2), tgt: v(0.9, 0.95, 9.4), fov: 31 },
  { p: 0.58, pos: v(-0.6, 2.0, 11.6), tgt: v(-3.7, 1.3, 5.2), fov: 34 },
  { p: 0.632, pos: v(-3.35, 1.62, 7.6), tgt: v(-4.0, 1.25, 4.4), fov: 30 },
  { p: 0.67, pos: v(-3.6, 1.75, 8.9), tgt: v(-4.7, 1.45, 3.9), fov: 34 },
  { p: 0.735, pos: v(4.6, 1.8, 11.8), tgt: v(2.3, 1.7, 1.0), fov: 36 },
  { p: 0.785, pos: v(7.4, 2.8, 15.6), tgt: v(1.5, 2.2, 1.8), fov: 38 },
  { p: 0.855, pos: v(4.5, 11.5, 23.5), tgt: v(-0.8, 4.3, 4.0), fov: 38 },
  { p: 0.93, pos: v(-6.5, 4.4, 25.0), tgt: v(-5.0, 3.0, 2.5), fov: 32 },
  { p: 1.0, pos: v(-9.0, 3.5, 26.5), tgt: v(-7.2, 3.1, 2.0), fov: 30 },
];
const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => k.pos),
  false,
  "centripetal",
);
const tgtCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => k.tgt),
  false,
  "centripetal",
);

function keyParam(p: number) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i],
    b = KEYS[i + 1];
  const lt = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
  const eased = lt * 0.45 + (lt * lt * (3 - 2 * lt)) * 0.55;
  return { u: (i + eased) / (KEYS.length - 1), fov: THREE.MathUtils.lerp(a.fov, b.fov, eased) };
}

/* ------------------------------------------------------------------ FOV cone + zones */
function SurveillanceViz() {
  const cone = useRef<THREE.Mesh>(null);
  const zone = useRef<THREE.LineLoop>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const subj = useMemo(() => new THREE.Vector3(), []);

  const coneGeo = useMemo(() => {
    // frustum from lens to a ground quad
    const quad = [v(-3.6, 0.03, 13.4), v(8.6, 0.03, 13.4), v(6.6, 0.03, 6.8), v(-0.6, 0.03, 6.8)];
    const pts: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = quad[i],
        b = quad[(i + 1) % 4];
      pts.push(C.x, C.y, C.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.computeVertexNormals();
    return { g, quad };
  }, []);
  const zoneObj = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(coneGeo.quad);
    const m = new THREE.LineBasicMaterial({ color: "#5fd4ff", transparent: true, opacity: 0, toneMapped: false });
    return new THREE.LineLoop(g, m);
  }, [coneGeo]);

  useFrame(({ clock }) => {
    const p = heroStore.current;
    const t = clock.elapsedTime;
    const on = ramp(p, 0.3, 0.37) * (1 - ramp(p, 0.54, 0.58));
    (cone.current!.material as THREE.MeshBasicMaterial).opacity = 0.014 * on;
    (zoneObj.material as THREE.LineBasicMaterial).opacity = 0.35 * on;
    const s = subjectState(p, subj);
    const det = ramp(p, 0.42, 0.44) * (1 - ramp(p, 0.56, 0.6));
    const r = ring.current!,
      r2 = ring2.current!;
    r.position.set(subj.x, 0.03, subj.z);
    r2.position.copy(r.position);
    r.visible = r2.visible = s.visible;
    (r.material as THREE.MeshBasicMaterial).opacity = det * 0.85;
    const k = (t * 0.8) % 1;
    r2.scale.setScalar(1 + k * 1.6);
    (r2.material as THREE.MeshBasicMaterial).opacity = det * (1 - k) * 0.5;
  });

  return (
    <group>
      <mesh ref={cone} geometry={coneGeo.g}>
        <meshBasicMaterial color="#5fd4ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <primitive ref={zone} object={zoneObj} />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.54, 96]} />
        <meshBasicMaterial color="#5fd4ff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={ring2} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.535, 96]} />
        <meshBasicMaterial color="#5fd4ff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ Rig */
export default function Rig() {
  const { camera, scene, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const m = useCameraMaterials();
  const head = useRef<THREE.Group>(null);
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const edge = useRef<THREE.PointLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<THREE.Mesh>(null);
  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uAmt: { value: 0 } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `varying vec3 vP; uniform float uAmt;
          void main(){
            float h = clamp(vP.y, -0.2, 1.0);
            // blue hour: deep navy zenith, slate horizon
            vec3 zen = vec3(0.01,0.016,0.03);
            vec3 hor = vec3(0.045,0.062,0.092);
            vec3 c = mix(hor, zen, smoothstep(-0.02, 0.45, h));
            c += vec3(0.05,0.04,0.03) * exp(-abs(h)*18.0) * 0.6; // city glow at the horizon
            gl_FragColor = vec4(c * uAmt, 1.0);
          }`,
      }),
    [],
  );

  const s = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      look: new THREE.Vector3(),
      aimCur: W.cctvAim.clone(),
      subj: new THREE.Vector3(),
      proj: new THREE.Vector3(),
      mouse: new THREE.Vector2(),
      q: new THREE.Quaternion(),
    }),
    [],
  );

  const keyTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(C);
    return o;
  }, []);

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#020304", 0.03);
    scene.background = new THREE.Color("#000000");
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const project = (name: string, p: THREE.Vector3) => {
    s.proj.copy(p).project(cam);
    const vis = s.proj.z < 1 && Math.abs(s.proj.x) < 1.2 && Math.abs(s.proj.y) < 1.2;
    setAnchor(name, (s.proj.x * 0.5 + 0.5) * size.width, (-s.proj.y * 0.5 + 0.5) * size.height, vis);
  };

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const p = heroStore.current;
    const reduced = heroStore.reducedMotion;

    // ---------------- camera path
    const { u, fov } = keyParam(p);
    posCurve.getPoint(u, s.pos);
    tgtCurve.getPoint(u, s.tgt);
    // pointer parallax (scaled down in macro shots) + operator micro-movement
    const macro = 1 - ramp(p, 0.24, 0.32);
    s.mouse.lerp(new THREE.Vector2(heroStore.pointer.x, heroStore.pointer.y), 1 - Math.pow(0.02, dt));
    const par = reduced ? 0 : THREE.MathUtils.lerp(0.35, 0.04, macro);
    s.pos.addScaledVector(right, s.mouse.x * par);
    s.pos.y += s.mouse.y * par * 0.5;
    if (!reduced) {
      const hh = THREE.MathUtils.lerp(0.014, 0.0025, macro);
      s.pos.x += (Math.sin(t * 0.61) + Math.sin(t * 1.37) * 0.5) * hh;
      s.pos.y += (Math.sin(t * 0.83 + 1.3) + Math.sin(t * 1.91) * 0.4) * hh;
      s.tgt.x += Math.sin(t * 0.47 + 2.1) * hh * 0.6;
    }
    cam.position.copy(s.pos);
    cam.lookAt(s.tgt);
    const aspectBoost = size.width / size.height < 1 ? 1.45 : 1; // portrait: widen
    cam.fov = fov * aspectBoost;
    // lens shift: slides the product right of frame while the headline sits left
    const landscape = size.width / size.height > 1.1;
    cam.filmOffset = landscape ? -6 * ramp(p, 0.11, 0.17) * (1 - ramp(p, 0.25, 0.31)) : 0;
    cam.updateProjectionMatrix();

    // ---------------- DoF focus
    const subjS = subjectState(p, s.subj);
    camFx.focus.copy(s.tgt);
    if (p < 0.27 && head.current) camFx.focus.copy(C).addScaledVector(head.current.getWorldDirection(s.look), 0.1);
    camFx.focusDist = cam.position.distanceTo(camFx.focus);
    camFx.bokeh = THREE.MathUtils.lerp(1.0, 3.2, macro);

    // ---------------- CCTV head behaviour
    // reveal: slow rotation; surveillance: sweep; intelligence: track subject
    const reveal = ramp(p, 0.04, 0.26);
    const tracking = ramp(p, 0.425, 0.45) * (1 - ramp(p, 0.6, 0.64));
    const sweep = ramp(p, 0.28, 0.33) * (1 - tracking);
    const aimBase = W.cctvAim.clone();
    aimBase.x += (1 - reveal) * 5.5 - reveal * 0.8; // rotates from off-axis to the lens facing the forecourt
    aimBase.y += (1 - reveal) * 1.6;
    aimBase.x += Math.sin(t * 0.35) * 2.2 * sweep;
    const aim = aimBase.lerp(s.subj.clone().setY(0.9), subjS.visible ? tracking : 0);
    s.aimCur.lerp(aim, 1 - Math.pow(0.08, dt));
    if (head.current) {
      head.current.position.copy(C);
      head.current.lookAt(s.aimCur);
    }
    // IR glow comes on as the scene darkens into night surveillance
    m.irLed.emissiveIntensity = 0.05 + 0.25 * ramp(p, 0.1, 0.2);

    // ---------------- lighting choreography
    const closeKey = ramp(p, 0.035, 0.15) * (1 - ramp(p, 0.3, 0.38));
    const ext = ramp(p, 0.23, 0.34);
    if (key.current) key.current.intensity = 5.5 * closeKey;
    if (rim.current) rim.current.intensity = 9 * closeKey + 0.4 * ramp(p, 0.01, 0.06);
    if (edge.current) edge.current.intensity = 0.25 * closeKey;
    if (moon.current) moon.current.intensity = 0.02 + 1.5 * ext;
    if (fill.current) fill.current.intensity = 0.35 * ext;
    if (sky.current) (sky.current.material as THREE.ShaderMaterial).uniforms.uAmt.value = ext;
    if (hemi.current) hemi.current.intensity = 0.01 + 0.3 * ext;
    // architecture gets a low, night-level env; the product gets its own studio reflections
    (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = 0.015 + 0.14 * ext;
    if (scene.environment) {
      for (const mat of Object.values(m)) {
        const mm = mat as THREE.MeshStandardMaterial;
        if (mm.envMap !== scene.environment) {
          mm.envMap = scene.environment;
          mm.needsUpdate = true;
        }
        mm.envMapIntensity = (mm.userData.env ?? 1) * (0.03 + 1.6 * closeKey + 0.2 * ext);
      }
    }
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = THREE.MathUtils.lerp(0.14, 0.022, ramp(p, 0.2, 0.34));
      scene.fog.color.setRGB(0.008 + 0.037 * ext, 0.012 + 0.05 * ext, 0.016 + 0.076 * ext);
    }

    // ---------------- anchors for DOM overlays
    project("cctv", C);
    const top = s.subj.clone().setY(1.9);
    const bot = s.subj.clone().setY(0);
    project("subjTop", top);
    project("subjBot", bot);
    const st = heroStore.anchors.subjTop;
    if (st) st.visible = st.visible && subjS.visible;
    project("reader", W.reader);
    project("door", new THREE.Vector3(W.door.x, 2.4, W.door.z));
    project("lights", new THREE.Vector3(0.4, 3.0, -1.2));
    project("curtains", new THREE.Vector3(5.6, 2.3, 4.2));
    project("climate", new THREE.Vector3(-1.4, 1.6, -2));
    project("hub", W.hub);
    NETWORK_NODES.forEach((n) => project("n-" + n.id, n.pos));
    project("zone", new THREE.Vector3(2.4, 0, 12.6));
    heroStore.onAnchors?.();
  });

  // key light geometry around the camera for the macro reveal
  const keyPos = off(0.9, 1.1, 1.0);
  const rimPos = off(-0.9, -0.7, 0.55);
  const edgePos = off(0.2, -0.7, -0.5);

  return (
    <group>
      {/* mount + head */}
      <group position={[C.x, W.cctvMountY, C.z]}>
        <CeilingMount m={m} />
      </group>
      <CameraHead ref={head} m={m} />

      <primitive object={keyTarget} />
      <spotLight ref={key} position={keyPos} target={keyTarget} angle={0.35} penumbra={1} distance={6} decay={2} color="#f3f1ec" intensity={0} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.00008} shadow-normalBias={0.0015} shadow-camera-near={0.3} shadow-camera-far={4} />
      <spotLight ref={rim} position={rimPos} target={keyTarget} angle={0.5} penumbra={1} distance={6} decay={2} color="#9fd6ff" intensity={0} />
      <pointLight ref={edge} position={edgePos} color="#5fd4ff" intensity={0} distance={1.6} decay={2} />

      <mesh ref={sky} material={skyMat} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[150, 32, 16]} />
      </mesh>
      <directionalLight ref={fill} position={[14, 9, 26]} color="#9fb3cc" intensity={0} />
      <hemisphereLight ref={hemi} args={["#324458", "#0b0b0c", 0.01]} />
      <directionalLight
        ref={moon}
        position={[-18, 22, -10]}
        color="#a9bcd6"
        intensity={0.02}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      <SurveillanceViz />
    </group>
  );
}

export { SCENES, SUBJECT };
