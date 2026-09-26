import { nav, site, whatsappLink } from "@/config/site";
import { Wordmark } from "@/components/Nav";

export default function Footer() {
  const c = site.contact;
  const socials = [
    site.social.instagram && { href: site.social.instagram, label: "Instagram" },
    site.social.facebook && { href: site.social.facebook, label: "Facebook" },
    site.social.linkedin && { href: site.social.linkedin, label: "LinkedIn" },
    site.social.youtube && { href: site.social.youtube, label: "YouTube" },
  ].filter(Boolean) as { href: string; label: string }[];
  const wa = whatsappLink();

  return (
    <footer className="relative border-t border-line bg-ink">
      <div className="mx-auto max-w-[1680px] px-5 pb-10 pt-20 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="text-white" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-dim">{site.descriptor}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="space-y-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-[14px] text-mist transition-colors hover:text-white">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 text-[14px]">
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="block text-mist hover:text-white">
                {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="block text-mist hover:text-white">
                {c.email}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-mist hover:text-white">
                WhatsApp
              </a>
            )}
            {socials.length > 0 && (
              <div className="flex gap-6 pt-3">
                {socials.map(({ href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-white">
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-24 overflow-hidden">
          <div aria-hidden className="display select-none whitespace-nowrap text-[15.5vw] leading-none text-white/[0.035]">
            S TEC SECURE
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-line pt-6 text-[12px] text-dim md:flex-row">
          <span>
            © {new Date().getFullYear()} {site.shortName}. All rights reserved.
          </span>
          <span className="font-mono uppercase tracking-[0.2em]">{site.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
