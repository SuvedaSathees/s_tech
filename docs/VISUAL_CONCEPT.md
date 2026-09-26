# S TEC SECURE — Hero Film: Visual Concept & Production Brief

**Film:** one continuous-feeling 48-second commercial, scrubbed by the visitor's scroll.
**Tone:** dark, restrained, architectural. Think a luxury watch or car film, not a security-tech ad. Very little is lit, and everything that is lit has a reason to be.
**Palette:** blue-hour exteriors (deep navy to slate), warm 2700K practicals (amber interiors, wall grazers), champagne-anodised hardware, and one green "access granted" moment.

The site already plays this storyboard with a real-time Three.js stand-in. Replace it with filmed or rendered footage and the copy, HUD, scene rail and end-card stay in sync.

---

## 1. Storyboard (8 shots, 48 s master)

Scene timings match `src/config/hero.ts`. If you cut the film to exactly these timecodes, the copy lands on the right frames. If your cut differs, set `filmTime: [start, end]` on each scene.

| # | Scene | Progress | Master TC | Shot |
|---|---|---|---|---|
| 00 | **Darkness** | 0.00–0.09 | 0:00.0–0:04.3 | Pure black. Eight infrared LEDs glow deep red, very faint. Dust drifts. A thin rim light begins to trace the silhouette of a camera. |
| 01 | **CCTV reveal** | 0.09–0.22 | 0:04.3–0:10.6 | Macro orbit around a graphite bullet camera mounted on basalt. A soft key light sweeps across the body. The lens coating flares purple-green. The head pans a few degrees, alive. Engraved **S TEC SECURE** on the sun-shield. |
| 02 | **Luxury building** | 0.22–0.36 | 0:10.6–0:17.3 | Crane pull-back from the camera to reveal the residence at blue hour. The light arrives as it is revealed: soffit downlights, wall grazers, warm interiors, the pool. Limestone cantilever, glass ground floor, walnut fins, cypress silhouettes, light fog. |
| 03 | **Surveillance** | 0.36–0.50 | 0:17.3–0:24.0 | Push into the lens, flash, then cut to the camera's own POV: monochrome infrared feed, slight barrel distortion, sensor noise. A car's headlights approach up the driveway and the view tracks it. *(The site draws the HUD, tracking box and event log, so keep the footage clean.)* |
| 04 | **Access control** | 0.50–0.64 | 0:24.0–0:30.7 | Close on a slim champagne-and-black-glass reader beside a 3.2 m walnut pivot door. Face-scan frame, then a green ring: "Welcome home". The door swings open and warm light spills onto the step. |
| 05 | **Smart automation** | 0.64–0.78 | 0:30.7–0:37.4 | Slow lateral glide beyond the pool. Interior zones come on one after another, right to left. Sheer curtains lower. Pool lights bloom teal. Reflections in the water. |
| 06 | **Complete system** | 0.78–0.90 | 0:37.4–0:43.2 | Rise to a high three-quarter aerial. The picture desaturates to a cool schematic. Fine champagne lines connect every device to the hub, coverage cones show, and a red perimeter beam links the gate posts. |
| 07 | **Final hero** | 0.90–1.00 | 0:43.2–0:48.0 | Descend to the signature frame: a low, wide, symmetrical view of the lit residence with open sky above for the title. Hold for 3 s with very gentle drift. No text in the footage; the site sets **SECURITY. INTELLIGENCE. CONTROL.** |

### Continuity rules
- **One location, one evening.** The time of day does not change between shots.
- **Leave negative space.** Copy sits left, right or centre per scene (see `align` in `hero.ts`), so keep the matching third of the frame calm.
- **No text, logos or UI burned into the footage** apart from the engraved camera and the reader screen. The site overlays everything else.
- **Camera motion is slow and continuous.** Nothing whips or shakes. Scroll-scrubbing makes fast motion feel cheap.
- **Real hardware.** Ideally use the exact camera, reader and door station models S TEC installs.

---

## 2. Production routes

| Route | Quality | Notes |
|---|---|---|
| **Live-action shoot** | Best | One night at a real modern villa (a client project with permission, or a rented location). Motion-control or gimbal on a crane, macro rig for shots 00–01 and 04. Shoot RAW at 4K/25p. Shot 06 is a CG overlay added in post. |
| **CGI (Unreal Engine 5 / Blender Cycles)** | Excellent and controllable | Use the site's layout as blocking (`src/engine/world/architecture.ts` has all dimensions in metres). Swap in Megascans/Poly Haven materials and a scanned car and plants. Path-trace at 4K. |
| **AI video (Veo, Sora, Runway Gen-4, Kling)** | Good for a first cut | Generate each shot separately from the prompts below, then cut and grade together. Use image-to-video with a consistent reference frame of the house for continuity. |

### AI prompts (one per shot)

Shared suffix (append to every prompt):
> photorealistic cinematic commercial, shot on ARRI Alexa 35, anamorphic lens, shallow depth of field, natural motion blur, subtle film grain, deep blacks, restrained colour grade with teal shadows and warm highlights, slow smooth camera movement, no text, no logos, no people's faces, no watermark

Negative / avoid:
> cartoon, CGI look, plastic, low-poly, oversaturated, lens-flare overload, fast cuts, shaky cam, text, subtitles, logos, distorted hardware

