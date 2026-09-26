# S TEC SECURE — website

Cinematic, scroll-driven site for S TEC SECURE: intelligent security and automation.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · GSAP + ScrollTrigger · Lenis · Three.js

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Add `?debug` to the URL to expose the hero engine as `window.__hero`.

## Where to edit

| What | File |
|---|---|
| Company details: phone, WhatsApp, email, address, socials | `src/config/site.ts → site` (empty fields are hidden automatically) |
| Solutions, technology, projects, process copy | `src/config/site.ts` |
| Hero scenes, copy, timings, end-card | `src/config/hero.ts` |
| **Hero footage (video or frame sequence)** | `src/config/hero.ts → heroFilm`, files in `public/media/hero/` |
| Colours, type, spacing | `src/app/globals.css` (`:root` tokens) |
| Contact form delivery | `.env.local → CONTACT_WEBHOOK_URL` (see `.env.example`) |

Real case studies: add them to `caseStudies` in `site.ts` and the Projects section switches from "Spaces we secure" to case-study mode.

## The hero

A pinned, 1000vh scroll timeline split into 8 scenes:
**Darkness → CCTV reveal → Luxury building → Surveillance → Access control → Smart automation → Complete system → Final hero**
The final hero reads "SECURITY. INTELLIGENCE. CONTROL. / Intelligent security and automation for modern spaces."

The picture layer is swappable. The first source that is configured wins:
1. **Frame sequence** (`heroFilm.sequence`): canvas-drawn, loads coarse-to-fine, the smoothest option.
2. **Video** (`heroFilm.video`): one all-intra MP4 scrubbed by scroll.
3. **Real-time film** (default): the Three.js stand-in in `src/engine/`.

Copy, HUD (surveillance feed, access, automation, system cards), scene rail and end-card are driven by one GSAP timeline, so they stay in sync whatever the source.

**Read `docs/VISUAL_CONCEPT.md`** for the shot list, AI-video prompts, live-action/CGI notes and exact ffmpeg encoding commands.

## Structure

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    api/contact/route.ts     contact form → webhook (falls back to WhatsApp / email)
    studio/                  internal render tool (/studio, noindex)
  config/
    site.ts                  company facts + section copy
    hero.ts                  hero scenes + film source
  components/
    Nav.tsx, SmoothScroll.tsx
    hero/                    Hero, HUD, RealtimeFilm, VideoFilm, SequenceFilm
    sections/                Solutions, Technology, Projects, About, Contact, Footer
    media/MediaSlot.tsx      image/video slot with designed empty state
  engine/                    framework-agnostic Three.js film
    HeroEngine.ts            renderer, post pipeline, adaptive quality
    timeline.ts              the 8 shots: camera, lens, light & device cues
    world/                   architecture, devices, environment, textures
    post/FilmPass.ts         grade, IR look, letterbox, grain, vignette
    studio.ts                product-still renderer
public/media/                asset slots (see public/media/README.md)
```

## Performance & accessibility

- The engine is code-split and client-only, and it pauses when the hero is off-screen or the tab is hidden.
- Quality tiers: phones and low-memory devices render without reflections, shadows or depth of field. Desktops step down automatically if frame time rises.
- `prefers-reduced-motion`: no pinned film. The poster and end-card are shown instead.
- No WebGL: the poster image with all copy.
- The mobile menu, skip link, focus styles and semantic landmarks are included.
