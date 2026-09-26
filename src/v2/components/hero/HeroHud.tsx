"use client";
import { useEffect, useRef } from "react";
import { heroProgress, heroTarget } from "@/v2/lib/heroProgress";

/** Timings (hero progress) for each HUD layer. Kept beside the markup they drive. */
const W = {
  surveillance: [0.402, 0.494] as const,
  survLog: [0.415, 0.44, 0.465],
  access: [0.525, 0.635] as const,
  accessRows: [0.572, 0.582, 0.594],
  automation: [0.652, 0.776] as const,
  autoRows: [0.648, 0.68, 0.718, 0.732],
  system: [0.815, 0.9] as const,
  sysRows: [0.82, 0.83, 0.84, 0.85],
};

const inside = (p: number, [a, b]: readonly [number, number]) => p >= a && p <= b;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Surveillance / access / automation / system overlays that ride on top of the film.
 * All updates are direct DOM writes from the progress store — no React re-renders per frame.
 */
export default function HeroHud({ tracking }: { tracking: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const layer = (n: string) => el.querySelector<HTMLElement>(`[data-layer="${n}"]`)!;
    const rows = (n: string) => Array.from(el.querySelectorAll<HTMLElement>(`[data-layer="${n}"] [data-row]`));
    const L = {
      surveillance: layer("surveillance"),
      access: layer("access"),
      automation: layer("automation"),
      system: layer("system"),
    };
    const R = { surv: rows("surveillance"), access: rows("access"), auto: rows("automation"), sys: rows("system") };
    let p = 0;

    const unsub = heroProgress.subscribe((v) => {
      p = v;
      L.surveillance.classList.toggle("is-on", inside(p, W.surveillance));
      L.access.classList.toggle("is-on", inside(p, W.access));
      L.automation.classList.toggle("is-on", inside(p, W.automation));
      L.system.classList.toggle("is-on", inside(p, W.system));
      R.surv.forEach((r, i) => r.classList.toggle("is-on", p >= W.survLog[i]));
      R.access.forEach((r, i) => r.classList.toggle("is-on", p >= W.accessRows[i]));
      R.auto.forEach((r, i) => r.classList.toggle("is-on", p >= W.autoRows[i]));
      R.sys.forEach((r, i) => r.classList.toggle("is-on", p >= W.sysRows[i]));
    });

    const unsubT = heroTarget.subscribe((t) => {
      const box = track.current;
      if (!box) return;
      const on = tracking && !!t && p > 0.418 && p < 0.492 && t.w > 0.004;
      box.classList.toggle("is-on", on);
      if (on && t) {
        const padX = 0.012, padY = 0.02;
        box.style.left = `${(t.x - padX) * 100}%`;
        box.style.top = `${(t.y - padY) * 100}%`;
        box.style.width = `${(t.w + padX * 2) * 100}%`;
        box.style.height = `${(t.h + padY * 2) * 100}%`;
        const label = box.querySelector("span");
        if (label) label.textContent = `Vehicle · 0.97 · ${t.dist.toFixed(1)} m`;
      }
    });

    const tick = () => {
      const d = new Date();
      if (clock.current)
        clock.current.textContent = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    const iv = window.setInterval(tick, 1000);
    return () => {
      unsub();
      unsubT();
      window.clearInterval(iv);
    };
  }, [tracking]);

  return (
    <div className="hud" ref={root} aria-hidden="true">
      {/* 03 — surveillance feed */}
      <div className="hud__layer" data-layer="surveillance">
        <div className="hud__corners" />
        <div className="hud__tl">
          <span className="hud__rec">Rec · CAM 01 · Entrance</span>
          <span>IR Night · Starlight</span>
        </div>
        <div className="hud__tr">
          <span ref={clock} />
          <span>3840×2160 · 25 fps · H.265</span>
        </div>
        <div className="hud__bl hud__log">
          <div data-row>
            <b>▲</b> Motion · Zone A — Driveway
          </div>
          <div data-row>
            <b>◆</b> Vehicle classified · 97%
          </div>
          <div data-row>
            <b>●</b> Owner notified · Path lights on
          </div>
        </div>
        <div className="hud__track" ref={track}>
          <span>Vehicle</span>
        </div>
      </div>

      {/* 04 — access */}
      <div className="hud__layer" data-layer="access">
        <div className="hud__card" style={{ right: "var(--gutter)", bottom: "110px" }}>
          <span className="k">Main entrance · Reader 01</span>
          <div className="hud__row" data-row>
            Face match <em className="ok">Resident</em>
          </div>
          <div className="hud__row" data-row>
            Door <em className="ok">Unlocked</em>
          </div>
          <div className="hud__row" data-row>
            Entry logged <em>Just now</em>
          </div>
        </div>
      </div>

      {/* 05 — automation */}
      <div className="hud__layer" data-layer="automation">
        <div className="hud__card" style={{ left: "var(--gutter)", bottom: "110px" }}>
          <span className="k">Scene · Evening</span>
          <div className="hud__row" data-row>
            Lighting <span className="hud__pill" />
          </div>
          <div className="hud__row" data-row>
            Climate · 24°C <span className="hud__pill" />
          </div>
          <div className="hud__row" data-row>
            Shades <span className="hud__pill" />
          </div>
          <div className="hud__row" data-row>
            Pool lights <span className="hud__pill" />
          </div>
        </div>
      </div>

      {/* 06 — system */}
      <div className="hud__layer" data-layer="system">
        <div className="hud__card" style={{ right: "var(--gutter)", bottom: "110px" }}>
          <span className="k">System status · All armed</span>
          <div className="hud__row" data-row>
            Cameras <em className="ok">4 online</em>
          </div>
          <div className="hud__row" data-row>
            Access & intercom <em className="ok">2 online</em>
          </div>
          <div className="hud__row" data-row>
            Alarm sensors <em className="ok">4 armed</em>
          </div>
          <div className="hud__row" data-row>
            Automation <em className="ok">Active</em>
          </div>
        </div>
      </div>
    </div>
  );
}
