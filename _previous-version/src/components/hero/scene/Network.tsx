"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { heroStore } from "@/lib/heroStore";
import { ramp, SCENES } from "@/config/heroTimeline";
import { W } from "./world";

/**
 * Scene 08 — the ecosystem is drawn between the ACTUAL devices already in the
 * scene (camera, reader, door phone, siren, automation) and a hub above the
 * house. It's not decoration: every line is a real integration.
 */
export const NETWORK_NODES = [
  { id: "cctv", label: "CCTV", pos: W.cctv },
  { id: "access", label: "Access Control", pos: W.reader },
  { id: "automation", label: "Home Automation", pos: W.automation },
  { id: "doorphone", label: "Video Door Phone", pos: W.doorPhone },
  { id: "alarm", label: "Burglar Alarm", pos: W.siren },
] as const;

const CYAN = new THREE.Color("#5fd4ff");

export default function Network() {
  const [a, b] = SCENES.ecosystem;
  const curves = useMemo(
    () =>
      NETWORK_NODES.map((n) => {
        const mid = n.pos.clone().lerp(W.hub, 0.5);
        mid.y += 1.6;
        return new THREE.QuadraticBezierCurve3(n.pos.clone(), mid, W.hub.clone());
      }),
    [],
  );
  const lines = useMemo(
    () =>
      curves.map((c) => {
        const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(120));
        const mat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
        const l = new THREE.Line(g, mat);
        l.frustumCulled = false;
        return l;
      }),
    [curves],
  );
  const pulses = useRef<THREE.Mesh[]>([]);
  const rings = useRef<THREE.Mesh[]>([]);
  const hub = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const p = heroStore.current;
    const t = clock.elapsedTime;
    const on = ramp(p, a - 0.01, a + 0.05) * (1 - ramp(p, b, b + 0.045));
    lines.forEach((l, i) => {
      const draw = ramp(p, a + i * 0.008, a + 0.045 + i * 0.008);
      l.geometry.setDrawRange(0, Math.floor(121 * draw));
      (l.material as THREE.LineBasicMaterial).opacity = 0.55 * on;
      const pm = pulses.current[i];
      if (pm) {
        const u = (t * 0.35 + i * 0.21) % 1;
        curves[i].getPoint(u, tmp);
        pm.position.copy(tmp);
        pm.visible = on > 0.02 && draw > 0.99;
        (pm.material as THREE.MeshBasicMaterial).opacity = on * Math.sin(u * Math.PI);
      }
      const rm = rings.current[i];
      if (rm) {
        (rm.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
        rm.scale.setScalar(0.8 + 0.2 * Math.sin(t * 2 + i));
      }
    });
    if (hub.current) {
      hub.current.visible = on > 0.01;
      hub.current.scale.setScalar(0.6 + 0.4 * on);
      hub.current.children.forEach((c) => {
        const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = on;
      });
    }
  });

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      {NETWORK_NODES.map((n, i) => (
        <group key={n.id}>
          <mesh
            ref={(m) => {
              if (m) pulses.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
          <Billboard position={n.pos}>
            <mesh
              ref={(m) => {
                if (m) rings.current[i] = m;
              }}
            >
              <ringGeometry args={[0.16, 0.175, 64]} />
              <meshBasicMaterial color={CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </Billboard>
        </group>
      ))}
      <Billboard position={W.hub}>
        <group ref={hub}>
          <mesh>
            <ringGeometry args={[0.42, 0.435, 96]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.2, 0.215, 96]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}
