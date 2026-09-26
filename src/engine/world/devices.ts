/**
 * Security hardware, modelled to real-world dimensions (metres).
 * Every device's optical / facing axis is +Z; mounting surface is at z = 0.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { microRough } from "./textures";

export type DeviceMaterials = ReturnType<typeof createDeviceMaterials>;

export function createDeviceMaterials() {
  const rough = microRough(91, 0.36, 0.035);
  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x2a2c30,
    metalness: 0.55,
    roughness: 1,
    roughnessMap: rough,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
  });
  const graphiteDark = new THREE.MeshPhysicalMaterial({
    color: 0x141518,
    metalness: 0.4,
    roughness: 0.45,
    clearcoat: 0.3,
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color: 0xe8e6e1,
    metalness: 0,
    roughness: 1,
    roughnessMap: microRough(93, 0.42, 0.08),
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    sheen: 0.2,
  });
  const champagne = new THREE.MeshPhysicalMaterial({
    color: 0xc9ab78,
    metalness: 1,
    roughness: 0.28,
    roughnessMap: microRough(95, 0.3, 0.06),
  });
  const blackGlass = new THREE.MeshPhysicalMaterial({
    color: 0x040405,
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    reflectivity: 0.6,
  });
  const lensCoat = new THREE.MeshPhysicalMaterial({
    color: 0x06070c,
    metalness: 0.1,
    roughness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0,
    iridescence: 1,
    iridescenceIOR: 1.85,
    iridescenceThicknessRange: [240, 720],
  });
  const lensInner = new THREE.MeshPhysicalMaterial({ color: 0x010102, metalness: 0.2, roughness: 0.15 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.85 });
  const irLed = new THREE.MeshStandardMaterial({
    color: 0x120505,
    emissive: new THREE.Color(0xb3100a),
    emissiveIntensity: 0,
    roughness: 0.3,
  });
  const statusLed = new THREE.MeshStandardMaterial({
    color: 0x061208,
    emissive: new THREE.Color(0x3cff9a),
    emissiveIntensity: 2,
  });
  return { graphite, graphiteDark, pearl, champagne, blackGlass, lensCoat, lensInner, rubber, irLed, statusLed };
}

const rbox = (w: number, h: number, d: number, r: number, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);

function lathe(points: [number, number][], segments = 96) {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  g.rotateX(Math.PI / 2); // lathe axis y → z
  return g;
}

function engraving(text: string, w = 512, h = 128, color = "rgba(210,196,170,0.9)") {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = color;
  x.font = `500 ${h * 0.3}px Manrope, Helvetica, Arial, sans-serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  (x as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${h * 0.09}px`;
  x.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ================================================================ */
/*  Bullet camera — the hero product                                 */
/* ================================================================ */

export type BulletCamera = {
  group: THREE.Group;
  head: THREE.Group; // pans/tilts
  lensAnchor: THREE.Object3D; // world position/orientation of the optical centre
  irLeds: THREE.MeshStandardMaterial;
};

