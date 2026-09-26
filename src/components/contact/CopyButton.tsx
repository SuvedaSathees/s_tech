"use client";

import { useRef, useState } from "react";

/** Copies a value; if the clipboard is refused, selects the text next to it instead. */
export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [txt, setTxt] = useState("Copy");
  const ref = useRef<HTMLButtonElement>(null);
  const flash = (t: string) => {
    setTxt(t);
    setTimeout(() => setTxt("Copy"), 1600);
  };
  const fallback = () => {
    const node = ref.current?.parentElement?.querySelector(".cv");
    if (!node) return flash("Copy");
    const r = document.createRange();
    r.selectNodeContents(node);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    flash("Selected");
  };
  return (
    <button
      ref={ref}
      className="copy"
      type="button"
      aria-label={label}
      onClick={() => {
        try {
          navigator.clipboard.writeText(value).then(() => flash("Copied"), fallback);
        } catch {
          fallback();
        }
      }}
    >
      {txt}
    </button>
  );
}
