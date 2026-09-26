import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/content/posts";

export default function PostCard({ p, n, delay = 0 }: { p: Post; n: number; delay?: number }) {
  return (
    <Link className="post-card" href={`/blog/${p.slug}`} data-reveal="" style={{ ["--d" as string]: `${delay}ms` }}>
      <div className="pc-img">
        <Image src={p.img} alt={p.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
        <span className="pc-no">{String(n).padStart(2, "0")}</span>
      </div>
      <div className="pc-body">
        <p className="pc-top">
          <span className="cat">{p.cat}</span>
        </p>
        <h3>{p.title}</h3>
        <p>{p.lede}</p>
        <div className="pc-foot">
          <span>{p.read} min read</span>
          <span className="pc-more">
            Read
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
