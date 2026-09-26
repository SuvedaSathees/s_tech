export type Faq = { q: string; a: string; link?: { href: string; label: string } };

/** Services page — questions about planning and installing a system. */
export const SERVICE_FAQS: Faq[] = [
  {
    q: "Can I start with one system and add the others later?",
    a: "Yes. Plenty of projects begin with cameras or a video door phone. We plan the cabling and control points so access control, an alarm or automation can be connected later without redoing the first installation.",
  },
  {
    q: "How do you decide what my property needs?",
    a: "By looking at how the place is used: every entrance, the blind spots, what needs watching after dark and what should happen without anyone pressing a button. The layout follows those answers instead of a fixed package.",
  },
  {
    q: "Do you work on offices and shops as well as homes?",
    a: "We do. The same planning applies to independent houses, villas and apartments, to offices and retail, and to buildings that are still under construction.",
  },
  {
    q: "Will I be able to check my cameras from my phone?",
    a: "Yes. Live view and recorded footage can be opened on your phone, so the gate, the driveway or the shop floor is a few taps away wherever you are.",
  },
  {
    q: "Can all five systems be controlled in one place?",
    a: "That is the point of designing them together. When cameras, door phone, access control, alarm and automation share one set-up, you see everything in one app, and a single event — a verified entry, an alarm — can set off the right response in the others.",
  },
  {
    q: "What happens after the installation is finished?",
    a: "You keep the same point of contact. Questions, changes to users or schedules, and service visits all come back to us, so the system goes on working the way your household or team needs.",
  },
];

/** Products page — questions about the hardware itself. */
export const PRODUCT_FAQS: Faq[] = [
  {
    q: "Which camera suits a gate or a driveway?",
    a: "It depends on the distance, the lighting at night and whether you need to recognise a face or simply see movement. A wide camera covers the approach; a second one at head height near the gate shows who is standing there.",
  },
  {
    q: "Where are CCTV recordings kept?",
    a: "Normally on a network video recorder inside the property, with enough storage for the number of cameras and the days of footage you want. Because it records on site, recording carries on even if the internet drops.",
  },
  {
    q: "Fingerprint, face or card — which reader should we choose?",
    a: "Fingerprint and face readers tie each entry to a person, while cards are quick to hand out and cancel for visitors or large teams. Many offices use a mix.",
    link: { href: "/blog/choosing-access-control", label: "Read the full comparison" },
  },
  {
    q: "Can automation be added to a home that is already finished?",
    a: "Often, yes. Many smart switches and curtain motors fit existing points, although some features need a new cable run. What is possible in your home is confirmed before any hardware is ordered.",
  },
  {
    q: "Is the hardware supplied as well as installed?",
    a: "Yes. Cameras, recorders, door phones, readers, locks, sensors, controllers and gate motors are supplied as part of the project, then fitted and configured to work together. Ask us about current models and pricing for your space.",
  },
];
