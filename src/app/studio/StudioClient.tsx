"use client";
import { useEffect, useState } from "react";

/**
 * Internal tool: renders the product stills used on the site (Solutions imagery)
 * and stills from the real-time hero film. Right-click → save, or use the links.
 * Replace the files in /public/media with real photography whenever available.
 */
const HERO_STILLS = [
  { name: "poster", p: 0.985 },
  { name: "residence", p: 0.99 },
  { name: "entrance", p: 0.625 },
  { name: "night", p: 0.76 },
];

export default function StudioClient() {
  const [items, setItems] = useState<{ name: string; url: string }[]>([]);
  const [busy, setBusy] = useState("Rendering…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: { name: string; url: string }[] = [];
      const { ProductStudio, PRODUCTS } = await import("@/engine/studio");
      const c = document.createElement("canvas");
      const studio = new ProductStudio(c, 1600, 1240);
      for (const id of PRODUCTS) {
        if (cancelled) return;
        setBusy(`Rendering ${id}…`);
        await new Promise((r) => setTimeout(r, 30));
        out.push({ name: `products/${id}.jpg`, url: studio.render(id).toDataURL("image/jpeg", 0.9) });
        setItems([...out]);
      }
      studio.dispose();

      const { HeroEngine } = await import("@/engine/HeroEngine");
      const hc = document.createElement("canvas");
      hc.style.cssText = "position:fixed;left:-9999px;width:2400px;height:1350px";
      document.body.appendChild(hc);
      const engine = new HeroEngine(hc, { quality: "high" });
      for (const s of HERO_STILLS) {
        if (cancelled) return;
        setBusy(`Rendering ${s.name}…`);
        await new Promise((r) => setTimeout(r, 30));
        engine.renderStill(s.p, 3, { letterbox: false });
        engine.renderStill(s.p, 3, { letterbox: false });
        out.push({ name: `${s.name === "poster" ? "hero" : "projects"}/${s.name}.jpg`, url: hc.toDataURL("image/jpeg", 0.88) });
        setItems([...out]);
      }
      engine.dispose();
      hc.remove();
      setBusy("");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 40, display: "grid", gap: 24 }}>
      <h1 className="h2">Render studio</h1>
      <p className="lede">{busy || "Done. Save each image into /public/media/<path> shown under it."}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {items.map((it) => (
          <figure key={it.name} style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt={it.name} style={{ width: "100%", borderRadius: 12 }} />
            <figcaption className="mono" style={{ fontSize: 12, marginTop: 8 }}>
              <a href={it.url} download={it.name.split("/").pop()}>
                ↓ /media/{it.name}
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
