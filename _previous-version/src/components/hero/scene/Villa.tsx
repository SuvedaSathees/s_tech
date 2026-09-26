"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { heroStore } from "@/lib/heroStore";
import { ramp } from "@/config/heroTimeline";
import { W, SUBJECT } from "./world";
import Subject from "./Subject";
import { grainTexture, noiseTexture, pavingTexture } from "./textures";

const WARM = new THREE.Color("#ffc58f");
const CYAN = new THREE.Color("#5fd4ff");
const GREEN = new THREE.Color("#7fe0b0");

function useArchMaterials() {
  return useMemo(() => {
    const concreteRough = noiseTexture("concrete", { size: 512, octaves: 7, contrast: 0.7, repeat: 2, seed: 4 });
    const concreteCol = noiseTexture("concrete-c", { size: 512, octaves: 6, contrast: 0.35, repeat: 2, seed: 9, color: true, base: 170 });
    const stoneRough = noiseTexture("stone", { size: 512, octaves: 7, contrast: 0.8, repeat: 3, seed: 12 });
    const wood = grainTexture("wood", 5);
    const woodDoor = grainTexture("wood-door", 8);

    return {
      concrete: new THREE.MeshStandardMaterial({ color: "#a9a6a0", roughness: 0.92, roughnessMap: concreteRough, map: concreteCol }),
      concreteDark: new THREE.MeshStandardMaterial({ color: "#6d6b67", roughness: 0.9, roughnessMap: concreteRough, map: concreteCol }),
      basalt: new THREE.MeshStandardMaterial({ color: "#2c2b29", roughness: 0.78, roughnessMap: stoneRough }),
      interiorWall: new THREE.MeshStandardMaterial({ color: "#d8d2c8", roughness: 0.95 }),
      interiorFloor: new THREE.MeshStandardMaterial({ color: "#8f887d", roughness: 0.35, roughnessMap: stoneRough }),
      fabric: new THREE.MeshStandardMaterial({ color: "#4a4843", roughness: 1 }),
      oak: new THREE.MeshStandardMaterial({ color: "#8a6a4d", roughness: 0.62, map: wood }),
      doorWood: new THREE.MeshPhysicalMaterial({ color: "#5a4230", roughness: 0.45, map: woodDoor, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
      bronze: new THREE.MeshStandardMaterial({ color: "#8a6a45", metalness: 1, roughness: 0.28 }),
      steel: new THREE.MeshStandardMaterial({ color: "#16181b", metalness: 0.9, roughness: 0.35 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#9fb2bf",
        metalness: 0.0,
        roughness: 0.04,
        transparent: true,
        opacity: 0.14,
        envMapIntensity: 1.6,
        clearcoat: 1,
        depthWrite: false,
      }),
      darkGlass: new THREE.MeshPhysicalMaterial({ color: "#030405", roughness: 0.08, clearcoat: 1, envMapIntensity: 1.8 }),
      white: new THREE.MeshPhysicalMaterial({ color: "#e4e5e6", roughness: 0.4, clearcoat: 0.5 }),
      sheer: new THREE.MeshStandardMaterial({
        color: "#e8e1d4",
        roughness: 1,
        transparent: true,
        opacity: 0.38,
        side: THREE.DoubleSide,
        emissive: new THREE.Color("#ffb877"),
        emissiveIntensity: 0,
      }),
      warmEmit: new THREE.MeshStandardMaterial({ color: "#1a1410", emissive: WARM.clone(), emissiveIntensity: 0.2 }),
      soffitEmit: new THREE.MeshStandardMaterial({ color: "#1a1410", emissive: WARM.clone(), emissiveIntensity: 0 }),
      windowGlow: new THREE.MeshStandardMaterial({ color: "#0c0a08", emissive: new THREE.Color("#ffb070"), emissiveIntensity: 0.25 }),
      bollard: new THREE.MeshStandardMaterial({ color: "#1a1410", emissive: WARM.clone(), emissiveIntensity: 0 }),
    };
  }, []);
}

/* -------------------------------------------------------------------------- */

function Slats({ m }: { m: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const front = 82,
    side = 64;
  useLayoutEffect(() => {
    const im = ref.current!;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let i = 0;
    for (let k = 0; k < front; k++) {
      o.position.set(-7.45 + k * 0.11, 5.4, 2.92);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      im.setColorAt(i++, c.setHSL(0.075, 0.32, 0.36 + Math.random() * 0.08));
    }
    for (let k = 0; k < side; k++) {
      o.position.set(1.62, 5.4, 2.85 - k * 0.115);
      o.rotation.set(0, Math.PI / 2, 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      im.setColorAt(i++, c.setHSL(0.075, 0.3, 0.34 + Math.random() * 0.08));
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, front + side]} castShadow receiveShadow material={m}>
      <boxGeometry args={[0.05, 3.2, 0.09]} />
    </instancedMesh>
  );
}

/** Pleated sheer curtain panel (folds baked into geometry). */
function useCurtainGeometry() {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(1.6, 2.95, 64, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 22) * 0.035 + Math.sin(x * 7.3) * 0.012);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

/* -------------------------------------------------------------------------- */

export default function Villa({ quality }: { quality: "high" | "low" }) {
  const m = useArchMaterials();
  const curtainGeo = useCurtainGeometry();
  const paving = useMemo(() => {
    const t = pavingTexture("paving", 8, 3);
    t.repeat.set(6, 6);
    return t;
  }, []);

  const doorPivot = useRef<THREE.Group>(null);
  const curtains = useRef<THREE.Group>(null);
  const readerRing = useRef<THREE.MeshStandardMaterial>(null);
  const readerScreen = useRef<THREE.MeshStandardMaterial>(null);
  const phoneScreen = useRef<THREE.MeshStandardMaterial>(null);
  const sirenLed = useRef<THREE.MeshStandardMaterial>(null);

  const interiorLights = useRef<THREE.PointLight[]>([]);
  const foyerLight = useRef<THREE.PointLight>(null);
  const soffits = useRef<THREE.SpotLight[]>([]);
  const slatLights = useRef<THREE.SpotLight[]>([]);
  const slatRigs = useMemo(
    () =>
      [
        { from: [2.35, 3.86, 1.6], to: [1.6, 6.8, 1.2] },
        { from: [2.35, 3.86, -2.4], to: [1.6, 6.8, -2.6] },
        { from: [-5.4, 3.86, 3.6], to: [-5.4, 6.8, 2.9] },
        { from: [-1.2, 3.86, 3.6], to: [-1.2, 6.8, 2.9] },
      ].map((r) => {
        const o = new THREE.Object3D();
        o.position.set(...(r.to as [number, number, number]));
        return { from: r.from as [number, number, number], target: o };
      }),
    [],
  );
  const grazers = useRef<THREE.SpotLight[]>([]);
  const flood = useRef<THREE.SpotLight>(null);
  const bollardLights = useRef<THREE.PointLight[]>([]);
  const readerLight = useRef<THREE.PointLight>(null);

  const floodTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(1.0, 0, 9.8);
    return o;
  }, []);
  const soffitTargets = useMemo(
    () =>
      [-2.2, 0.6, 3.4, 6.2].map((x) => {
        const o = new THREE.Object3D();
        o.position.set(x, 0, 5.6);
        return o;
      }),
    [],
  );
  const grazerTargets = useMemo(
    () =>
      [-7.0, -6.0, -3.4].map((x) => {
        const o = new THREE.Object3D();
        o.position.set(x, 3.3, 4.3);
        return o;
      }),
    [],
  );

  const col = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const p = heroStore.current;
    const t = clock.elapsedTime;
    const ext = ramp(p, 0.23, 0.34);
    const interior = ramp(p, 0.655, 0.735);
    const floodOn = ramp(p, 0.468, 0.482) * (1 - ramp(p, 0.56, 0.6));
    const sirenOn = ramp(p, 0.468, 0.475) * (1 - ramp(p, 0.525, 0.54));
    const doorOpen = ramp(p, 0.632, 0.662) * (1 - ramp(p, 0.695, 0.725));
    const curtainClose = ramp(p, 0.7, 0.775);

    // --- architecture lighting
    soffits.current.forEach((l) => (l.intensity = 34 * ext));
    m.soffitEmit.emissiveIntensity = 6 * ext;
    grazers.current.forEach((l) => (l.intensity = 26 * ext));
    slatLights.current.forEach((l) => (l.intensity = 30 * ext));
    bollardLights.current.forEach((l) => (l.intensity = 1.6 * ext));
    m.bollard.emissiveIntensity = 5 * ext;
    m.windowGlow.emissiveIntensity = 0.1 + 0.9 * ext * 0.35 + interior * 0.9;

    // --- interior (automation scene)
    interiorLights.current.forEach((l, i) => (l.intensity = (1.2 + 22 * ramp(p, 0.655 + i * 0.012, 0.7 + i * 0.012)) * ext));
    m.warmEmit.emissiveIntensity = 0.15 + 5 * interior;
    m.sheer.emissiveIntensity = 0.04 + 0.28 * interior;
    if (foyerLight.current) foyerLight.current.intensity = 14 * doorOpen + 10 * interior;

    // --- curtains glide closed
    if (curtains.current) {
      curtains.current.children.forEach((c, i) => {
        const openX = 6.9 - i * 0.22; // stacked at the right end
        const closedX = -2.2 + i * 1.5;
        c.position.x = THREE.MathUtils.lerp(openX, closedX, curtainClose);
      });
    }

    // --- door
    if (doorPivot.current) doorPivot.current.rotation.y = doorOpen * 1.32; // swings inward

    // --- response floodlight + siren
    if (flood.current) flood.current.intensity = 260 * floodOn;
    if (sirenLed.current) sirenLed.current.emissiveIntensity = sirenOn * (0.4 + 3.6 * (Math.sin(t * 14) > 0 ? 1 : 0));

    // --- access reader: idle → scanning → granted
    const scanning = ramp(p, SUBJECT.verify[0], SUBJECT.verify[0] + 0.006) * (1 - ramp(p, SUBJECT.verify[1] - 0.004, SUBJECT.verify[1]));
    const granted = ramp(p, SUBJECT.verify[1] - 0.004, SUBJECT.verify[1]) * (1 - ramp(p, 0.72, 0.76));
    if (readerRing.current) {
      col.copy(CYAN).lerp(GREEN, granted);
      readerRing.current.emissive.copy(col);
      readerRing.current.emissiveIntensity = 0.5 + scanning * (1.1 + Math.sin(t * 9) * 0.8) + granted * 1.3;
    }
    if (readerScreen.current) {
      readerScreen.current.emissive.copy(col);
      readerScreen.current.emissiveIntensity = 0.12 + scanning * 0.6 + granted * 0.8;
    }
    if (readerLight.current) {
      readerLight.current.color.copy(col);
      readerLight.current.intensity = 0.08 + scanning * 0.25 + granted * 0.35;
    }
    if (phoneScreen.current) phoneScreen.current.emissiveIntensity = 0.25 + 0.6 * ext;
  });

  const D = W.door;

  return (
    <group>
      {/* ------------------------------------------------ ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            blur={[420, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={2.2}
            mixContrast={1.1}
            roughness={0.9}
            roughnessMap={paving}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#15161a"
            metalness={0.4}
            mirror={0.6}
          />
        ) : (
          <meshStandardMaterial color="#121316" roughness={0.6} roughnessMap={paving} metalness={0.3} />
        )}
      </mesh>

      {/* reflecting pool coping */}
      <group position={[7.2, 0, 8.4]}>
        {[
          [0, 0.06, -1.3, 6.4, 0.12, 0.3],
          [0, 0.06, 1.3, 6.4, 0.12, 0.3],
          [-3.05, 0.06, 0, 0.3, 0.12, 2.3],
          [3.05, 0.06, 0, 0.3, 0.12, 2.3],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]} material={m.concrete} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={m.darkGlass}>
          <planeGeometry args={[5.8, 2.3]} />
        </mesh>
      </group>

      {/* ------------------------------------------------ plinth + roof */}
      <mesh position={[0, 0.175, -0.1]} material={m.concreteDark} receiveShadow castShadow>
        <boxGeometry args={[15.4, 0.35, 9.6]} />
      </mesh>
      <mesh position={[0.15, 3.6, 0.8]} material={m.concrete} castShadow receiveShadow>
        <boxGeometry args={[16.2, 0.42, 11.6]} />
      </mesh>
      {/* soffit downlight fixtures */}
      {[-2.2, 0.6, 3.4, 6.2].map((x, i) => (
        <mesh key={i} position={[x, 3.385, 5.6]} rotation={[Math.PI / 2, 0, 0]} material={m.soffitEmit}>
          <circleGeometry args={[0.06, 24]} />
        </mesh>
      ))}
      {soffitTargets.map((o, i) => (
        <primitive key={"st" + i} object={o} />
      ))}
      {[-2.2, 0.6, 3.4, 6.2].map((x, i) => (
        <spotLight
          key={"s" + i}
          ref={(l) => {
            if (l) soffits.current[i] = l;
          }}
          position={[x, 3.36, 5.6]}
          target={soffitTargets[i]}
          angle={0.62}
          penumbra={0.9}
          distance={12}
          decay={2}
          color={WARM}
          intensity={0}
        />
      ))}

      {/* slim steel column */}
      <mesh position={[7.6, 1.9, 6.0]} material={m.steel} castShadow>
        <boxGeometry args={[0.12, 3.1, 0.12]} />
      </mesh>

      {/* ------------------------------------------------ back wall + interior */}
      <mesh position={[0, 1.88, -4.6]} material={m.interiorWall} receiveShadow>
        <boxGeometry args={[15, 3.06, 0.3]} />
      </mesh>
      <mesh position={[7.55, 1.88, -0.1]} material={m.concrete} receiveShadow castShadow>
        <boxGeometry args={[0.3, 3.06, 9.2]} />
      </mesh>
      {/* interior floor sheen */}
      <mesh position={[2.25, 0.352, -0.15]} rotation={[-Math.PI / 2, 0, 0]} material={m.interiorFloor} receiveShadow>
        <planeGeometry args={[10.5, 8.8]} />
      </mesh>
      {/* cove light strip + downlights */}
      <mesh position={[2.3, 3.36, -4.3]} material={m.warmEmit}>
        <boxGeometry args={[10, 0.03, 0.08]} />
      </mesh>
      {[-1.2, 2.2, 5.6].map((x, i) => (
        <mesh key={i} position={[x, 3.385, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={m.warmEmit}>
          <circleGeometry args={[0.07, 24]} />
        </mesh>
      ))}
      {[
        [-1.2, 2.9, 0.2],
        [2.2, 2.9, -1.2],
        [5.6, 2.9, 0.2],
      ].map((pos, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            if (l) interiorLights.current[i] = l;
          }}
          position={pos as [number, number, number]}
          color={WARM}
          distance={11}
          decay={2}
          intensity={0}
        />
      ))}
      {/* furniture silhouettes */}
      <group position={[2.2, 0.35, -1.6]}>
        <RoundedBox args={[3.4, 0.42, 1.05]} radius={0.08} smoothness={3} position={[0, 0.21, 0]} material={m.fabric} castShadow receiveShadow />
        <RoundedBox args={[3.4, 0.4, 0.22]} radius={0.06} smoothness={3} position={[0, 0.62, -0.42]} material={m.fabric} castShadow />
        <mesh position={[0, 0.17, 1.35]} material={m.oak} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.34, 0.8]} />
        </mesh>
      </group>
      <mesh position={[2.3, 0.75, -4.22]} material={m.oak} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.8, 0.45]} />
      </mesh>
      {/* artwork panel on back wall */}
      <mesh position={[2.3, 2.2, -4.44]} material={m.basalt}>
        <boxGeometry args={[2.6, 1.2, 0.03]} />
      </mesh>

      {/* glass facade + mullions */}
      <mesh position={[2.25, 1.88, 4.3]} material={m.glass}>
        <planeGeometry args={[10.5, 3.06]} />
      </mesh>
      {[-3, -0.9, 1.2, 3.3, 5.4, 7.45].map((x, i) => (
        <mesh key={i} position={[x, 1.88, 4.3]} material={m.steel} castShadow>
          <boxGeometry args={[0.05, 3.06, 0.08]} />
        </mesh>
      ))}
      <mesh position={[2.25, 3.37, 4.3]} material={m.steel}>
        <boxGeometry args={[10.5, 0.05, 0.1]} />
      </mesh>
      <mesh position={[2.25, 0.37, 4.3]} material={m.steel}>
        <boxGeometry args={[10.5, 0.04, 0.1]} />
      </mesh>
      {/* sheer curtains */}
      <group ref={curtains}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} geometry={curtainGeo} position={[6.9 - i * 0.22, 1.86, 4.05]} material={m.sheer} />
        ))}
      </group>

      {/* ------------------------------------------------ entrance volume (basalt) */}
      <group>
        <mesh position={[-7.5, 1.88, -0.1]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[0.3, 3.06, 9.2]} />
        </mesh>
        <mesh position={[-3.02, 1.88, -0.1]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[0.1, 3.06, 9.2]} />
        </mesh>
        {/* front wall pieces around the door */}
        <mesh position={[(-7.65 + (D.x - D.w / 2)) / 2, 1.88, D.z]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[D.x - D.w / 2 + 7.65, 3.06, 0.3]} />
        </mesh>
        <mesh position={[(D.x + D.w / 2 + -2.97) / 2, 1.88, D.z]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[-2.97 - (D.x + D.w / 2), 3.06, 0.3]} />
        </mesh>
        <mesh position={[D.x, 0.35 + D.h + (3.41 - 0.35 - D.h) / 2, D.z]} material={m.basalt}>
          <boxGeometry args={[D.w, 3.41 - 0.35 - D.h, 0.3]} />
        </mesh>
        {/* door reveal (bronze frame) */}
        <mesh position={[D.x, 0.35 + D.h / 2, D.z + 0.02]} material={m.bronze}>
          <boxGeometry args={[D.w + 0.06, D.h + 0.04, 0.26]} />
        </mesh>
        {/* foyer behind the door */}
        <mesh position={[D.x, 1.88, D.z - 1.4]} material={m.interiorWall}>
          <boxGeometry args={[2.4, 3.06, 0.1]} />
        </mesh>
        <pointLight ref={foyerLight} position={[D.x, 2.6, D.z - 0.8]} color={WARM} intensity={0} distance={7} decay={2} />

        {/* pivot door: pivot at 1/3 width */}
        <group ref={doorPivot} position={[D.x - D.w / 2 + D.w / 3, 0.35, D.z + 0.08]}>
          <mesh position={[D.w / 2 - D.w / 3, D.h / 2, 0]} material={m.doorWood} castShadow receiveShadow>
            <boxGeometry args={[D.w - 0.02, D.h - 0.02, 0.075]} />
          </mesh>
          {/* full-height pull bar */}
          <mesh position={[D.w - D.w / 3 - 0.14, D.h / 2, 0.075]} material={m.bronze} castShadow>
            <boxGeometry args={[0.028, 1.6, 0.028]} />
          </mesh>
          {[-0.62, 0.62].map((y, i) => (
            <mesh key={i} position={[D.w - D.w / 3 - 0.14, D.h / 2 + y, 0.05]} material={m.bronze}>
              <boxGeometry args={[0.02, 0.02, 0.05]} />
            </mesh>
          ))}
        </group>

        {/* access reader */}
        <group position={W.reader.toArray()}>
          <RoundedBox args={[0.09, 0.16, 0.022]} radius={0.008} smoothness={4} material={m.darkGlass} castShadow />
          <mesh position={[0, 0.035, 0.0115]}>
            <planeGeometry args={[0.064, 0.05]} />
            <meshStandardMaterial ref={readerScreen} color="#020303" emissive={CYAN} emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0, -0.035, 0.0118]}>
            <torusGeometry args={[0.019, 0.0016, 12, 48]} />
            <meshStandardMaterial ref={readerRing} color="#021014" emissive={CYAN} emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.035, 0.0112]}>
            <circleGeometry args={[0.016, 32]} />
            <meshPhysicalMaterial color="#0b0d10" roughness={0.3} clearcoat={1} />
          </mesh>
          <pointLight ref={readerLight} position={[0, 0, 0.12]} color={CYAN} intensity={0.15} distance={1.2} decay={2} />
        </group>

        {/* alarm siren + sensor */}
        <group position={W.siren.toArray()}>
          <RoundedBox args={[0.24, 0.32, 0.08]} radius={0.02} smoothness={4} material={m.white} castShadow />
          <mesh position={[0, -0.1, 0.041]}>
            <planeGeometry args={[0.16, 0.012]} />
            <meshStandardMaterial ref={sirenLed} color="#1a0303" emissive="#ff3b2f" emissiveIntensity={0} toneMapped={false} />
          </mesh>
        </group>
        <group position={W.pir.toArray()}>
          <RoundedBox args={[0.07, 0.11, 0.05]} radius={0.012} smoothness={4} material={m.white} />
          <mesh position={[0, 0.01, 0.026]} scale={[1, 1, 0.5]}>
            <sphereGeometry args={[0.022, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial color="#d8dadc" roughness={0.25} transmission={0} clearcoat={1} />
          </mesh>
        </group>

        {/* wall grazers */}
        {grazerTargets.map((o, i) => (
          <primitive key={"gt" + i} object={o} />
        ))}
        {[-7.0, -6.0, -3.4].map((x, i) => (
          <spotLight
            key={"g" + i}
            ref={(l) => {
              if (l) grazers.current[i] = l;
            }}
            position={[x, 0.4, 4.75]}
            target={grazerTargets[i]}
            angle={0.32}
            penumbra={1}
            distance={6}
            decay={2}
            color={WARM}
            intensity={0}
          />
        ))}
      </group>

      {/* ------------------------------------------------ upper timber volume */}
      <mesh position={[-3, 5.4, -0.9]} material={m.basalt} castShadow receiveShadow>
        <boxGeometry args={[9, 3.2, 7.4]} />
      </mesh>
      <mesh position={[-3.2, 5.45, 2.82]} material={m.windowGlow}>
        <planeGeometry args={[7.6, 1.5]} />
      </mesh>
      <Slats m={m.oak} />
      {slatRigs.map((r, i) => (
        <group key={"sl" + i}>
          <primitive object={r.target} />
          <spotLight
            ref={(l) => {
              if (l) slatLights.current[i] = l;
            }}
            position={r.from}
            target={r.target}
            angle={0.42}
            penumbra={1}
            distance={7}
            decay={2}
            color={WARM}
            intensity={0}
          />
        </group>
      ))}
      <mesh position={[-3, 7.06, -0.9]} material={m.concrete} castShadow>
        <boxGeometry args={[9.4, 0.14, 7.9]} />
      </mesh>

      {/* ------------------------------------------------ boundary + gate pillar with video door phone */}
      <group>
        <mesh position={[-10.4, 0.55, 13]} material={m.concrete} castShadow receiveShadow>
          <boxGeometry args={[7.6, 1.1, 0.35]} />
        </mesh>
        <mesh position={[8.6, 0.55, 13]} material={m.concrete} castShadow receiveShadow>
          <boxGeometry args={[13.2, 1.1, 0.35]} />
        </mesh>
        <mesh position={[-6.5, 1.15, 12.6]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[0.6, 2.3, 0.45]} />
        </mesh>
        <mesh position={[-1.7, 1.15, 12.6]} material={m.basalt} castShadow receiveShadow>
          <boxGeometry args={[0.6, 2.3, 0.45]} />
        </mesh>
        <group position={W.doorPhone.toArray()}>
          <RoundedBox args={[0.13, 0.26, 0.025]} radius={0.008} smoothness={4} material={m.darkGlass} />
          <mesh position={[0, 0.05, 0.0135]}>
            <planeGeometry args={[0.1, 0.075]} />
            <meshStandardMaterial ref={phoneScreen} color="#020303" emissive="#8fd8ff" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0.105, 0.0135]}>
            <circleGeometry args={[0.007, 24]} />
            <meshPhysicalMaterial color="#000" roughness={0} clearcoat={1} />
          </mesh>
          <mesh position={[0, -0.07, 0.0135]}>
            <circleGeometry args={[0.018, 32]} />
            <meshStandardMaterial color="#111" emissive="#5fd4ff" emissiveIntensity={0.35} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------ path bollards */}
      {[
        [-3.0, 11.6],
        [-3.0, 9.2],
        [-3.0, 6.8],
        [-0.2, 11.6],
        [-0.2, 9.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.35, 0]} material={m.steel} castShadow>
            <boxGeometry args={[0.1, 0.7, 0.1]} />
          </mesh>
          <mesh position={[0, 0.62, 0.051]} material={m.bollard}>
            <planeGeometry args={[0.07, 0.05]} />
          </mesh>
          {i < 3 && (
            <pointLight
              ref={(l) => {
                if (l) bollardLights.current[i] = l;
              }}
              position={[0, 0.55, 0.2]}
              color={WARM}
              distance={3.2}
              decay={2}
              intensity={0}
            />
          )}
        </group>
      ))}

      {/* ------------------------------------------------ response floodlight */}
      <primitive object={floodTarget} />
      <spotLight
        ref={flood}
        position={[6.8, 3.34, 5.9]}
        target={floodTarget}
        angle={0.5}
        penumbra={0.55}
        distance={24}
        decay={2}
        color="#eef6ff"
        intensity={0}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />

      <Subject />
    </group>
  );
}