export function createBulletCamera(m: DeviceMaterials): BulletCamera {
  const group = new THREE.Group();
  group.name = "BulletCamera";

  // Wall plate
  const plate = new THREE.Mesh(rbox(0.1, 0.13, 0.026, 0.012), m.graphite);
  plate.position.z = 0.013;
  group.add(plate);
  const plateRing = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0025, 16, 64), m.champagne);
  plateRing.position.z = 0.027;
  group.add(plateRing);

  // Arm with ball joint
  const arm = new THREE.Mesh(lathe([[0, 0], [0.024, 0], [0.024, 0.004], [0.019, 0.02], [0.016, 0.06], [0.016, 0.07], [0, 0.07]], 48), m.graphite);
  arm.position.z = 0.026;
  group.add(arm);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.024, 48, 32), m.graphite);
  ball.position.z = 0.1;
  group.add(ball);

  // Head (pans on the ball)
  const head = new THREE.Group();
  head.position.z = 0.1;
  group.add(head);

  // Saddle: joins ball to underside of body
  const saddle = new THREE.Mesh(rbox(0.034, 0.05, 0.07, 0.012), m.graphite);
  saddle.position.set(0, 0.034, 0.02);
  head.add(saddle);

  // Body — lathe profile, axis +Z; back cap → front lip
  const body = new THREE.Group();
  body.position.set(0, 0.078, -0.07);
  head.add(body);
  const shell = new THREE.Mesh(
    lathe([
      [0, 0], [0.018, 0.001], [0.032, 0.006], [0.041, 0.016], [0.045, 0.03],
      [0.046, 0.06], [0.046, 0.22], [0.047, 0.232], [0.049, 0.24], [0.049, 0.262], [0.046, 0.266], [0.043, 0.266],
    ]),
    m.graphite,
  );
  body.add(shell);
  // champagne accent band
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0468, 0.0468, 0.006, 96, 1, true), m.champagne);
  band.rotation.x = Math.PI / 2;
  band.position.z = 0.226;
  body.add(band);

  // Front face: black glass + lens + IR array
  const front = new THREE.Group();
  front.position.z = 0.262;
  body.add(front);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.0435, 96), m.blackGlass);
  face.position.z = -0.004;
  front.add(face);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.02, 0.01, 64, 1, true), m.graphiteDark);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.006, -0.003);
  front.add(barrel);
  const lensInnerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.6), m.lensInner);
  lensInnerMesh.rotation.x = Math.PI / 2;
  lensInnerMesh.position.set(0, 0.006, -0.012);
  front.add(lensInnerMesh);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.0175, 64, 32, 0, Math.PI * 2, 0, Math.PI / 3.2), m.lensCoat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.006, -0.0135);
  front.add(lens);
  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.0195, 0.0014, 12, 64), m.champagne);
  lensRing.position.set(0, 0.006, 0.0015);
  front.add(lensRing);

  // IR LED arrays (left & right arcs) — glow deep red in darkness
  const ledGeo = new THREE.CylinderGeometry(0.0026, 0.0026, 0.002, 20);
  ledGeo.rotateX(Math.PI / 2);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const a = (-0.6 + i * 0.4) * 1;
      const led = new THREE.Mesh(ledGeo, m.irLed);
      led.position.set(side * (0.031 * Math.cos(a)), 0.004 + 0.031 * Math.sin(a) * 0.9, -0.003);
      front.add(led);
    }
  }
  const status = new THREE.Mesh(new THREE.SphereGeometry(0.0012, 12, 8), m.statusLed);
  status.position.set(0.0, -0.028, -0.002);
  front.add(status);

  // Sun shield: partial cylinder over the top, overhanging the front
  const shieldGeo = new THREE.CylinderGeometry(0.0535, 0.0535, 0.3, 96, 1, true, -Math.PI * 0.62, Math.PI * 1.24);
  shieldGeo.rotateX(Math.PI / 2);
  const shield = new THREE.Mesh(shieldGeo, m.graphite);
  (shield.material as THREE.Material).side = THREE.DoubleSide;
  shield.position.z = 0.15;
  shield.rotation.z = Math.PI; // open side downward
  body.add(shield);
  // shield edge lips for thickness
  const lipGeo = new THREE.BoxGeometry(0.004, 0.003, 0.3);
  for (const s of [-1, 1]) {
    const lip = new THREE.Mesh(lipGeo, m.graphite);
    const a = Math.PI / 2 + s * Math.PI * 0.62;
    lip.position.set(Math.cos(a) * 0.0535 * -1, Math.sin(a) * 0.0535, 0.15);
    body.add(lip);
  }

  // Engraved logotype on the shield side
  const logoTex = engraving("S TEC SECURE");
  logoTex.center.set(0.5, 0.5);
  logoTex.rotation = Math.PI / 2;
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false, toneMapped: true });
  const logoGeo = new THREE.CylinderGeometry(0.0539, 0.0539, 0.13, 64, 1, true, Math.PI * 0.3, Math.PI * 0.12);
  logoGeo.rotateX(Math.PI / 2);
  const logo = new THREE.Mesh(logoGeo, logoMat);
  logo.position.z = 0.15;
  logo.rotation.z = Math.PI;
  logo.renderOrder = 2;
  body.add(logo);

  const lensAnchor = new THREE.Object3D();
  lensAnchor.position.set(0, 0.006, 0.01);
  front.add(lensAnchor);

  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return { group, head, lensAnchor, irLeds: m.irLed };
}

/* ================================================================ */
/*  Turret / dome camera (soffits, product renders)                   */
/* ================================================================ */

