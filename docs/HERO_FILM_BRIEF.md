# S TEC SECURE — Hero Film Brief

**Film:** one continuous-feeling ~55-second commercial, scrubbed by the visitor's scroll (1100vh pinned hero).
**Tone:** dark, restrained, architectural — a luxury watch or car film, not a security-tech ad.
**Palette:** blue-hour exteriors, warm 2700K practicals, cyan "system" accents, one green "access granted" moment.

The real-time Three.js scene already plays this storyboard. Drop in footage and every overlay (captions, tracking bracket,
analysis pipeline, reader status, automation tags, ecosystem labels) keeps its timing, because all of them read the same
progress ranges in `src/config/heroTimeline.ts`.

## 1. Storyboard (timed to `SCENES` in heroTimeline.ts, 55 s master)

| Scene | Progress | Master TC | Shot |
|---|---|---|---|
| Darkness | 0.00–0.07 | 0:00.0–0:03.9 | Black. A rim light traces the silhouette of a camera; IR LEDs glow faint deep red. |
| CCTV reveal | 0.07–0.19 | 0:03.9–0:10.5 | Macro orbit of a white bullet camera under a soffit; key light sweeps the housing; iridescent lens coating; the head rotates to face the forecourt. |
| Identity | 0.14–0.27 | 0:07.7–0:14.9 | Product holds frame-right while "Security that thinks." sits left (keep the left 45% calm). |
| Luxury building / Surveillance | 0.27–0.41 | 0:14.9–0:22.6 | Crane pull-back revealing the villa at blue hour: glazing, basalt entrance, timber slats, pool, cypress garden. The camera sweeps the forecourt. |
| Intelligence | 0.41–0.53 | 0:22.6–0:29.2 | A resident (silhouette, long coat) crosses the forecourt; the camera tracks; floodlight snaps on. |
| Access control | 0.53–0.67 | 0:29.2–0:36.9 | Close on the slim black-glass reader beside the walnut pivot door; face scan → green ring; the door swings open, warm light spills out. |
| Smart automation | 0.67–0.79 | 0:36.9–0:43.5 | Lateral glide past the glass: interior lights rise, sheers glide closed, pool lights bloom teal. |
| Complete system | 0.79–0.90 | 0:43.5–0:49.5 | High three-quarter aerial; cool grade; clean negative space for the drawn network lines to every device. |
| Final hero | 0.90–1.00 | 0:49.5–0:55.0 | Low wide frame of the lit residence, sky above left for "SECURITY. INTELLIGENCE. CONTROL." Hold 3 s. |

### Continuity rules
- **One location, one evening.** The time of day does not change between shots.
- **Leave negative space.** Copy sits left, right or centre per scene (see the caption positions in `Hero.tsx`), so keep the matching third of the frame calm.
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


### Option B — image sequence (smoothest, Apple-style)
Frames are drawn to a canvas and load coarse-to-fine, so scrubbing works immediately.

```bash
# 480 frames (10 fps over 48 s is plenty for scroll; use 15–24 fps for extra smoothness)
mkdir -p public/media/hero/frames
ffmpeg -i master.mov -vf "fps=10,scale=1920:-2" -c:v libwebp -quality 78 public/media/hero/frames/stec_%04d.webp
```

### Poster
Export a still of shot 07 as `public/media/hero/poster.jpg` (2400×1350, ~250 KB). It is used for loading, reduced-motion visitors, devices without WebGL, and social sharing.

---


## 4. Wiring footage into this site

In `src/config/site.ts → hero`:
```ts
hero: {
  frames: { pattern: "/media/hero/frames/stec_{index}.webp", count: 550, pad: 4 }, // option B (wins if set)
  video: "/media/hero/stec-hero-1080.mp4",            // option A
  videoMobile: "/media/hero/stec-hero-720-portrait.mp4",
  poster: "/media/hero/poster.jpg",
}
```
With either set, the real-time 3D scene is not loaded at all.
