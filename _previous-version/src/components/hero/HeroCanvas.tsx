"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, ToneMapping, DepthOfField, SMAA } from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { heroStore } from "@/lib/heroStore";
import Villa from "./scene/Villa";
import Rig, { camFx } from "./scene/Rig";
import Network from "./scene/Network";

// @react-three/fiber 9 still creates a THREE.Clock internally, which three r18x flags as
// deprecated. It is harmless; silence only that exact library message.
if (typeof window !== "undefined" && !(window as unknown as { __stecWarn?: boolean }).__stecWarn) {
  (window as unknown as { __stecWarn?: boolean }).__stecWarn = true;
  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) return;
    warn(...args);
  };
}

/** Studio-grade reflections without any network fetch: procedural light-formers. */
function Reflections() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={["#050505"]} />
      {/* large overhead softbox */}
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
      {/* long strip — creates the long specular streak on the housing */}
      <Lightformer form="rect" intensity={3} color="#f4f2ee" position={[-5, 1.5, 3]} rotation-y={Math.PI / 2} scale={[8, 0.35, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#dfe8f2" position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 0.6, 1]} />
      {/* subtle cyan kicker */}
      <Lightformer form="ring" intensity={0.8} color="#5fd4ff" position={[2, 0.5, 6]} scale={1.2} />
      {/* ground bounce */}
      <Lightformer form="rect" intensity={0.25} color="#b0906a" position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
    </Environment>
  );
}

function Effects({ quality }: { quality: "high" | "low" }) {
  const dof = useRef<DepthOfFieldEffect>(null);
  const noDof = typeof location !== "undefined" && location.search.includes("nodof");
  useFrame(() => {
    const e = dof.current;
    if (!e) return;
    e.target = camFx.focus;
    e.bokehScale = camFx.bokeh;
  });
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === "high" && !noDof ? <DepthOfField ref={dof} focalLength={0.02} bokehScale={3} height={720} /> : <></>}
      <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <SMAA />
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} />
    </EffectComposer>
  );
}

/** Pauses rendering while the hero is off-screen (saves GPU for the rest of the page). */
function FrameGate({ onActive }: { onActive: (a: boolean) => void }) {
  useEffect(() => {
    let last = heroStore.active;
    const id = setInterval(() => {
      if (heroStore.active !== last) {
        last = heroStore.active;
        onActive(last);
      }
    }, 150);
    return () => clearInterval(id);
  }, [onActive]);
  return null;
}

export default function HeroCanvas() {
  const [active, setActive] = useState(true);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.75]);
  const quality = useMemo<"high" | "low">(() => {
    if (typeof window === "undefined") return "high";
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const lowCores = (navigator.hardwareConcurrency || 8) <= 4;
    return small || lowCores ? "low" : "high";
  }, []);
  const [q, setQ] = useState(quality);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={q === "low" ? [1, 1.25] : dpr}
      shadows="percentage" // PCFShadowMap (three r18x removed PCFSoftShadowMap)
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        stencil: false,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 26, near: 0.02, far: 220, position: [6.5, 3.2, 7] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <FrameGate onActive={setActive} />
      <PerformanceMonitor
        onDecline={() => {
          setDpr([1, 1.25]);
          setQ("low");
        }}
      />
      <AdaptiveDpr pixelated={false} />
      <Suspense fallback={null}>
        <Reflections />
        <Rig />
        <Villa quality={q} />
        <Network />
        <Effects quality={q} />
      </Suspense>
    </Canvas>
  );
}