export function createDomeCamera(m: DeviceMaterials, bodyMat: THREE.Material = m.pearl) {
  // mounting surface at z=0, points +Z (for ceiling mounting rotate so +Z is down)
  const group = new THREE.Group();
  const base = new THREE.Mesh(lathe([[0, 0], [0.062, 0], [0.064, 0.004], [0.062, 0.024], [0.05, 0.03], [0, 0.03]]), bodyMat);
  group.add(base);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.043, 64, 48), bodyMat);
  ball.position.z = 0.03;
  group.add(ball);
  const visor = new THREE.Mesh(new THREE.CircleGeometry(0.026, 64), m.blackGlass);
  visor.position.set(0, 0, 0.03 + 0.0425);
  group.add(visor);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.011, 48, 24, 0, Math.PI * 2, 0, Math.PI / 3), m.lensCoat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.004, 0.0655);
  group.add(lens);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0265, 0.0016, 12, 64), m.champagne);
  ring.position.z = 0.0728;
  group.add(ring);
  return group;
}

/* ================================================================ */
/*  Access control reader with live screen                            */
/* ================================================================ */

export type AccessPanel = {
  group: THREE.Group;
  setState: (state: "idle" | "scan" | "granted", t: number) => void;
  ring: THREE.MeshStandardMaterial;
};

export function createAccessPanel(m: DeviceMaterials): AccessPanel {
  const group = new THREE.Group();
  const W = 0.105, H = 0.29;
  const frame = new THREE.Mesh(rbox(W, H, 0.02, 0.009, 5), m.champagne);
  frame.position.z = 0.01;
  group.add(frame);
  const glass = new THREE.Mesh(rbox(W - 0.008, H - 0.008, 0.006, 0.006, 4), m.blackGlass);
  glass.position.z = 0.0205;
  group.add(glass);

  // screen
  const sc = document.createElement("canvas");
  sc.width = 360;
  sc.height = 440;
  const ctx = sc.getContext("2d")!;
  const tex = new THREE.CanvasTexture(sc);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true, color: new THREE.Color(1.6, 1.6, 1.6) });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.074, 0.09), screenMat);
  screen.position.set(0, 0.052, 0.0239);
  group.add(screen);

  // camera pinhole + IR
  const pin = new THREE.Mesh(new THREE.CircleGeometry(0.0045, 32), m.lensCoat);
  pin.position.set(0, 0.122, 0.0239);
  group.add(pin);

  // NFC / status ring
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0xf2e6cf), emissiveIntensity: 0.8 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.0013, 16, 96), ringMat);
  ring.position.set(0, -0.07, 0.0238);
  group.add(ring);
  const icon = new THREE.Mesh(new THREE.CircleGeometry(0.004, 24), ringMat);
  icon.position.set(0, -0.07, 0.0238);
  group.add(icon);

  let last = "";
  const setState = (state: "idle" | "scan" | "granted", t: number) => {
    const key = state + (state === "scan" ? Math.round(t * 40) : "");
    if (key === last) return;
    last = key;
    const w = sc.width, h = sc.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050607";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    const cx = w / 2, cy = h * 0.42;
    if (state === "idle") {
      ctx.fillStyle = "rgba(233,226,212,0.92)";
      ctx.font = "300 64px Manrope, Arial";
      ctx.fillText("19:42", cx, h * 0.36);
      ctx.fillStyle = "rgba(233,226,212,0.5)";
      ctx.font = "500 20px Manrope, Arial";
      ctx.fillText("LOOK AT CAMERA OR TAP", cx, h * 0.62);
      ctx.strokeStyle = "rgba(201,171,120,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, h * 0.8, 22, 0, Math.PI * 2);
      ctx.stroke();
      ringMat.emissive.set(0xf2e6cf);
      ringMat.emissiveIntensity = 0.7;
    } else if (state === "scan") {
      // face frame + sweeping scan line
      ctx.strokeStyle = "rgba(201,171,120,0.95)";
      ctx.lineWidth = 4;
      const r = 110;
      const L = 36;
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
        ctx.beginPath();
        ctx.moveTo(cx + sx * r, cy + sy * r - sy * L);
        ctx.lineTo(cx + sx * r, cy + sy * r);
        ctx.lineTo(cx + sx * r - sx * L, cy + sy * r);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(233,226,212,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 62, 80, 0, 0, Math.PI * 2);
      ctx.stroke();
      const y = cy - r + ((t * 2) % 1) * r * 2;
      const g = ctx.createLinearGradient(0, y - 30, 0, y + 2);
      g.addColorStop(0, "rgba(201,171,120,0)");
      g.addColorStop(1, "rgba(201,171,120,0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, y - 30, r * 2, 32);
      ctx.fillStyle = "rgba(233,226,212,0.75)";
      ctx.font = "500 20px Manrope, Arial";
      ctx.fillText("VERIFYING", cx, h * 0.86);
      ringMat.emissive.set(0xc9ab78);
      ringMat.emissiveIntensity = 1.2 + Math.sin(t * 30) * 0.4;
    } else {
      ctx.strokeStyle = "rgba(111,211,154,1)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 2);
      ctx.lineTo(cx - 6, cy + 26);
      ctx.lineTo(cx + 34, cy - 22);
      ctx.stroke();
      ctx.fillStyle = "rgba(233,226,212,0.95)";
      ctx.font = "400 30px Manrope, Arial";
      ctx.fillText("Welcome home", cx, h * 0.78);
      ctx.fillStyle = "rgba(111,211,154,0.9)";
      ctx.font = "500 18px Manrope, Arial";
      ctx.fillText("ACCESS GRANTED", cx, h * 0.87);
      ringMat.emissive.set(0x6fd39a);
      ringMat.emissiveIntensity = 2.2;
    }
    tex.needsUpdate = true;
  };
  setState("idle", 0);
  return { group, setState, ring: ringMat };
}

