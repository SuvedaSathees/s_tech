"use client";
import { useEffect, useRef } from "react";
import { heroProgress, heroTarget } from "@/v2/lib/heroProgress";

type Props = { onReady: () => void; onUnsupported: () => void };

/**
 * The built-in Three.js film. Loaded on the client only, code-split from the
 * rest of the page, paused whenever the hero is off-screen.
 */
export default function RealtimeFilm({ onReady, onUnsupported }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("@/v2/engine/HeroEngine")
      .then(({ HeroEngine, webglAvailable }) => {
        if (disposed) return;
        if (!webglAvailable()) return onUnsupported();
        let engine: InstanceType<typeof HeroEngine>;
        try {
          engine = new HeroEngine(canvas, {
            onReady,
            onFrame: (info) => heroTarget.set(info.target),
          });
        } catch (err) {
          console.error("[hero] real-time film unavailable", err);
          return onUnsupported();
        }
        engine.jumpTo(heroProgress.get());
        const unsub = heroProgress.subscribe((p) => engine.setProgress(p));

        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? engine.start() : engine.stop()), { threshold: 0 });
        io.observe(canvas);
        const onResize = () => engine.resize();
        const onMove = (e: PointerEvent) =>
          engine.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
        const onVis = () => (document.hidden ? engine.stop() : engine.start());
        window.addEventListener("resize", onResize);
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("visibilitychange", onVis);
        if (new URLSearchParams(location.search).has("debug")) (window as unknown as { __hero: unknown }).__hero = engine;

        cleanup = () => {
          unsub();
          io.disconnect();
          window.removeEventListener("resize", onResize);
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("visibilitychange", onVis);
          engine.dispose();
        };
      })
      .catch((err) => {
        console.error("[hero] failed to load engine", err);
        onUnsupported();
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
