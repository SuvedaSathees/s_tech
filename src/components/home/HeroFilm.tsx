"use client";

import { useEffect, useRef } from "react";
import { Btn, WhatsAppBtn } from "@/components/site/ui";

/**
 * The film hero.
 * Larger screens: the film is scrubbed by scroll across a 700vh pinned stage, with
 *   captions, status chips, a scene rail and a scroll cue on the right edge.
 * Phones (and phones held sideways): a looping vertical film plays on its own under
 *   the wordmark. Portrait tablets scrub the vertical cut.
 * Films: /media/film/wide|tall|phone.(mp4|webm). Caption windows are fractions of the film.
 */
const CHAPTERS = [
  { no: "01", label: "Gate Automation", a: "You arrive.", b: "The gate opens.", chip: ["Main gate", "Opening"], w: "0.045,0.075,0.115,0.14" },
  { no: "02", label: "Access Control", a: "One touch.", b: "The door opens itself.", chip: ["Fingerprint", "Verified · Unlocked"], w: "0.17,0.2,0.32,0.345" },
  { no: "03", label: "Smart Curtains", a: "Dusk falls.", b: "The curtains draw.", chip: ["Curtains", "Closing"], w: "0.375,0.4,0.47,0.495" },
  { no: "04", label: "Lights & Fan", a: "Lights rise, the fan turns —", b: "not a switch touched.", chip: ["Living room", "Evening scene"], w: "0.525,0.55,0.625,0.65" },
  { no: "05", label: "CCTV & Alarm", a: "Watched 24/7,", b: "even while you sleep.", chip: ["REC · CAM 01", "Armed"], w: "0.675,0.7,0.765,0.785" },
] as const;
const SCENES: [number, string][] = [
  [0, "Gate"],
  [0.152, "Access"],
  [0.356, "Curtains"],
  [0.508, "Lights & fan"],
  [0.66, "CCTV"],
  [0.795, "S TEC Secure"],
];
const WORD = "S TEC SECURE".split("");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const win4 = (p: number, [a, b, c, d]: number[]) => Math.min(ramp(p, a, b), 1 - ramp(p, c, d));