/* ================================================================ */
/*  Video door phone — outdoor station                               */
/* ================================================================ */

export function createDoorStation(m: DeviceMaterials) {
  const group = new THREE.Group();
  const W = 0.1, H = 0.22;
  const back = new THREE.Mesh(rbox(W, H, 0.028, 0.01, 5), m.graphite);
  back.position.z = 0.014;
  group.add(back);
  const face = new THREE.Mesh(rbox(W - 0.01, H - 0.01, 0.004, 0.007, 4), m.blackGlass);
  face.position.z = 0.029;
  group.add(face);
  // camera module
  const camRing = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0016, 12, 64), m.champagne);
  camRing.position.set(0, 0.075, 0.0315);
  group.add(camRing);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.009, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3), m.lensCoat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.075, 0.026);
  group.add(lens);
  // speaker grille
  const holeGeo = new THREE.CircleGeometry(0.0011, 10);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 9; c++) {
      const hmesh = new THREE.Mesh(holeGeo, holeMat);
      hmesh.position.set((c - 4) * 0.0055, 0.03 - r * 0.0055, 0.0312);
      group.add(hmesh);
    }
  // call button with halo
  const halo = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0xf2e6cf), emissiveIntensity: 1.4 });
  const btnRing = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.0014, 16, 96), halo);
  btnRing.position.set(0, -0.05, 0.0315);
  group.add(btnRing);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 64), m.champagne);
  btn.rotation.x = Math.PI / 2;
  btn.position.set(0, -0.05, 0.032);
  group.add(btn);
  return { group, halo };
}

/* ================================================================ */
/*  Indoor touch panel (automation / door-phone monitor)             */
/* ================================================================ */

