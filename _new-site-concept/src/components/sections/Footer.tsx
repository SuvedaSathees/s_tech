import { nav, site } from "@/config/site";
import Logo from "../ui/Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social).filter(([, v]) => v);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Logo />
            <p className="footer__tag">Security. Intelligence. Control.</p>
          </div>
          <ul className="footer__nav">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
            {socials.map(([k, v]) => (
              <li key={k}>
                <a href={v} target="_blank" rel="noopener noreferrer" style={{ textTransform: "capitalize" }}>
                  {k}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__bottom">
          <span>
            © {year} {site.name}
          </span>
          <span>{site.descriptor}</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
