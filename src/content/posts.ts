/** Blog articles. Bodies are static, trusted HTML written for this site. */
/** `img` is the cover photograph (film stills and generated photographs; the maker’s mark stays in the bottom-right corner). */
export type Post = { slug: string; cat: string; ic: string; read: number; title: string; lede: string; img: string; alt: string; body: string };

export const PUBLISHED = "2026-09-26";

export const POSTS: Post[] = [
  {
    "slug": "how-many-cctv-cameras",
    "cat": "CCTV",
    "ic": "cctv",
    "read": 4,
    "title": "How many CCTV cameras does a home really need?",
    "lede": "Start with the ways into your property, not with a number. Here’s how to plan coverage that actually helps on the day you need it.",
    "img": "/media/blog/how-many-cctv-cameras.jpg",
    "alt": "Security camera under the roof of a house at night, looking over a lit pool and living room",
    "body": "<p>“How many cameras?” is usually the first question — and the wrong place to start. A system with twelve cameras can still miss the one spot that matters, while a well-planned system with five can cover every approach. Plan around how people get in, not around a number.</p>\n<h2>1. Map every way in</h2>\n<p>Walk the boundary and list every point where a person or a vehicle can enter: the main gate, a side or pedestrian gate, the front door, back and utility doors, the garage, and any terrace or balcony that can be reached from outside. Each of these is a candidate camera position.</p>\n<h2>2. Separate “seeing” from “identifying”</h2>\n<p>A wide camera on the driveway tells you that someone arrived. To recognise who it was, you need a camera closer to where people stop — at the gate or the door, around head height, covering a few metres rather than the whole garden. Good layouts pair one wide view with one close view at each main entrance.</p>\n<h2>3. Plan for night first</h2>\n<p>Much of the footage you will ever need is recorded after dark. Choose cameras with good low-light performance, avoid pointing them straight at bright lamps, and treat outdoor lighting as part of the camera plan: a well-lit gate makes every camera near it more useful.</p>\n<h2>4. Decide how long to keep footage</h2>\n<p>Recordings are usually stored on a recorder inside the house. The number of cameras, their resolution and how many days you want to keep together decide how much storage you need. Settle this before installation, not after the drive fills up.</p>\n<h2>So, how many?</h2>\n<p>For many independent homes the answer lands somewhere between four and eight cameras once every entrance, the driveway and the side passages are covered. Apartments often need fewer; large plots and villas more. The right number is the one that leaves no blind way in.</p>\n<p class=\"note\">Keep cameras pointed at your own property and away from a neighbour’s windows or garden. It’s good practice, and it avoids disputes.</p>"
  },
  {
    "slug": "door-phone-or-cctv",
    "cat": "Video door phones",
    "ic": "doorphone",
    "read": 3,
    "title": "Video door phone or CCTV at the gate — do you need both?",
    "lede": "They look alike from the outside, but they do different jobs. One records; the other lets you answer.",
    "img": "/media/blog/door-phone-or-cctv.jpg",
    "alt": "Front gate of a house at dusk with a video door phone on the gate pillar",
    "body": "<p>Both put a camera at your gate, so it’s easy to assume you only need one. In practice they solve different problems.</p>\n<h2>What a video door phone does</h2>\n<p>A door phone is about the moment someone arrives. A visitor presses the call button; you see and speak to them on an indoor monitor — or on your phone, if the system is app-connected — and decide whether to open the gate or door remotely. Nobody has to walk out to check who is there.</p>\n<h2>What CCTV does</h2>\n<p>CCTV is about everything else: continuous recording, a wider view of the approach and the street, and footage you can go back to later. It watches whether or not anyone rings the bell.</p>\n<h2>Why they work better together</h2>\n<ul><li>The door phone lets you answer and open; the cameras record the whole approach.</li><li>With the call and the recording in one app, you can check who came by and when — even if you missed the call.</li><li>Opening the gate remotely is safer when a camera shows you what’s outside first.</li></ul>\n<h2>A simple rule of thumb</h2>\n<p>For independent houses and villas, plan both. In apartments, where the building usually manages the common-area cameras, a video door phone at your own door is often enough.</p>"
  },
  {
    "slug": "choosing-access-control",
    "cat": "Access control",
    "ic": "access",
    "read": 4,
    "title": "Fingerprint, face or card: choosing access control for your office",
    "lede": "Each way of opening a door trades off cost, speed and security. Here’s how to pick — or combine — them.",
    "img": "/media/blog/choosing-access-control.jpg",
    "alt": "Man using a fingerprint reader beside the front door of a house",
    "body": "<p>Keys are hard to control: they get copied, lent and lost, and a lock never tells you who used it. Electronic access control fixes that — every entry is verified and logged. The main decision is how people identify themselves at the door.</p>\n<h2>Cards and fobs</h2>\n<p>Cheap to issue and easy to cancel when someone leaves, which makes them good for visitors, contractors and large teams. The weakness: a card proves that someone has the card, not who they are. Cards get shared and lost.</p>\n<h2>Fingerprint</h2>\n<p>A fingerprint can’t be lent to a colleague, and it’s quick at the door. Readers can struggle with very dry, wet or worn fingers, so enrol two fingers per person and keep a backup method for anyone who has trouble.</p>\n<h2>Face recognition</h2>\n<p>Touch-free and fast, which suits busy entrances. It depends on good placement and lighting at the door, so it needs a little more care at installation.</p>\n<h2>Combine where it matters</h2>\n<p>Many offices mix methods: cards for visitors, fingerprint or face for staff, and two factors — a card plus a fingerprint, say — for server rooms or cash areas. Schedules can limit who enters when, and linking readers to CCTV lets you see who actually walked through at each logged entry.</p>\n<h2>Don’t forget the way out</h2>\n<p>Doors on escape routes must open easily in an emergency. Plan power backup and emergency release from the start, so security never stands between people and the exit.</p>"
  },
  {
    "slug": "automation-scenes",
    "cat": "Home automation",
    "ic": "automation",
    "read": 3,
    "title": "Five automation scenes worth setting up first",
    "lede": "Automation is at its best when one tap — or no tap at all — sets the whole house. Start with these.",
    "img": "/media/blog/automation-scenes.jpg",
    "alt": "Living room in the evening with soft lighting, a ceiling fan and sheer curtains",
    "body": "<p>Switching each light from your phone is fun for a week. The lasting value of home automation is in scenes: one command that sets lighting, fans, curtains and security together. These five cover most of daily life.</p>\n<h2>1. Arrival</h2>\n<p>The gate opens, the porch and living-room lights come on, the alarm disarms and — after dark — the curtains close. It can be triggered from your phone, a keypad or a verified entry at the door.</p>\n<h2>2. Good night</h2>\n<p>Everything off except a soft path light, curtains closed, doors confirmed locked and the alarm armed in night mode: perimeter on, interior off, so you can still move around the house.</p>\n<h2>3. Away</h2>\n<p>Lights and fans off, the alarm fully armed and the cameras set to alert you. Some homes add a few lights on an evening schedule so the house doesn’t look empty.</p>\n<h2>4. Morning</h2>\n<p>Curtains open at a set time, outdoor lights switch off and the night-mode alarm disarms — so the day doesn’t start with a walk around flipping switches.</p>\n<h2>5. Relax</h2>\n<p>Lights dimmed, curtains closed, the fan at a comfortable speed. Small, but it’s the one you’ll reach for every evening.</p>\n<p>Start with scenes like these, then fine-tune the timings once you’ve lived with them for a few weeks.</p>"
  },
  {
    "slug": "when-an-alarm-goes-off",
    "cat": "Burglar alarms",
    "ic": "alarm",
    "read": 4,
    "title": "What actually happens when a burglar alarm goes off",
    "lede": "Sensors, zones, delays and alerts — a plain walk-through of an alarm event, and how to keep false alarms rare.",
    "img": "/media/tech/alerts.jpg",
    "alt": "Phone lighting up with an alert on a bedside table at night",
    "body": "<p>An alarm system looks simple — sensors and a siren — but a lot happens in the few seconds after a sensor trips. Knowing the sequence helps you set it up well.</p>\n<h2>1. A sensor notices something</h2>\n<p>Door and window contacts detect when something opens; motion sensors detect movement inside a room. Each sensor belongs to a zone, such as “front door” or “ground-floor living”.</p>\n<h2>2. The panel decides</h2>\n<p>The control panel checks whether that zone is armed right now. Entry doors usually have a short delay so you can disarm when you come home; other zones trigger at once.</p>\n<h2>3. The response</h2>\n<p>The siren sounds and an alert goes to the phones you’ve chosen, naming the zone. In an integrated system more happens at the same moment: nearby cameras mark the recording and outdoor lights switch on — so the alert arrives with footage you can check.</p>\n<h2>Keeping false alarms rare</h2>\n<ul><li>Keep motion sensors away from curtains that move in a breeze, direct sun and air-conditioner outlets.</li><li>Choose pet-friendly sensors if animals are at home.</li><li>Use night mode: arm the perimeter while you sleep and leave the interior off.</li><li>Test the system regularly and replace sensor batteries when the app asks.</li></ul>\n<p>An alarm nobody trusts gets switched off. A well-placed one, tied to cameras you can check from your phone, is one you’ll actually leave armed.</p>"
  },
  {
    "slug": "plan-security-while-you-build",
    "cat": "Planning",
    "ic": "plan",
    "read": 3,
    "title": "Building a new home? Plan security before the plaster",
    "lede": "The easiest time to add security is while the walls are still open. What to decide with your architect and electrician.",
    "img": "/media/spaces/build.jpg",
    "alt": "House under construction with conduits in the walls and drawings on a table",
    "body": "<p>Many security systems in finished homes are compromises: cameras where a cable could reach, readers where there happened to be a socket. Bring security into the plan while the building is going up and none of that is necessary.</p>\n<h2>Run conduits early</h2>\n<p>Concealed conduit to every camera point, the gate, each door that will have a reader and every place a sensor might go costs little during construction. Adding it later means surface trunking or cutting into finished walls.</p>\n<h2>Fix positions on the drawings</h2>\n<p>Decide camera positions, the video door phone at the gate, readers and smart locks at the doors, and alarm sensor points while the electrical layout is being drawn. Curtain motors need a power point at the pelmet; a gate motor needs power and a cable run at the gate.</p>\n<h2>Give the system a home</h2>\n<p>Pick one ventilated spot for the recorder, network equipment and alarm panel, with power backup so cameras keep recording through a power cut. Plan Wi-Fi coverage for the whole plot, not just the living room.</p>\n<h2>Get everyone in one meeting</h2>\n<p>One meeting between your architect, electrician and security designer settles most of this — and saves rework later.</p>"
  }
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