export function createTouchPanel(m: DeviceMaterials, w = 0.2, h = 0.13) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(rbox(w, h, 0.012, 0.006, 4), m.champagne);
  frame.position.z = 0.006;
  group.add(frame);
  const glass = new THREE.Mesh(rbox(w - 0.006, h - 0.006, 0.004, 0.004, 3), m.blackGlass);
  glass.position.z = 0.0125;
  group.add(glass);
  const sc = document.createElement("canvas");
  sc.width = 640;
  sc.height = Math.round(640 * (h / w));
  const ctx = sc.getContext("2d")!;
  const tex = new THREE.CanvasTexture(sc);
  tex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.016, h - 0.016), screenMat);
  screen.position.z = 0.0148;
  group.add(screen);

  let lastActive = -1;
  const draw = (active: number) => {
    if (active === lastActive) return;
    lastActive = active;
    const W = sc.width, H = sc.height;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0b0c0e");
    g.addColorStop(1, "#15161a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(233,226,212,0.95)";
    ctx.font = "300 54px Manrope, Arial";
    ctx.textAlign = "left";
    ctx.fillText("Evening", 36, 84);
    ctx.fillStyle = "rgba(233,226,212,0.45)";
    ctx.font = "500 18px Manrope, Arial";
    ctx.fillText("ALL SYSTEMS ARMED · 24°C", 38, 120);
    const labels = ["Arrive", "Evening", "Cinema", "Night"];
    labels.forEach((l, i) => {
      const x = 36 + i * ((W - 72) / 4), y = H - 150, bw = (W - 72) / 4 - 14;
      ctx.fillStyle = i === active ? "rgba(201,171,120,0.95)" : "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.roundRect(x, y, bw, 110, 14);
      ctx.fill();
      ctx.fillStyle = i === active ? "#0b0c0e" : "rgba(233,226,212,0.7)";
      ctx.font = "500 20px Manrope, Arial";
      ctx.fillText(l, x + 18, y + 90);
    });
    tex.needsUpdate = true;
  };
  draw(1);
  return { group, draw, screenMat };
}

/* ================================================================ */
/*  Alarm: keypad, PIR motion sensor, siren                           */
/* ================================================================ */

export function createAlarmKeypad(m: DeviceMaterials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.14, 0.2, 0.024, 0.012, 5), m.pearl);
  body.position.z = 0.012;
  group.add(body);
  const glass = new THREE.Mesh(rbox(0.124, 0.184, 0.004, 0.008, 4), m.blackGlass);
  glass.position.z = 0.025;
  group.add(glass);
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: new THREE.Color(0xf0e2c6), emissiveIntensity: 0.9 });
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, 256, 320);
  x.fillStyle = "rgba(240,226,198,0.95)";
  x.font = "300 34px Manrope, Arial";
  x.textAlign = "center";
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
  keys.forEach((k, i) => x.fillText(k, 48 + (i % 3) * 80, 78 + Math.floor(i / 3) * 66));
  x.fillStyle = "rgba(111,211,154,0.95)";
  x.font = "500 16px Manrope, Arial";
  x.fillText("ARMED", 128, 304);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const keysMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.125), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending }));
  keysMesh.position.set(0, -0.005, 0.0275);
  group.add(keysMesh);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.003, 16), keyMat);
  led.position.set(0, 0.078, 0.0275);
  group.add(led);
  return group;
}

export function createPIR(m: DeviceMaterials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.065, 0.11, 0.045, 0.02, 6), m.pearl);
  body.position.z = 0.0225;
  group.add(body);
  const fresnel = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.2),
    new THREE.MeshPhysicalMaterial({ color: 0xf1efe9, roughness: 0.3, transmission: 0, clearcoat: 0.6, sheen: 0.4 }),
  );
  fresnel.rotation.x = Math.PI / 2;
  fresnel.scale.set(0.9, 1, 0.55);
  fresnel.position.set(0, 0.012, 0.04);
  group.add(fresnel);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 16), new THREE.MeshBasicMaterial({ color: 0x3cff9a }));
  led.position.set(0, -0.036, 0.0452);
  group.add(led);
  return group;
}

export function createSiren(m: DeviceMaterials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.2, 0.28, 0.07, 0.03, 6), m.pearl);
  body.position.z = 0.035;
  group.add(body);
  const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x2a0606, emissive: new THREE.Color(0xff2a14), emissiveIntensity: 0.25, roughness: 0.2, clearcoat: 1 });
  const lens = new THREE.Mesh(rbox(0.12, 0.05, 0.02, 0.012, 4), lensMat);
  lens.position.set(0, 0.07, 0.07);
  group.add(lens);
  const grille = new THREE.Mesh(rbox(0.13, 0.09, 0.006, 0.01, 3), m.graphiteDark);
  grille.position.set(0, -0.05, 0.071);
  group.add(grille);
  return { group, lensMat };
}

/** Central controller / NVR — a small monolith. */
export function createHub(m: DeviceMaterials) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.3, 0.06, 0.24, 0.012, 4), m.graphite);
  body.position.y = 0.03;
  group.add(body);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.002), new THREE.MeshBasicMaterial({ color: 0xc9ab78 }));
  strip.position.set(0, 0.03, 0.121);
  group.add(strip);
  return group;
}