1. **Darkness:** "Complete darkness, a small ring of infrared LEDs on a security camera glows faint deep red, floating dust particles caught in a thin beam of light, a rim light slowly traces the edge of a sleek graphite bullet camera"
2. **CCTV reveal:** "Macro orbit around a premium graphite bullet CCTV camera with champagne-gold accent ring mounted on a dark basalt stone wall at night, a soft key light sweeps across the satin metal body, iridescent purple-green lens coating, the camera head pans slightly as if alive"
3. **Luxury building:** "Slow crane pull-back from a security camera on a basalt feature wall revealing a modern luxury two-storey villa at blue hour, limestone cantilevered upper floor, floor-to-ceiling glass ground floor with warm interior light, walnut timber fins, infinity pool, Italian cypress trees, light mist, architectural lighting fades on"
4. **Surveillance POV:** "Black-and-white infrared security camera footage looking down a long paved driveway at night, slight wide-angle lens distortion, sensor noise, a car with bright headlights approaches slowly from the distance, static elevated viewpoint slowly panning to follow the car"
5. **Access control:** "Close-up of a slim black glass and champagne-gold access control reader on a dark stone wall beside a tall walnut pivot door, the screen shows a face-scan frame then a green check mark, the heavy pivot door swings open and warm golden light spills out onto a floating limestone step, night"
6. **Smart automation:** "Slow lateral dolly beyond a pool at a modern glass villa at blue hour, interior lights turn on room by room from right to left, sheer curtains lower slowly, underwater pool lights glow teal, reflections of the warm interior on the water surface"
7. **Complete system:** "High three-quarter aerial view descending slowly toward a modern luxury villa at night, cool desaturated moody grade, pool glowing, cypress silhouettes, fog, clean composition for adding graphic overlays"
8. **Final hero:** "Low wide symmetrical establishing shot of a modern luxury villa at blue hour, every light glowing warm, pool reflections, deep navy sky with plenty of empty space above the house, very slow push in, ultra premium real-estate film"

---

## 3. Delivery & encoding

Master deliverable: **48 s, 3840×2160 (or 2560×1440), 25 fps, ProRes 422 HQ**, graded, no text.
Optional mobile deliverable: **1080×1920 portrait** recut or recropped (keep the subject centred).

### Option A — single video (simplest)
Scrubbing needs a keyframe on **every** frame:

```bash
# Desktop 1080p, all-intra H.264 (~25–45 MB for 48 s)
ffmpeg -i master.mov -vf "scale=1920:-2,format=yuv420p" -c:v libx264 -preset slow -crf 22 \
  -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart -an public/media/hero/stec-hero-1080.mp4

# Mobile portrait 720p
ffmpeg -i master-portrait.mov -vf "scale=720:-2,format=yuv420p" -c:v libx264 -preset slow -crf 24 \
  -g 1 -keyint_min 1 -movflags +faststart -an public/media/hero/stec-hero-720-portrait.mp4
```

Then in `src/config/hero.ts`:
```ts
export const heroFilm: HeroFilm = {
  video: { src: "/media/hero/stec-hero-1080.mp4", srcMobile: "/media/hero/stec-hero-720-portrait.mp4" },
  poster: "/media/hero/poster.jpg",
  overlayHud: true,
};
```

### Option B — image sequence (smoothest, Apple-style)
Frames are drawn to a canvas and load coarse-to-fine, so scrubbing works immediately.

```bash
# 480 frames (10 fps over 48 s is plenty for scroll; use 15–24 fps for extra smoothness)
mkdir -p public/media/hero/frames
ffmpeg -i master.mov -vf "fps=10,scale=1920:-2" -c:v libwebp -quality 78 public/media/hero/frames/stec_%04d.webp
```
```ts
export const heroFilm: HeroFilm = {
  sequence: { pattern: "/media/hero/frames/stec_{index}.webp", count: 480, pad: 4 },
  poster: "/media/hero/poster.jpg",
  overlayHud: true,
};
```

### Poster
Export a still of shot 07 as `public/media/hero/poster.jpg` (2400×1350, ~250 KB). It is used for loading, reduced-motion visitors, devices without WebGL, and social sharing.

---

## 4. Real-time stand-in (what ships today)

When no footage is configured, `src/engine/` renders the same storyboard live with Three.js:
- **Hardware** (`world/devices.ts`): bullet and dome cameras, access reader with a live screen, video door station, touch panel, alarm keypad, PIR sensor and siren, all modelled to real dimensions with PBR materials, iridescent lens coatings and a separate studio light environment.
- **Architecture** (`world/architecture.ts`): the residence, pool with real reflections, cypress garden, driveway, boundary wall, practical lights and procedural stone, walnut and concrete surfaces.
- **Film pipeline** (`HeroEngine.ts`, `post/FilmPass.ts`): HDR rendering, ACES tone mapping, depth of field, bloom, anamorphic 2.39:1 letterbox, grade, grain, vignette, chromatic aberration, and the infrared surveillance look.
- **Timeline** (`timeline.ts`): camera paths, lens, lighting cues and device states per shot.
- Adaptive quality: phones get a lighter path, and slow GPUs shed depth of field and resolution automatically.

A browser render will not pass for filmed footage, which is why the film slot exists. Use the stand-in as the animatic, and as the camera/lighting reference for the real shoot.

`/studio` re-renders the product and project stills from the same models.
