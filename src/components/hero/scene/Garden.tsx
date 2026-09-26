"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroStore } from "@/lib/heroStore";
import { ramp } from "@/config/heroTimeline";
import { noiseTexture } from "./textures";

/**
 * Landscape + atmosphere layer (added in the enhancement pass):
 *  - Italian cypress silhouettes with a warm garden uplight baked into the shader
 *  - volumetric light shafts under the soffit downlights
 *  - pool water with underwater lights that switch on in the automation scene
 * Everything is driven by the same hero progress as the rest of the scene.
 */

/* ------------------------------------------------------------ cypress geometry */
function useCypressGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const base = Math.min(1, t / 0.06);
      // columnar Italian cypress: near-constant width, soft rounded crown
      const top = Math.pow(Math.max(0, 1 - Math.pow(t, 5)), 0.5);
      const r = 0.62 * Math.sqrt(base) * top * (1 - t * 0.28);
      pts.push(new THREE.Vector2(Math.max(r, 0.01), t * 8.5));
    }
    const g = new THREE.LatheGeometry(pts, 44);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.z, v.x);
      // foliage clumps: layered angular + vertical ripples
      const n =
        1 +
        0.1 * Math.sin(a * 5 + v.y * 1.7) +
        0.09 * Math.sin(a * 11 - v.y * 4.3) +
        0.07 * Math.sin(a * 23 + v.y * 9.0) +
        0.05 * Math.sin(v.y * 13.0 + a * 3);
      p.setXYZ(i, v.x * n, v.y, v.z * n);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

const TREES: [number, number, number][] = [
  // x, z, scale — behind and beside the villa, framing it without blocking the camera path
  // behind the house only — silhouettes against the sky, never in front of a hero frame
  [-9.6, -8.4, 0.95],
  [-6.8, -9.4, 0.85],
  [-2.8, -8.8, 1.0],
  [1.8, -9.4, 0.9],
  [6.2, -8.6, 1.02],
  [10.4, -7.4, 0.92],
  [13.6, -3.4, 1.05],
];

function Cypresses() {
  const geo = useCypressGeometry();
  const uplight = useMemo(() => ({ value: 0 }), []);
  const mat = useMemo(() => {
    const n = noiseTexture("leaf", { size: 256, octaves: 6, contrast: 0.9, repeat: 6, seed: 33 });
    const m = new THREE.MeshStandardMaterial({ color: "#0c130e", roughness: 0.98, roughnessMap: n, bumpMap: n, bumpScale: 3.5 });
    m.onBeforeCompile = (s) => {
      s.uniforms.uUp = uplight;
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vH;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvH = position.y;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vH;\nuniform float uUp;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0,0.6,0.32) * uUp * 0.025 * exp(-vH * 0.9) * (0.55 + 0.45 * vNormal.z);",
        );
    };
    return m;
  }, [uplight]);

  const mesh = useMemo(() => {
    const im = new THREE.InstancedMesh(geo, mat, TREES.length);
    const o = new THREE.Object3D();
    TREES.forEach(([x, z, s], i) => {
      o.position.set(x, 0, z);
      o.rotation.set(0, i * 1.7, 0);
      o.scale.set(s, s * (0.95 + (i % 3) * 0.07), s);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    im.castShadow = true;
    im.receiveShadow = true;
    return im;
  }, [geo, mat]);

  useFrame(() => {
    uplight.value = ramp(heroStore.current, 0.23, 0.34);
  });

  return <primitive object={mesh} />;
}

/* ------------------------------------------------------------ light shafts */
const SHAFTS: [number, number, number][] = [
  [-2.2, 3.36, 5.6],
  [0.6, 3.36, 5.6],
  [3.4, 3.36, 5.6],
  [6.2, 3.36, 5.6],
];

function LightShafts() {
  const uniforms = useMemo(() => ({ uAlpha: { value: 0 } }), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
        uniforms,
        vertexShader: `varying float vL; varying vec3 vN; varying vec3 vV;
          void main(){ vL = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uAlpha; varying float vL; varying vec3 vN; varying vec3 vV;
          void main(){
            float facing = pow(abs(dot(vN, vV)), 1.4);   // brighter through the core of the beam
            float fall = pow(vL, 1.8);                    // fades out toward the ground
            gl_FragColor = vec4(vec3(1.0, 0.78, 0.55) * facing * fall * uAlpha * 0.075, 1.0);
          }`,
      }),
    [uniforms],
  );
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.05, 1.15, 3.0, 48, 1, true);
    g.translate(0, -1.5, 0); // apex at the fixture
    return g;
  }, []);

  useFrame(() => {
    const p = heroStore.current;
    uniforms.uAlpha.value = ramp(p, 0.24, 0.34) * (1 - 0.5 * ramp(p, 0.8, 0.86) * (1 - ramp(p, 0.9, 0.95)));
  });

  return (
    <group>
      {SHAFTS.map((pos, i) => (
        <mesh key={i} geometry={geo} material={mat} position={pos} renderOrder={5} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ pool */
function PoolWater() {
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const ripple = useMemo(() => {
    const t = noiseTexture("ripple", { size: 256, octaves: 5, contrast: 0.8, repeat: 3, seed: 51 });
    return t;
  }, []);
  useFrame(({ clock }) => {
    const p = heroStore.current;
    const t = clock.elapsedTime;
    const on = ramp(p, 0.72, 0.76);
    const night = ramp(p, 0.23, 0.34);
    ripple.offset.set(t * 0.012, t * 0.007);
    if (mat.current) mat.current.emissiveIntensity = 0.06 * night + 1.3 * on;
    if (light.current) light.current.intensity = 6 * on;
  });
  return (
    <group position={[7.2, 0, 8.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[5.8, 2.3]} />
        <meshPhysicalMaterial
          ref={mat}
          color="#06161b"
          emissive="#1f7f8f"
          emissiveIntensity={0}
          roughness={0.05}
          roughnessMap={ripple}
          bumpMap={ripple}
          bumpScale={0.35}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.4}
        />
      </mesh>
      <pointLight ref={light} position={[0, 0.35, 0]} color="#4fd2e6" intensity={0} distance={5} decay={2} />
    </group>
  );
}

export default function Garden({ quality }: { quality: "high" | "low" }) {
  return (
    <group>
      <Cypresses />
      {quality === "high" && <LightShafts />}
      <PoolWater />
    </group>
  );
}
