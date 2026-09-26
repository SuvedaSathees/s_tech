/**
 * S TEC SECURE — single source of truth for company facts and page copy.
 *
 * Rule: no invented facts. Empty strings / arrays are hidden automatically
 * in the UI, so fill contact details in only when they are confirmed.
 */

export const site = {
  name: "S TEC SECURE",
  shortName: "S Tec Secure",
  descriptor: "Intelligent Security & Automation",
  statement: "Intelligent security and automation for modern spaces.",
  url: "https://stecsecure.com", // used for metadata only — change to the live domain

  contact: {
    phone: "", // "+91 98xxx xxxxx"  → shown with a tel: link
    whatsapp: "", // digits only incl. country code, "9198xxxxxxxx" → wa.me link
    email: "", // "hello@stecsecure.com" → shown with a mailto: link
    address: "", // full postal address
    mapUrl: "", // Google Maps share link
    hours: "", // "Mon–Sat · 9:30–19:00"
  },

  social: {
    instagram: "https://www.instagram.com/stecsecure/",
    facebook: "https://www.facebook.com/61585098598089/",
    linkedin: "",
    youtube: "",
  },
};

export const nav = [
  { label: "Solutions", href: "#solutions" },
  { label: "Technology", href: "#technology" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Solutions. `media` is the slot for real photography / footage later:
 * put a file in /public/media/solutions/ and set the path — it replaces the render.
 */
export const solutions = [
  {
    id: "cctv",
    no: "01",
    title: "CCTV Surveillance",
    kicker: "See everything. Miss nothing.",
    body: "Precision cameras with low-light imaging and intelligent detection that separates people and vehicles from wind, rain and shadows — recorded, encrypted and viewable from anywhere.",
    points: ["Day & night imaging", "Person / vehicle detection", "Remote live view & playback"],
    render: "/v2-media/products/cctv.jpg",
    media: "",
  },
  {
    id: "access",
    no: "02",
    title: "Access Control",
    kicker: "The right people. The right time.",
    body: "Face, fingerprint, card and mobile credentials that open the right doors for the right people — with schedules, instant revocation and a complete record of every entry.",
    points: ["Face, card & mobile credentials", "Time-based permissions", "Entry audit trail"],
    render: "/v2-media/products/access.jpg",
    media: "",
  },
  {
    id: "doorphone",
    no: "03",
    title: "Video Door Phones",
    kicker: "Answer the door from anywhere.",
    body: "High-definition video intercoms that let you see, speak to and admit visitors from an indoor monitor or your phone — whether you are upstairs or on another continent.",
    points: ["HD video & two-way audio", "Mobile answering", "Remote door release"],
    render: "/v2-media/products/doorphone.jpg",
    media: "",
  },
  {
    id: "alarm",
    no: "04",
    title: "Burglar Alarms",
    kicker: "Detect first. Respond instantly.",
    body: "Perimeter, motion and opening sensors armed as one intelligent system — with instant app alerts, sirens and automatic camera verification the moment something moves.",
    points: ["Perimeter & interior zones", "Instant alerts & sirens", "Camera-verified alarms"],
    render: "/v2-media/products/alarm.jpg",
    media: "",
  },
  {
    id: "automation",
    no: "05",
    title: "Smart Automation",
    kicker: "A space that responds to you.",
    body: "Lighting, climate, curtains and scenes unified with your security — so arriving home, leaving, or going to sleep is a single, effortless touch.",
    points: ["Lighting & scene control", "Climate & motorised shades", "One app for every system"],
    render: "/v2-media/products/automation.jpg",
    media: "",
  },
] as const;

export type SolutionId = (typeof solutions)[number]["id"];

/** Technology — capability language, not brand-specific specifications. */
export const technology = {
  pillars: [
    {
      label: "Perception",
      title: "Imaging that works in the dark",
      body: "High-resolution sensors, wide dynamic range and infrared illumination keep faces and plates legible from dusk to dawn.",
    },
    {
      label: "Intelligence",
      title: "Detection, not just recording",
      body: "On-device analytics classify people and vehicles, watch virtual lines and zones, and ignore the noise that causes false alarms.",
    },
    {
      label: "Integration",
      title: "One platform, every system",
      body: "Cameras, access, intercom, alarms and automation share events — a verified face can unlock a door, turn on lights and disarm a zone.",
    },
    {
      label: "Protection",
      title: "Private by design",
      body: "Encrypted recording and remote access, role-based permissions, and local storage options that keep your footage yours.",
    },
  ],
  capabilities: [
    ["Resolution", "Up to 4K Ultra HD"],
    ["Low light", "Colour & IR night imaging"],
    ["Analytics", "Person · Vehicle · Line · Zone"],
    ["Access", "Face · Fingerprint · Card · Mobile"],
    ["Alerts", "Real-time push & siren"],
    ["Control", "Mobile app & wall panels"],
    ["Storage", "Local NVR · Optional cloud"],
    ["Security", "Encrypted streams & accounts"],
  ] as [string, string][],
};

/**
 * Projects. No invented case studies: until real, approved projects exist,
 * the section shows the kinds of spaces S Tec secures, with concept visuals.
 * Add real work to `caseStudies` and it takes over the section.
 */
export type CaseStudy = {
  title: string;
  sector: string;
  location?: string;
  scope: string[];
  summary: string;
  image: string; // /media/projects/xyz.jpg (2400px+ wide)
};

export const caseStudies: CaseStudy[] = [];

export const spaces = [
  {
    title: "Private Residences & Villas",
    body: "Discreet surveillance, biometric entry and whole-home automation, designed around the architecture — not bolted onto it.",
    scope: ["CCTV", "Access", "Automation", "Alarm"],
    image: "/v2-media/projects/residence.jpg",
    caption: "Concept visualisation",
  },
  {
    title: "Apartments & Gated Communities",
    body: "Video intercoms at every door, controlled visitor entry, and perimeter coverage managed from one security desk.",
    scope: ["Door phones", "Access", "CCTV"],
    image: "/v2-media/projects/entrance.jpg",
    caption: "Concept visualisation",
  },
  {
    title: "Offices & Corporate Spaces",
    body: "Credential-based entry, visitor management and analytics-driven surveillance for teams that move fast.",
    scope: ["Access", "CCTV", "Alarm"],
    image: "/v2-media/projects/night.jpg",
    caption: "Concept visualisation",
  },
  {
    title: "Retail & Showrooms",
    body: "Loss prevention, after-hours intrusion detection and remote oversight across every location.",
    scope: ["CCTV", "Alarm", "Remote view"],
    image: "",
    caption: "",
  },
  {
    title: "Hospitality",
    body: "Guest-friendly access, back-of-house control and surveillance that protects without intruding.",
    scope: ["Access", "CCTV", "Automation"],
    image: "",
    caption: "",
  },
  {
    title: "Warehouses & Industrial",
    body: "Long-range perimeter cameras, zone alarms and gate control for large, open sites.",
    scope: ["Perimeter", "CCTV", "Alarm"],
    image: "",
    caption: "",
  },
];

export const process = [
  { no: "01", title: "Consult", body: "We walk the space with you and understand how it is lived in, worked in, and entered." },
  { no: "02", title: "Design", body: "Coverage, entry points and automation are planned together as one system — drawn before anything is drilled." },
  { no: "03", title: "Install", body: "Clean, concealed installation with careful cable management, then full configuration and testing." },
  { no: "04", title: "Support", body: "Handover, training on the app, and ongoing service so the system stays sharp for years." },
];

export const hasDirectContact = () =>
  Boolean(site.contact.phone || site.contact.email || site.contact.whatsapp);

export const whatsappLink = (text = "Hello S Tec Secure, I'd like to discuss securing my space.") =>
  site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}` : "";
