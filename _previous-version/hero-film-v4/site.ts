/**
 * SINGLE SOURCE OF TRUTH for every real-world fact on the site.
 *
 * Rule: nothing here may be invented. Any field left empty ("" or [])
 * is automatically hidden in the UI. Fill these in only with information
 * verified by S Tec Secure.
 */

export type Project = {
  title: string;
  sector: string; // e.g. "Residence", "Office"
  location?: string;
  scope: string[]; // systems delivered, e.g. ["CCTV", "Access Control"]
  summary: string;
  image: string; // /media/projects/xyz.avif (large, 2400px+)
};

export const site = {
  name: "S TEC SECURE",
  shortName: "S Tec Secure",
  descriptor: "Security & Automation Solutions",
  tagline: "Security that thinks.",
  statement: "Intelligent security and automation for modern spaces.",

  contact: {
    phone: "", // e.g. "+91 98xxxxxxx"  → shown + tel: link
    whatsapp: "", // digits only, with country code, e.g. "9198xxxxxxxx" → wa.me link
    email: "", // e.g. "info@stecsecure.com"
    address: "", // full postal address
    mapUrl: "", // Google Maps share link
    hours: "",
  },

  social: {
    instagram: "https://www.instagram.com/stecsecure/",
    facebook: "https://www.facebook.com/61585098598089/",
    linkedin: "",
    youtube: "",
  },

  /**
   * HERO FOOTAGE
   * When `video` is set, the pinned hero scrubs this film with scroll and the
   * real-time 3D scene is not loaded. Encode with a keyframe on every frame
   * (see docs/HERO_FILM_BRIEF.md → "Encoding for scroll-scrub").
   */
  hero: {
    video: "/media/hero/stec-hero-720.mp4", // photoreal film generated with Google Flow (Veo 3.1), all-intra for scrubbing
    videoMobile: "", // "/media/hero/stec-hero-720-portrait.mp4"
    poster: "/media/hero/stec-hero-poster.jpg",
    /**
     * Image-sequence film (smoothest scrubbing, Apple-style). Takes priority over `video`.
     * e.g. { pattern: "/media/hero/frames/stec_{index}.webp", count: 480, pad: 4 }
     * Export with: ffmpeg -i master.mov -vf "fps=10,scale=1920:-2" -c:v libwebp -quality 78 public/media/hero/frames/stec_%04d.webp
     */
    frames: null as null | { pattern: string; count: number; pad: number; start?: number },
  },

  /** Real, approved case studies only. Empty → "Spaces we secure" mode. */
  projects: [] as Project[],
};

export const nav = [
  { label: "Solutions", href: "#solutions" },
  { label: "Technology", href: "#technology" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const services = [
  {
    id: "cctv",
    no: "01",
    title: "CCTV Surveillance",
    line: "24/7 intelligent monitoring and remote surveillance.",
    points: ["Continuous recording", "Remote live view", "Motion-aware monitoring"],
  },
  {
    id: "automation",
    no: "02",
    title: "Smart Home Automation",
    line: "Control lighting, climate, appliances and security intelligently.",
    points: ["Lighting scenes", "Climate & curtains", "One app, every system"],
  },
  {
    id: "access",
    no: "03",
    title: "Access Control",
    line: "Secure and controlled entry systems.",
    points: ["Biometric & card entry", "Smart locks", "Who entered, and when"],
  },
  {
    id: "doorphone",
    no: "04",
    title: "Video Door Phone",
    line: "Visual communication and controlled visitor access.",
    points: ["See before you open", "Two-way talk", "Remote unlock"],
  },
  {
    id: "alarm",
    no: "05",
    title: "Burglar Alarm",
    line: "Intelligent intrusion detection and alerts.",
    points: ["Perimeter & interior sensors", "Instant alerts", "Siren response"],
  },
] as const;

export type ServiceId = (typeof services)[number]["id"];

export const hasContact = () =>
  Boolean(site.contact.phone || site.contact.email || site.contact.whatsapp || site.contact.address);

export const whatsappLink = (text = "Hello S Tec Secure, I'd like to discuss securing my space.") =>
  site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}` : "";
