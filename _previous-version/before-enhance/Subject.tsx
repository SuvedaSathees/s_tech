"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { heroStore } from "@/lib/heroStore";
import { ramp } from "@/config/heroTimeline";
import { SUBJECT, subjectState } from "./world";

/**
 * Stand-in resident (long coat, night silhouette). Scroll-scrubbed gait:
 * stride is driven by distance travelled, so feet never slide.
 * Production: swap for a scanned, rigged GLB human with a baked walk cycle
 * (Mixamo / RenderPeople), keeping `subjectState()` as the driver.
 */
export default function Subject() {
  const root = useRef<THREE.Group>(null);
  const j = {
    thighL: useRef<THREE.Group>(null),
    thighR: useRef<THREE.Group>(null),
    kneeL: useRef<THREE.Group>(null),
    kneeR: useRef<THREE.Group>(null),
    armL: useRef<THREE.Group>(null),
    armR: useRef<THREE.Group>(null),
    elbowL: useRef<THREE.Group>(null),
    elbowR: useRef<THREE.Group>(null),
  };
  const pos = useMemo(() => new THREE.Vector3(), []);
  const m = useMemo(
    () => ({
      coat: new THREE.MeshStandardMaterial({ color: "#131417", roughness: 0.86 }),
      trouser: new THREE.MeshStandardMaterial({ color: "#0d0e10", roughness: 0.8 }),
      skin: new THREE.MeshStandardMaterial({ color: "#5a4033", roughness: 0.55 }),
      hair: new THREE.MeshStandardMaterial({ color: "#0b0a09", roughness: 0.7 }),
      shoe: new THREE.MeshPhysicalMaterial({ color: "#060606", roughness: 0.3, clearcoat: 0.8 }),
    }),
    [],
  );
  const coatGeo = useMemo(() => {
    // flared long coat, hem at knee height
    const pts = [
      [0.235, 0],
      [0.215, 0.18],
      [0.19, 0.38],
      [0.185, 0.52],
      [0.205, 0.64],
      [0.215, 0.7],
      [0.13, 0.76],
      [0.06, 0.79],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, 48);
    g.scale(1, 1, 0.62);
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame(() => {
    const p = heroStore.current;
    const s = subjectState(p, pos);
    const g = root.current!;
    g.visible = s.visible;
    g.position.copy(pos);
    g.rotation.y = s.heading;
    const ph = (s.walkDist / 0.74) * Math.PI;
    const a = s.moving ? 1 : 0;
    const sw = Math.sin(ph) * 0.42 * a;
    j.thighL.current!.rotation.x = sw;
    j.thighR.current!.rotation.x = -sw;
    j.kneeL.current!.rotation.x = Math.max(0, -Math.sin(ph)) * 0.7 * a;
    j.kneeR.current!.rotation.x = Math.max(0, Math.sin(ph)) * 0.7 * a;
    j.armL.current!.rotation.x = -sw * 0.55;
    j.elbowL.current!.rotation.x = -0.18 - Math.max(0, sw) * 0.3;
    const reach =
      ramp(p, SUBJECT.verify[0], SUBJECT.verify[0] + 0.012) * (1 - ramp(p, SUBJECT.verify[1] + 0.004, SUBJECT.verify[1] + 0.014));
    j.armR.current!.rotation.x = sw * 0.55 * (1 - reach) - reach * 0.7;
    j.armR.current!.rotation.z = reach * 0.25;
    j.elbowR.current!.rotation.x = -0.18 * (1 - reach) - reach * 1.0;
    g.position.y = Math.abs(Math.cos(ph)) * 0.022 * a;
  });

  const Leg = ({ side, thigh, knee }: { side: number; thigh: React.RefObject<THREE.Group | null>; knee: React.RefObject<THREE.Group | null> }) => (
    <group ref={thigh} position={[side * 0.095, 0.94, 0]}>
      <mesh position={[0, -0.22, 0]} castShadow material={m.trouser}>
        <capsuleGeometry args={[0.072, 0.34, 6, 16]} />
      </mesh>
      <group ref={knee} position={[0, -0.46, 0]}>
        <mesh position={[0, -0.21, 0]} castShadow material={m.trouser}>
          <capsuleGeometry args={[0.056, 0.34, 6, 16]} />
        </mesh>
        <mesh position={[0, -0.44, 0.05]} castShadow material={m.shoe}>
          <boxGeometry args={[0.095, 0.06, 0.27]} />
        </mesh>
      </group>
    </group>
  );
  const Arm = ({ side, arm, elbow }: { side: number; arm: React.RefObject<THREE.Group | null>; elbow: React.RefObject<THREE.Group | null> }) => (
    <group ref={arm} position={[side * 0.215, 1.46, 0]}>
      <mesh position={[0, -0.15, 0]} castShadow material={m.coat}>
        <capsuleGeometry args={[0.052, 0.22, 6, 16]} />
      </mesh>
      <group ref={elbow} position={[0, -0.3, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow material={m.coat}>
          <capsuleGeometry args={[0.045, 0.2, 6, 16]} />
        </mesh>
        <mesh position={[0, -0.29, 0.01]} scale={[0.7, 1.1, 0.45]} material={m.skin}>
          <sphereGeometry args={[0.05, 16, 12]} />
        </mesh>
      </group>
    </group>
  );

  return (
    <group ref={root}>
      <Leg side={-1} thigh={j.thighL} knee={j.kneeL} />
      <Leg side={1} thigh={j.thighR} knee={j.kneeR} />
      {/* coat body */}
      <mesh geometry={coatGeo} position={[0, 0.7, 0]} castShadow material={m.coat} />
      {/* shoulders */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.19, 1.44, 0]} scale={[1, 0.8, 0.9]} castShadow material={m.coat}>
          <sphereGeometry args={[0.075, 20, 16]} />
        </mesh>
      ))}
      {/* collar */}
      <mesh position={[0, 1.5, 0]} material={m.coat}>
        <cylinderGeometry args={[0.075, 0.1, 0.08, 24, 1, true]} />
      </mesh>
      <Arm side={-1} arm={j.armL} elbow={j.elbowL} />
      <Arm side={1} arm={j.armR} elbow={j.elbowR} />
      {/* neck + head */}
      <mesh position={[0, 1.555, 0]} material={m.skin}>
        <cylinderGeometry args={[0.047, 0.052, 0.09, 16]} />
      </mesh>
      <mesh position={[0, 1.665, 0.01]} scale={[0.86, 1.08, 0.98]} castShadow material={m.skin}>
        <sphereGeometry args={[0.1, 32, 24]} />
      </mesh>
      <mesh position={[0, 1.685, -0.012]} scale={[0.88, 1.0, 0.99]} rotation={[-0.35, 0, 0]} material={m.hair}>
        <sphereGeometry args={[0.1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
    </group>
  );
}
