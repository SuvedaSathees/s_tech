/**
 * Company facts for the six-page site. Only details published on the company's
 * own site (stecsecure.com) live here: phone, WhatsApp, email, social profiles,
 * the year it was established, the office address, working hours and the CEO's message.
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
  established: "2021",
  area: "Erode and nearby regions",
  address: {
    street: "VSM Complex, 70/12, 16th Main Road, V. Chathram",
    city: "Erode",
    region: "Tamil Nadu",
    postcode: "638004",
    country: "IN",
  },
  hours: "8:00 am – 8:00 pm",
  ceo: {
    name: "Mr. Santhosh",
    title: "CEO, S Tec Secure",
    photo: "/media/about/ceo.jpg",
    quote:
      "At S-Tec Secure, we are dedicated to safeguarding your world with advanced, reliable security solutions. Join us in building a safer future with protection you can count on.",
  },
} as const;

export const addressLine = `${company.address.street}, ${company.address.city} – ${company.address.postcode}`;
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.address.street}, ${company.address.city} ${company.address.postcode}`)}`;

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

/** The share image (src/app/opengraph-image.jpg), named explicitly because a page's own openGraph block replaces the inherited one. */
export const OG_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "S TEC SECURE — Security that thinks. A modern villa at night secured with CCTV, access control and smart automation.",
};

/** Full Open Graph block for a page (child metadata replaces the parent's openGraph object). */
export const og = (url: string, title: string, description: string) => ({
  type: "website" as const,
  siteName: company.name,
  locale: "en_IN",
  url,
  title,
  description,
  images: [OG_IMAGE],
});
