/** Kinds of property we design for (Services page). Photographs are generated stills. */
export const SPACES = [
  {
    key: "villa",
    img: "/media/spaces/villa.jpg",
    alt: "Modern villa at dusk with a security camera under the roof and a video door phone at the gate",
    kicker: "Residences & villas",
    title: "The private home",
    body: "Perimeter cameras, a video door phone at the gate, biometric entry and automation that sets the house for your arrival.",
    scope: ["CCTV", "Video Door Phone", "Access Control", "Automation"],
  },
  {
    key: "office",
    img: "/media/spaces/office.jpg",
    alt: "Office entrance with an access control reader beside glass doors and a camera on the ceiling",
    kicker: "Offices",
    title: "The workplace",
    body: "Controlled entry for staff and visitors, monitored common areas and after-hours intrusion alerts.",
    scope: ["Access Control", "CCTV", "Burglar Alarm"],
  },
  {
    key: "commercial",
    img: "/media/spaces/store.jpg",
    alt: "Retail storefront at night with a security camera above the entrance",
    kicker: "Commercial property",
    title: "The storefront",
    body: "Wide-area surveillance, remote viewing for owners and managers, and alarm response when the doors are closed.",
    scope: ["CCTV", "Burglar Alarm", "Remote Monitoring"],
  },
  {
    key: "project",
    img: "/media/spaces/build.jpg",
    alt: "House under construction with conduits in the walls and architectural drawings on a table",
    kicker: "Your project",
    title: "Planned from the drawings",
    body: "Bring us in early. Cabling, camera positions and control points are designed with the architecture — not added after it.",
    scope: ["Consultation", "System design", "Installation"],
  },
] as const;
