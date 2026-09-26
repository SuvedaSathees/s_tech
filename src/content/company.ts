/**
 * Company facts for the six-page site. Only verified details live here:
 * phone, WhatsApp, email and social profiles (from stecsecure.com).
 * No address, opening hours, years, client names or numbers are invented.
 */
export const company = {
  name: "S TEC SECURE",
  shortName: "S Tec Secure",
  descriptor: "Security & Automation Solutions",
  tagline: "Security that thinks.",
  url: "https://stecsecure.com",
  phone: "+91 96002 52605",
  phoneHref: "tel:+919600252605",
  whatsapp: "919600252605",
  email: "stecsecure@gmail.com",
  social: {
    instagram: "https://www.instagram.com/stecsecure/",
    facebook: "https://www.facebook.com/61585098598089/",
  },
} as const;

export const whatsappHref = (text = "Hello S Tec Secure, I'd like to discuss securing my space.") =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export const absolute = (path = "/") => new URL(path, company.url).toString();

/** Full Open Graph block for a page (child metadata replaces the parent's openGraph object). */
export const og = (url: string, title: string, description: string) => ({
  type: "website" as const,
  siteName: company.name,
  locale: "en_IN",
  url,
  title,
  description,
});
