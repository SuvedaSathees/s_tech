# Media slots

Drop real assets here — the layout is already built around them.

| Folder | Used by | What to put here |
|---|---|---|
| `hero/` | Hero film | `stec-hero-1080.mp4` (+ `stec-hero-720-portrait.mp4`) **or** a frame sequence in `hero/frames/`. `poster.jpg` = loading / reduced-motion / social image. Then edit `src/config/hero.ts → heroFilm`. |
| `products/` | Solutions (default imagery) | Currently renders of the 3D hardware models. Replace with real product photography, same file names, ~1600×1240, dark background. |
| `solutions/` | Solutions (optional footage) | Short looping clips / lifestyle photos per system. Set `media: "/media/solutions/cctv.mp4"` etc. in `src/config/site.ts`; it overrides the render. |
| `projects/` | Projects | Concept visuals today. Add real, approved project photos (2400px+) and list them in `caseStudies` in `src/config/site.ts` — the section switches to case-study mode automatically. |

Tip: files under `/media` are served with a one-year cache. When you replace a file, give it a new name (e.g. `poster-v2.jpg`) and update the config.
