"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { noiseTexture } from "./textures";

/**
 * Procedural bullet camera, modelled on real commercial housings
 * (sun-shield, recessed multi-coated lens, IR array, ceiling ball-joint mount).
 * Local +Z is the optical axis. Dimensions in metres (≈ 32 cm long body).
 *
 * Production path: replace <Head/> with a scanned/CAD GLB of the exact model
 * S Tec Secure installs (Draco + KTX2), keeping the same pivot convention.
 */

export function useCameraMaterials() {
  return useMemo(() => {
    const micro = noiseTexture("micro", { size: 256, octaves: 5, contrast: 0.35, repeat: 3, seed: 21 });
    const housing = new THREE.MeshPhysicalMaterial({
      color: "#e6e7e8",
      metalness: 0.0,
      roughness: 0.34,
      roughnessMap: micro,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      sheen: 0.0,
    });
    const graphite = new THREE.MeshPhysicalMaterial({
      color: "#1c1f23",
      metalness: 0.85,
      roughness: 0.3,
      roughnessMap: micro,
      clearcoat: 0.4,
      clearcoatRoughness: 0.18,
    });
    const blackGloss = new THREE.MeshPhysicalMaterial({
      color: "#050607",
      metalness: 0.1,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    const coverGlass = new THREE.MeshPhysicalMaterial({
      color: "#0a0d11",
      metalness: 0,
      roughness: 0.02,
      transmission: 0,
      transparent: true,
      opacity: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2.4,
      ior: 1.52,
      depthWrite: false,
    });
    const lensCoating = new THREE.MeshPhysicalMaterial({
      color: "#070a12",
      metalness: 0.35,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0,
      iridescence: 1,
      iridescenceIOR: 1.85,
      iridescenceThicknessRange: [180, 620],
      envMapIntensity: 2.2,
    });
    coverGlass.userData.env = 2.2;
    lensCoating.userData.env = 2.4;
    blackGloss.userData.env = 1.6;
    const irLed = new THREE.MeshPhysicalMaterial({
      color: "#0b0506",
      emissive: "#4a0906",
      emissiveIntensity: 0.0,
      roughness: 0.15,
      clearcoat: 1,
    });
    const statusLed = new THREE.MeshStandardMaterial({ color: "#0a1a20", emissive: "#5fd4ff", emissiveIntensity: 2.2 });
    const rubber = new THREE.MeshStandardMaterial({ color: "#0d0e10", roughness: 0.9 });
    return { housing, graphite, blackGloss, coverGlass, lensCoating, irLed, statusLed, rubber };
  }, []);
}

type Mats = ReturnType<typeof useCameraMaterials>;

/** The rotating camera head. forwardRef so the rig can aim/pan it. */
export const CameraHead = forwardRef<THREE.Group, { m: Mats }>(function CameraHead({ m }, ref) {
  const shieldGeo = useMemo(() => {
    // open cylinder arc = sun shield, top 200°
    const g = new THREE.CylinderGeometry(0.094, 0.094, 0.4, 96, 1, true, Math.PI * 0.445, Math.PI * 1.11);
    g.rotateX(Math.PI / 2); // axis → Z, arc centred on +Y (top)
    return g;
  }, []);
  const lensCap = useMemo(() => new THREE.SphereGeometry(0.034, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.32), []);
  const leds = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return [Math.cos(a) * 0.052, Math.sin(a) * 0.052] as const;
      }),
    [],
  );

  return (
    <group ref={ref}>
      {/* body */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={m.housing}>
        <cylinderGeometry args={[0.078, 0.08, 0.3, 96, 1, true]} />
      </mesh>
      {/* rear dome cap */}
      <mesh castShadow position={[0, 0, -0.15]} scale={[1, 1, 0.42]} material={m.housing}>
        <sphereGeometry args={[0.08, 64, 32]} />
      </mesh>
      {/* seam ring */}
      <mesh position={[0, 0, -0.105]} rotation={[0, 0, 0]} material={m.graphite}>
        <torusGeometry args={[0.0795, 0.0018, 12, 96]} />
      </mesh>
      {/* sun shield */}
      <mesh castShadow geometry={shieldGeo} position={[0, 0.006, 0.03]} material={m.housing} />
      <mesh geometry={shieldGeo} position={[0, 0.006, 0.03]} scale={[0.985, 0.985, 1]} material={m.graphite} />

      {/* front bezel */}
      <mesh position={[0, 0, 0.152]} material={m.blackGloss}>
        <torusGeometry args={[0.07, 0.0085, 24, 96]} />
      </mesh>
      <mesh position={[0, 0, 0.146]} rotation={[Math.PI / 2, 0, 0]} material={m.blackGloss}>
        <cylinderGeometry args={[0.071, 0.071, 0.008, 96]} />
      </mesh>

      {/* lens barrel + coated element */}
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={m.graphite}>
        <cylinderGeometry args={[0.037, 0.04, 0.03, 64, 1, true]} />
      </mesh>
      <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={m.lensCoating} geometry={lensCap} />
      <mesh position={[0, 0, 0.1535]} material={m.blackGloss}>
        <torusGeometry args={[0.038, 0.003, 12, 64]} />
      </mesh>
      <mesh position={[0, 0, 0.128]} rotation={[Math.PI / 2, 0, 0]} material={m.blackGloss}>
        <cylinderGeometry args={[0.0372, 0.0372, 0.004, 64]} />
      </mesh>
      <mesh position={[0, 0, 0.1485]} material={m.graphite}>
        <ringGeometry args={[0.03, 0.037, 64]} />
      </mesh>

      {/* IR array */}
      {leds.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.1505]} rotation={[Math.PI / 2, 0, 0]} material={m.irLed}>
          <cylinderGeometry args={[0.0048, 0.0048, 0.003, 24]} />
        </mesh>
      ))}
      {/* status LED */}
      <mesh position={[0, -0.028 - 0.024, 0.152]} material={m.statusLed}>
        <sphereGeometry args={[0.0028, 16, 16]} />
      </mesh>

      {/* cover glass */}
      <mesh position={[0, 0, 0.158]} material={m.coverGlass}>
        <circleGeometry args={[0.066, 96]} />
      </mesh>

      {/* underside bracket + cable gland */}
      <RoundedBox args={[0.05, 0.03, 0.12]} radius={0.01} smoothness={4} position={[0, 0.085, -0.02]} material={m.housing} castShadow />
      <mesh position={[0, -0.07, -0.11]} rotation={[0.4, 0, 0]} material={m.rubber}>
        <cylinderGeometry args={[0.011, 0.011, 0.05, 24]} />
      </mesh>
    </group>
  );
});

/** Ceiling mount: plate + drop arm + ball joint. Head attaches at the ball. */
export function CeilingMount({ m }: { m: Mats }) {
  return (
    <group>
      <RoundedBox args={[0.17, 0.028, 0.17]} radius={0.012} smoothness={4} position={[0, 0, 0]} material={m.housing} castShadow receiveShadow />
      {[
        [0.06, 0.06],
        [-0.06, 0.06],
        [0.06, -0.06],
        [-0.06, -0.06],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.015, z]} material={m.graphite}>
          <cylinderGeometry args={[0.006, 0.006, 0.004, 16]} />
        </mesh>
      ))}
      <mesh position={[0, -0.09, 0]} material={m.housing} castShadow>
        <cylinderGeometry args={[0.022, 0.026, 0.16, 48]} />
      </mesh>
      <mesh position={[0, -0.175, 0]} material={m.graphite} castShadow>
        <sphereGeometry args={[0.03, 48, 32]} />
      </mesh>
    </group>
  );
}
