/** Hardware ranges (Products page). No brands or prices are claimed. */
export const PRODUCTS = [
  {
    id: "cctv",
    title: "CCTV Cameras & Recorders",
    line: "Day-and-night cameras for gates, entrances and driveways, paired with a recorder that keeps footage on site.",
    items: ["Bullet & dome cameras", "Indoor & outdoor models", "Network video recorders", "On-site storage"],
    sys: "CCTV Surveillance",
  },
  {
    id: "doorphone",
    title: "Video Door Phones",
    line: "An outdoor call station with a camera, paired with a video monitor inside the house.",
    items: ["Outdoor station with camera", "Indoor video monitor", "Gate & door release", "Phone app pairing"],
    sys: "Video Door Phone",
  },
  {
    id: "access",
    title: "Access Control & Locks",
    line: "Readers and locks for main doors, offices and restricted rooms.",
    items: ["Fingerprint readers", "Face recognition terminals", "RFID card readers", "Digital door locks"],
    sys: "Access Control",
  },
  {
    id: "alarm",
    title: "Burglar Alarms",
    line: "A control panel with sensors for doors, windows and rooms, plus a siren.",
    items: ["Alarm control panel", "Motion (PIR) sensors", "Door & window contacts", "Indoor & outdoor sirens"],
    sys: "Burglar Alarm",
  },
  {
    id: "automation",
    title: "Home Automation",
    line: "Switches, motors and controllers that let lights, fans, curtains and AC follow a routine.",
    items: ["Smart switches & dimmers", "Curtain motors", "Scene keypads", "AC & fan control"],
    sys: "Smart Home Automation",
  },
  {
    id: "gate",
    title: "Gate Automation",
    line: "Motors for sliding and swing gates, opened by remote, phone or the video door phone.",
    items: ["Sliding gate motors", "Swing gate motors", "Remote controls", "Door phone integration"],
    sys: "Gate Automation",
  },
] as const;
