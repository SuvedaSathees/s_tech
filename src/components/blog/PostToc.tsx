"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; t: string };

/** "In this guide": links to each section, with the one being read lit up. */
export default function PostToc({ items }: { items: TocItem[] }) {
  const [cur, setCur] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const heads = items.map((i) => document.getElementById(i.id)).filter((h): h is HTMLElement => !!h);
    if (!heads.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let id = heads[0].id;
      for (const h of heads) if (h.getBoundingClientRect().top <= line) id = h.id;
      setCur(id);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (!items.length) return null;
  return (
    <nav className="toc" aria-label="In this guide">
      <p className="eyebrow">In this guide</p>
      <ol>
        {items.map((x, i) => (
          <li key={x.id}>
            <a href={`#${x.id}`} aria-current={cur === x.id ? "location" : undefined}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="t">{x.t}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
