export type Service = {
  id: "cctv" | "automation" | "access" | "doorphone" | "alarm";
  no: string;
  title: string;
  line: string;
  points: string[];
  image: string;
  alt: string;
};

/** The five systems, as shown on the Services page. */
export const SERVICES: Service[] = [
  {
    id: "cctv",
    no: "01",
    title: "CCTV Surveillance",
    line: "24/7 intelligent monitoring and remote surveillance, with cameras placed at every way in and footage you can check from your phone.",
    points: ["Continuous recording", "Remote live view", "Motion-aware monitoring"],
    image: "/media/products/cctv.jpg",
    alt: "Dome and bullet security cameras with infrared rings, shown on a dark background",
  },
  {
    id: "automation",
    no: "02",
    title: "Smart Home Automation",
    line: "Control lighting, climate, appliances and security intelligently — from a wall keypad, your phone or a schedule.",
    points: ["Lighting scenes", "Climate & curtains", "One app, every system"],
    image: "/media/products/automation.jpg",
    alt: "Smart wall panel showing the Evening scene with Arrive, Cinema and Night options",
  },
  {
    id: "access",
    no: "03",
    title: "Access Control",
    line: "Secure, controlled entry that opens for the right people and keeps a record of every door opened.",
    points: ["Biometric & card entry", "Smart locks", "Who entered, and when"],
    image: "/media/products/access.jpg",
    alt: "Access control terminal showing Welcome home above a fingerprint sensor",
  },
  {
    id: "doorphone",
    no: "04",
    title: "Video Door Phone",
    line: "Visual communication and controlled visitor access: see who is at the gate, speak to them and let them in without walking out.",
    points: ["See before you open", "Two-way talk", "Remote unlock"],
    image: "/media/products/doorphone.jpg",
    alt: "Outdoor video door phone station beside an indoor scene panel",
  },
  {
    id: "alarm",
    no: "05",
    title: "Burglar Alarm",
    line: "Intelligent intrusion detection and alerts, from sensors on doors, windows and rooms to a siren and a message on your phone.",
    points: ["Perimeter & interior sensors", "Instant alerts", "Siren response"],
    image: "/media/products/alarm.jpg",
    alt: "Alarm keypad showing Armed, beside a motion sensor and a siren",
  },
];

/** Everything offered, including gate automation (used by the footer and the enquiry form). */
export const SYSTEM_LINKS = [
  { label: "CCTV Surveillance", href: "/services#cctv" },
  { label: "Smart Home Automation", href: "/services#automation" },
  { label: "Access Control", href: "/services#access" },
  { label: "Video Door Phone", href: "/services#doorphone" },
  { label: "Burglar Alarm", href: "/services#alarm" },
  { label: "Gate Automation", href: "/products#gate" },
] as const;
