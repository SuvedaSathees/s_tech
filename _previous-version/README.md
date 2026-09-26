# S TEC SECURE — Security That Thinks

Next.js 16 · React 19 · TypeScript · Three.js / React Three Fiber / drei · postprocessing · GSAP ScrollTrigger · Lenis · Tailwind v4 · Lucide

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Edit real company info (one file)

`src/config/site.ts` holds every real-world fact: phone, WhatsApp, email, address, socials, projects, hero footage. **Empty fields are hidden automatically.** Nothing is invented: no clients, stats, awards or years.

## Structure

```
src/
  config/site.ts            company facts, services, nav
  config/heroTimeline.ts    9-scene scroll map (shared by 3D, film and overlays)
  lib/heroStore.ts          per-frame shared state (no React re-renders)
  components/
    hero/Hero.tsx           pinned 1100vh hero, overlays, HUD, parallax layers
    hero/HeroVideo.tsx      scroll-scrubbed film layer (used when hero.video is set)
    hero/HeroCanvas.tsx     R3F canvas, procedural env reflections, DoF/bloom/AgX/grain
    hero/scene/*            CCTV camera, villa, subject, access reader, network, camera rig
    sections/*              Solutions, Ecosystem, Projects, Technology, About, Contact, Footer
    visuals/*               SVG system plates + architectural elevations
```

## Hero: 9 scenes on one scroll timeline

| Progress | Scene | What happens |
|---|---|---|
| 0.00–0.07 | Darkness | Camera silhouette, black, letterbox |
| 0.07–0.19 | Camera reveal | Key/rim light up, head rotates, lens coating catches light |
| 0.14–0.27 | Brand | "S TEC SECURE / Security that thinks." (lens-shifted product right) |
| 0.27–0.41 | Surveillance | Pull back to villa at blue hour, field of view, zone, REC HUD |
| 0.41–0.53 | Intelligence | Resident walks in, tracked; Motion → Person → Zone → Response; floodlight + alert |
| 0.53–0.67 | Access | Resident presents credential, reader verifies, pivot door opens |
| 0.67–0.79 | Automation | Arrival scene: lights rise, sheers close, climate tag |
| 0.79–0.90 | Ecosystem | Lines drawn between the actual devices in the scene and the S Tec hub |
| 0.90–1.00 | Final | "Security. Intelligence. Control." + CTAs, strong negative space |

## Photoreal footage (recommended for the final site)

The real-time scene is a high-quality fallback, but a real-time browser render will not match filmed footage. For true photorealism:

1. Shoot or produce a ~40–60 s continuous film following the table above (scene lengths proportional to the progress ranges). Use a slow dolly, shallow DoF, blue-hour exterior, warm practicals, and real commercial hardware.
2. Encode it for scrubbing (a keyframe on every frame):
   ```bash
   ffmpeg -i master.mov -vf scale=1920:-2 -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart -an public/media/hero/stec-hero-1080.mp4
   ```
3. Set `site.hero.video` (and optionally `videoMobile`, `poster`). The 3D scene is then not loaded, and every overlay stays in sync.

AI-video prompt pattern for each shot:
> "Photorealistic cinematic commercial, ARRI Alexa look, 35mm anamorphic, blue hour, modern luxury villa with basalt and timber slats, warm interior practicals, [SHOT ACTION], slow dolly, shallow depth of field, natural motion blur, subtle film grain, no text, no logos."

## Production 3D upgrades

- Replace the procedural camera head with the exact CAD/GLB model S Tec installs (Draco + KTX2, same pivot: +Z = optical axis).
- Replace the stand-in subject with a scanned rigged human; `subjectState()` already drives position, heading and stride.
- Swap procedural surfaces for scanned PBR sets (KTX2).

## Performance

- The hero canvas is code-split (`next/dynamic`, `ssr:false`) and stops rendering when off-screen.
- `PerformanceMonitor` drops DPR/effects on slow GPUs; small screens get a low-quality path without the reflector or DoF.
- Respects `prefers-reduced-motion`.
- If WebGL is missing, the hero falls back to the poster.

`?debug` exposes `window.__hero` for scene QA.
