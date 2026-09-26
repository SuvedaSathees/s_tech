"use client";

import Link from "next/link";
import { useState } from "react";
import type { Faq } from "@/content/faqs";

/** Questions as cards: one opens at a time and the answer slides open under it. */
export default function FaqList({ items, id }: { items: Faq[]; id: string }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list" data-reveal="">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div className={`faq-item${on ? " open" : ""}`} key={f.q}>
            <h3 className="faq-q">
              <button type="button" id={`${id}-q${i}`} aria-expanded={on} aria-controls={`${id}-a${i}`} onClick={() => setOpen(on ? -1 : i)}>
                <span className="q-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="q-t">{f.q}</span>
                <span className="q-i" aria-hidden="true" />
              </button>
            </h3>
            <div className="faq-a" id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`}>
              <div>
                <p>
                  {f.a}
                  {f.link && (
                    <>
                      {" "}
                      <Link href={f.link.href}>{f.link.label}</Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