export default function HeroFilm() {
  const heroRef = useRef<HTMLElement>(null);
  const vRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hero = heroRef.current!, v = vRef.current!;
    const $ = <T extends HTMLElement>(s: string) => hero.querySelector<T>(s)!;
    const poster = $("#poster"), loader = $("#loader"), loadBar = $("#loadBar"), loadTxt = $("#loadTxt");
    const sceneN = $("#sceneN"), sceneL = $("#sceneL"), barI = $("#barI"), cueFill = $("#cueFill"), cueN = $("#cueN"), clock = $("#clock");
    const wins = Array.from(hero.querySelectorAll<HTMLElement>("[data-w]")).map((el) => ({
      el,
      w: el.dataset.w!.split(",").map(Number),
      y: Number(el.dataset.y || 0),
      interactive: el.dataset.interactive === "1",
    }));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mqPhone = window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-height: 500px)");
    const mqPortrait = window.matchMedia("(orientation: portrait)");
    // H.264 first where it plays, VP9 WebM otherwise, and the other one as a fallback
    const mp4ok = v.canPlayType('video/mp4; codecs="avc1.640028"') === "probably";
    const webmok = !!v.canPlayType('video/webm; codecs="vp9"');
    const order = mp4ok || !webmok ? ["mp4", "webm"] : ["webm", "mp4"];
    let mode = "", base = "", dur = 0, attempt = 0, blobUrl = "", heroVisible = true, lastSeek = -1, alive = true;
    let fetchCtl: AbortController | null = null;

    const filmFail = () => {
      loadTxt.textContent = "Film unavailable · scroll to read";
      setTimeout(() => loader.classList.add("done"), 2500);
    };
    const playIfAllowed = () => {
      if (mode !== "play" || !heroVisible || reduce || v.ended) return;
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => {});
    };
    const tryDirect = () => {
      if (attempt >= order.length) return filmFail();
      v.src = `${base}.${order[attempt++]}`;
      v.load();
      playIfAllowed();
    };
    const setupFilm = () => {
      const m = mqPhone.matches ? "play" : "scrub";
      const b = !mqPortrait.matches ? "/media/film/wide" : m === "play" ? "/media/film/phone" : "/media/film/tall";
      if (m === mode && b === base) return;
      mode = m;
      base = b;
      attempt = 0;
      dur = 0;
      lastSeek = -1;
      if (fetchCtl) {
        fetchCtl.abort();
        fetchCtl = null;
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = "";
      }
      poster.classList.remove("gone");
      if (mode === "play") {
        loader.classList.add("done");
        v.loop = true;
        v.muted = true;
        v.defaultMuted = true;
        v.setAttribute("muted", "");
        v.autoplay = !reduce;
        tryDirect();
        return;
      }
      v.loop = false;
      v.autoplay = false;
      v.pause();
      loader.classList.remove("done");
      loadBar.style.width = "0%";
      loadTxt.textContent = "Loading film 0%";
      const ctl = (fetchCtl = new AbortController());
      (async () => {
        try {
          const res = await fetch(`${base}.${order[0]}`, { signal: ctl.signal });
          if (!res.ok || !res.body) throw new Error(String(res.status));
          const total = Number(res.headers.get("content-length")) || 13000000;
          const reader = res.body.getReader();
          const chunks: BlobPart[] = [];
          let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            got += value.length;
            const pct = Math.min(100, Math.round((got / total) * 100));
            loadBar.style.width = pct + "%";
            loadTxt.textContent = "Loading film " + pct + "%";
          }
          if (ctl !== fetchCtl || !alive) return;
          fetchCtl = null;
          attempt = 1; // a decode error on this copy moves on to the other format
          blobUrl = URL.createObjectURL(new Blob(chunks, { type: order[0] === "webm" ? "video/webm" : "video/mp4" }));
          v.src = blobUrl;
          v.load();
        } catch {
          if (ctl.signal.aborted || ctl !== fetchCtl || !alive) return;
          fetchCtl = null;
          attempt = 0;
          tryDirect();
        }
      })();
    };

    const onMeta = () => (dur = v.duration || 0);
    const onData = () => {
      loader.classList.add("done");
      poster.classList.add("gone");
    };
    const onErr = () => {
      if (v.getAttribute("src")) tryDirect();
    };
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("loadeddata", onData);
    v.addEventListener("canplay", playIfAllowed);
    v.addEventListener("error", onErr);
    const onMq = () => setupFilm();
    mqPhone.addEventListener("change", onMq);
    mqPortrait.addEventListener("change", onMq);
    setupFilm();

    // pause the phone film while it is scrolled out of view
    const io = new IntersectionObserver(
      ([e]) => {
        heroVisible = e.isIntersecting;
        if (mode !== "play") return;
        if (heroVisible) playIfAllowed();
        else v.pause();
      },
      { threshold: 0 },
    );
    io.observe(hero);

    // where autoplay is blocked a touch starts the phone film; on scrub screens the first touch primes seeking
    let primed = false;
    const unlock = () => {
      if (mode === "play") {
        if (v.paused && !v.ended) playIfAllowed();
        return;
      }
      if (!primed) {
        primed = true;
        v.play().then(() => v.pause()).catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });

    const tickClock = () => {
      const d = new Date();
      clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
    };
    tickClock();
    const clockTimer = window.setInterval(tickClock, 1000);

    // one loop drives the film time, captions, rail and cue
    let cur = 0, lastIdx = -1, last = performance.now(), snap = true, raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.1);
      last = now;
      const k = reduce ? 1 : 1 - Math.pow(0.0008, dt);
      const r = hero.getBoundingClientRect();
      const target = clamp01(-r.top / Math.max(1, hero.offsetHeight - window.innerHeight));
      cur += (target - cur) * k;
      if (snap || Math.abs(target - cur) < 0.00005) {
        cur = target;
        snap = false;
      }
      const p = cur;
      if (mode === "scrub" && r.bottom > 0 && r.top < window.innerHeight) {
        if (dur) {
          const t = p * (dur - 0.05);
          if (Math.abs(t - lastSeek) > 1 / 48 && !v.seeking) {
            v.currentTime = t;
            lastSeek = t;
          }
        }
        for (const o of wins) {
          const a = win4(p, o.w);
          const s = o.el.style;
          s.opacity = a.toFixed(3);
          s.visibility = a < 0.002 ? "hidden" : "visible";
          s.transform = `translate3d(0,${((1 - a) * o.y * (p < o.w[1] ? 1 : -1)).toFixed(1)}px,0)`;
          if (o.interactive) s.pointerEvents = a > 0.6 ? "auto" : "none";
        }
        let idx = 0;
        SCENES.forEach(([s0], i) => {
          if (p >= s0) idx = i;
        });
        if (idx !== lastIdx) {
          lastIdx = idx;
          sceneN.textContent = `0${idx + 1} / 06`;
          sceneL.textContent = SCENES[idx][1];
          cueN.textContent = `0${idx + 1}/06`;
        }
        barI.style.transform = `scaleX(${p.toFixed(4)})`;
        cueFill.style.transform = `scaleY(${p.toFixed(4)})`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearInterval(clockTimer);
      io.disconnect();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      mqPhone.removeEventListener("change", onMq);
      mqPortrait.removeEventListener("change", onMq);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("loadeddata", onData);
      v.removeEventListener("canplay", playIfAllowed);
      v.removeEventListener("error", onErr);
      if (fetchCtl) fetchCtl.abort();
      v.pause();
      v.removeAttribute("src");
      v.load();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  return (
    <section ref={heroRef} className="hero" id="top" aria-label="S TEC SECURE — Security & Automation Solutions" data-own-cue="">
      <div className="stage-v">
        <video ref={vRef} muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true" />
        <div className="poster" id="poster" />
        <div className="scrim" aria-hidden="true" />
        <div className="loader done" id="loader" aria-hidden="true">
          <span id="loadTxt">Loading film 0%</span>
          <span className="ltrack">
            <i id="loadBar" />
          </span>
        </div>

        <div className="chips" aria-hidden="true">
          {CHAPTERS.map((c) => (
            <div key={c.no} className="chip" data-w={c.w} data-y="-10">
              <span className={`dot${c.no === "05" ? " rec" : ""}`} />
              <span className="k">{c.chip[0]}</span>
              <span className="v">{c.chip[1]}</span>
              {c.no === "05" && <span className="t" id="clock" />}
            </div>
          ))}
        </div>

        <div className="hud-t">
          {/* opening frame: the wordmark along the bottom */}
          <div className="brand" data-w="-1,0,0.03,0.055" data-y="34" style={{ opacity: 1, visibility: "visible" }}>
            <div className="brand-top">
              <p className="brand-kicker">
                <span className="live" aria-hidden="true" />
                Security &amp; Automation Solutions
              </p>
              <p className="brand-tag">
                Security that <em>thinks.</em>
                <i className="caret" aria-hidden="true" />
              </p>
            </div>
            <div className="brand-rule" aria-hidden="true" />
            <p className="brand-word" aria-label="S TEC SECURE">
              {WORD.map((ch, i) => (
                <span key={i} className={ch === " " ? "sp" : undefined} style={{ ["--i" as string]: i }} aria-hidden="true">
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </p>
          </div>

          {CHAPTERS.map((c) => (
            <div key={c.no} className="cap" data-w={c.w} data-y="24">
              <p className="eyebrow">
                {c.no} — {c.label}
              </p>
              <p className="display">
                {c.a}
                <br />
                <span className="w55">{c.b}</span>
              </p>
            </div>
          ))}

          <div className="cap" id="final" data-w="0.82,0.87,2,2" data-y="30" data-interactive="1">
            <p className="eyebrow">S TEC SECURE</p>
            <h2 className="display">
              <span className="l">A home that</span>
              <span className="l w55">looks after itself.</span>
            </h2>
            <p className="sub">
              Gate, doors, lights, fans, curtains, cameras and alarms — designed, installed and supported by S Tec Secure, and all in one app.
            </p>
            <div className="btn-row">
              <WhatsAppBtn solid />
              <Btn href="/services">Explore services</Btn>
            </div>
          </div>
        </div>

        <div className="hero-cue" aria-hidden="true">
          <span className="lbl">Scroll to see</span>
          <span className="trk">
            <i id="cueFill" />
            <b />
          </span>
          <span className="n" id="cueN">
            01/06
          </span>
        </div>

        <div className="rail" aria-hidden="true">
          <span>
            <span className="n" id="sceneN">
              01 / 06
            </span>
            <span id="sceneL">Gate</span>
          </span>
          <span className="bar">
            <i id="barI" />
          </span>
        </div>

        {/* phones: the film plays under the wordmark */}
        <div className="hero-phone">
          <p className="brand-kicker">
            <span className="live" aria-hidden="true" />
            Security &amp; Automation
          </p>
          <p className="brand-tag">
            Security that <em>thinks.</em>
            <i className="caret" aria-hidden="true" />
          </p>
          <p className="brand-word" aria-hidden="true">
            {WORD.map((ch, i) => (
              <span key={i} className={ch === " " ? "sp" : undefined} style={{ ["--i" as string]: i }}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>
          <div className="brand-rule" aria-hidden="true" />
          <p className="pcue" aria-hidden="true">
            Scroll
            <i />
          </p>
        </div>

        <div className="grain" aria-hidden="true" />
        <div className="fade" aria-hidden="true" />
      </div>
    </section>
  );
}
