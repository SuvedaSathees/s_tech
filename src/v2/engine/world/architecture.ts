/**
 * The residence: a two-level modern villa at blue hour.
 * Limestone cantilever over a glazed ground floor, basalt feature wall,
 * walnut pivot door, timber fins, pool, cypress garden, driveway.
 *
 * Layout (metres): +Z faces the garden / viewer, Y is up.
 *   Glazing  z = 0, x ∈ [-10, 5.4]      Entrance portal x ∈ [5.4, 8.4]
 *   Feature wall x ∈ [8.4, 9.0], z ∈ [-8, 4]  (hero camera on its tip)
 *   Upper volume cantilevers to z = 2.2    Pool x ∈ [-9.5, 1.5], z ∈ [3.2, 8.2]
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as T from "./textures";

export type Architecture = ReturnType<typeof buildArchitecture>;

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

/** Place a box by its min/max extents. */
function slab(mat: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, rounded = 0) {
  const g = rounded > 0 ? new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 2, rounded) : box(x1 - x0, y1 - y0, z1 - z0);
  const m = new THREE.Mesh(g, mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** World-space UVs for box faces so textures keep real scale regardless of size. */
function worldUV(mesh: THREE.Mesh, scale: number) {
  const g = mesh.geometry as THREE.BufferGeometry;
  const pos = g.attributes.position, nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  mesh.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).add(mesh.position);
    n.fromBufferAttribute(nor, i);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    let u = 0, w = 0;
    if (ax >= ay && ax >= az) { u = v.z; w = v.y; }
    else if (ay >= ax && ay >= az) { u = v.x; w = v.z; }
    else { u = v.x; w = v.y; }
    uv[i * 2] = u / scale;
    uv[i * 2 + 1] = w / scale;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return mesh;
}

function pbr(set: T.PBRSet, params: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ ...set, ...params });
}

export function buildArchitecture(opts: { reflector: boolean }) {
  const root = new THREE.Group();
  root.name = "Architecture";

  /* ---------- materials ---------- */
  const lime = pbr(T.limestone(), { color: 0xffffff, normalScale: new THREE.Vector2(0.6, 0.6) });
  const bas = pbr(T.basalt(), { color: 0xffffff, normalScale: new THREE.Vector2(0.9, 0.9) });
  const pav = pbr(T.pavers(), { color: 0xffffff, envMapIntensity: 1.4 });
  const drive = pbr(T.pavers(), { color: 0x9a948c, envMapIntensity: 1.2 });
  const conc = pbr(T.concrete(), { color: 0xd8d4cc });
  const wal = pbr(T.walnut(), { color: 0xffffff });
  const grass = pbr(T.lawn(), { color: 0xffffff });
  const bronze = new THREE.MeshPhysicalMaterial({ color: 0x3b2f24, metalness: 0.9, roughness: 0.38, clearcoat: 0.3 });
  const mullion = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.7, roughness: 0.35 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x8fa3b0, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.2,
    envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide, specularIntensity: 1,
  });
  const floorIn = new THREE.MeshStandardMaterial({ color: 0xb9ae9d, roughness: 0.32 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0xcfc4b4, roughness: 0.9 });
  const fabric = new THREE.MeshStandardMaterial({ color: 0x7a7066, roughness: 0.95 });
  const fabricDark = new THREE.MeshStandardMaterial({ color: 0x2b2826, roughness: 0.9 });
  const marble = new THREE.MeshPhysicalMaterial({ color: 0x111112, roughness: 0.12, clearcoat: 1 });
  const stoneIsland = new THREE.MeshPhysicalMaterial({ color: 0xd9d3c8, roughness: 0.25, clearcoat: 0.6 });

  // emissive "practicals" (their intensity is driven by the timeline)
  const warm = new THREE.Color(0xffb46b);
  const mkEmit = (c: number, i = 0) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(c), emissiveIntensity: i, roughness: 1 });
  const eDownlight = mkEmit(0xffd2a0);
  const eCove = mkEmit(0xffb870);
  const eInterior = new THREE.MeshBasicMaterial({ map: T.interiorPlate(), color: 0x000000, toneMapped: true });
  const eFins = mkEmit(0xffa55a);
  const eBollard = mkEmit(0xffcf98);
  const eFoyer = mkEmit(0xffc58a);
  const ePendant = mkEmit(0xffc27e);
  const eStrip = mkEmit(0xffd6a8);

  const add = (o: THREE.Object3D) => (root.add(o), o);

  /* ---------- ground ---------- */
  const lawnMesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), grass);
  lawnMesh.rotation.x = -Math.PI / 2;
  lawnMesh.position.y = -0.02;
  (grass.map as THREE.Texture).repeat.set(80, 80);
  (grass.roughnessMap as THREE.Texture).repeat.set(80, 80);
  (grass.normalMap as THREE.Texture).repeat.set(80, 80);
  lawnMesh.receiveShadow = true;
  add(lawnMesh);

  // terrace pavers around the house and pool
  const terrace = worldUV(slab(pav, -14, 9, -0.02, 0.02, -10, 11.5), 4.8);
  add(terrace);
  // driveway
  const driveway = worldUV(slab(drive, 9.6, 15.6, -0.015, 0.018, -1.2, 80), 4.8);
  add(driveway);

  /* ---------- ground floor ---------- */
  add(worldUV(slab(conc, -11, 8.4, 0.02, 0.18, -8, 0.6), 3));
  // glazing + mullions
  const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(15.4, 3.37), glass);
  glassMesh.position.set(-2.3, 0.18 + 3.37 / 2, 0);
  glassMesh.renderOrder = 5;
  add(glassMesh);
  for (let x = -10; x <= 5.41; x += 15.4 / 6) add(slab(mullion, x - 0.035, x + 0.035, 0.18, 3.55, -0.08, 0.05));
  add(slab(mullion, -10, 5.4, 0.18, 0.24, -0.08, 0.05));
  add(slab(mullion, -10, 5.4, 3.48, 3.55, -0.08, 0.05));
  // end wall (left)
  add(worldUV(slab(bas, -10.7, -10, 0, 3.55, -8, 0.4), 3.2));

  /* ---------- interior (seen through glass) ---------- */
  const interior = new THREE.Group();
  root.add(interior);
  interior.add(slab(floorIn, -10, 5.4, 0.18, 0.2, -7.6, 0));
  interior.add(slab(plaster, -10, 5.4, 3.38, 3.55, -7.6, 0)); // ceiling
  const backWall = worldUV(slab(wal, -10, 5.4, 0.2, 3.38, -7.8, -7.6), 2.4);
  interior.add(backWall);
  interior.add(slab(plaster, -10, -9.9, 0.2, 3.38, -7.6, 0));
  // cove light along the back wall + ceiling downlights
  interior.add(slab(eCove, -9.9, 5.3, 3.3, 3.34, -7.58, -7.5));
  for (const x of [-8.2, -5.6, -3, -0.4, 2.2, 4.4])
    for (const z of [-2, -5]) {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), eDownlight);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, 3.375, z);
      interior.add(d);
    }
  // living: L-sofa, coffee table, chairs
  const rb = (mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, r = 0.06) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    interior.add(m);
    return m;
  };
  rb(fabric, -2.2, 0.42, -4.6, 3.6, 0.44, 1.0);
  rb(fabric, -2.2, 0.8, -5.02, 3.6, 0.5, 0.2);
  rb(fabric, -0.1, 0.42, -3.6, 1.0, 0.44, 2.2);
  rb(marble, -2.6, 0.38, -3.1, 1.6, 0.3, 0.9, 0.03);
  rb(fabricDark, -5.2, 0.45, -2.6, 0.85, 0.5, 0.85, 0.12);
  rb(fabricDark, -5.2, 0.45, -4.0, 0.85, 0.5, 0.85, 0.12);
  // dining with linear pendant
  rb(wal, 2.4, 0.76, -3.2, 2.4, 0.06, 1.0, 0.015);
  for (const sx of [-1, 1]) rb(bronze, 2.4 + sx * 0.95, 0.38, -3.2, 0.06, 0.72, 0.8, 0.01);
  interior.add(slab(ePendant, 1.5, 3.3, 2.2, 2.23, -3.22, -3.18));
  interior.add(slab(bronze, 1.48, 3.32, 2.23, 2.27, -3.24, -3.16));
  // kitchen island (left)
  rb(stoneIsland, -8.2, 0.48, -3.6, 1.1, 0.9, 3.0, 0.02);
  // floating walnut stair against the back wall
  for (let i = 0; i < 12; i++) rb(wal, 3.4 + i * 0.16, 0.36 + i * 0.26, -7.2, 0.3, 0.06, 0.9, 0.01);
  // artwork
  const artC = document.createElement("canvas");
  artC.width = 512; artC.height = 320;
  const ax = artC.getContext("2d")!;
  const ag = ax.createLinearGradient(0, 0, 512, 320);
  ag.addColorStop(0, "#2d2a28"); ag.addColorStop(0.5, "#8b6c4c"); ag.addColorStop(1, "#1b1a19");
  ax.fillStyle = ag; ax.fillRect(0, 0, 512, 320);
  ax.fillStyle = "rgba(230,220,200,0.18)"; ax.fillRect(300, 40, 12, 240);
  const artTex = new THREE.CanvasTexture(artC);
  artTex.colorSpace = THREE.SRGBColorSpace;
  const art = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.8 }));
  art.position.set(-2.2, 1.9, -7.58);
  interior.add(art);

  // interior lights (3 zones, right → left)
  const interiorLights: THREE.PointLight[] = [];
  for (const x of [3, -2, -7]) {
    const l = new THREE.PointLight(warm, 0, 11, 2);
    l.position.set(x, 2.9, -3.2);
    interior.add(l);
    interiorLights.push(l);
  }

  // motorised sheers behind the glazing (scaled from the top)
  const sheerMat = new THREE.MeshStandardMaterial({
    color: 0xf3ede3, emissive: new THREE.Color(0xffc48c), emissiveIntensity: 0, roughness: 1, map: T.pleats(),
    transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false,
  });
  const sheers: THREE.Mesh[] = [];
  const bay = 15.4 / 6;
  for (const i of [0, 1, 4, 5]) {
    const g = new THREE.PlaneGeometry(bay - 0.12, 3.2);
    g.translate(0, -1.6, 0); // pivot at top
    const s = new THREE.Mesh(g, sheerMat);
    s.position.set(-10 + bay * (i + 0.5), 3.36, -0.25);
    s.scale.y = 0.02;
    interior.add(s);
    sheers.push(s);
  }

  /* ---------- entrance portal, pivot door, foyer ---------- */
  add(worldUV(slab(bas, 5.4, 5.95, 0, 3.55, -0.6, 0.18), 3.2));
  add(worldUV(slab(bas, 7.65, 8.4, 0, 3.55, -0.6, 0.18), 3.2));
  add(worldUV(slab(bas, 5.95, 7.65, 3.36, 3.55, -0.6, 0.18), 3.2));
  // foyer volume (warm)
  add(slab(eFoyer, 5.95, 7.65, 0.18, 3.36, -4.6, -4.5));
  add(worldUV(slab(wal, 5.9, 5.95, 0.18, 3.36, -4.5, -0.5), 1.6));
  add(worldUV(slab(wal, 7.65, 7.7, 0.18, 3.36, -4.5, -0.5), 1.6));
  add(slab(plaster, 5.9, 7.7, 3.36, 3.42, -4.6, -0.5));
  add(slab(floorIn, 5.95, 7.65, 0.18, 0.2, -4.5, -0.5));
  const foyerLight = new THREE.PointLight(0xffb870, 0, 7, 2);
  foyerLight.position.set(6.8, 2.6, -2.2);
  root.add(foyerLight);
  // spill through the opening onto the step and terrace
  const spill = new THREE.SpotLight(0xffb870, 0, 12, 0.62, 0.9, 1.6);
  spill.position.set(6.8, 2.9, -2.5);
  spill.target.position.set(6.8, 0, 3.5);
  root.add(spill, spill.target);
  // pivot door (walnut slab with bronze pull)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(6.0 + 0.42, 0.2, -0.42);
  root.add(doorPivot);
  const doorLeaf = worldUV(slab(wal, -0.42, 1.2, 0, 3.16, -0.04, 0.04), 1.6);
  doorLeaf.position.x -= 0; // leaf spans from the pivot
  doorPivot.add(doorLeaf);
  const pull = slab(bronze, 1.02, 1.06, 0.7, 2.2, 0.04, 0.09);
  doorPivot.add(pull);
  // entrance step (floating)
  add(worldUV(slab(lime, 5.7, 7.9, 0.02, 0.2, 0.18, 1.2), 2));
  const stepGlow = slab(eStrip, 5.75, 7.85, 0.02, 0.035, 1.18, 1.22);
  add(stepGlow);

  const panelLight = new THREE.SpotLight(0xffe2bf, 0, 4, 0.35, 0.8, 1.5);
  panelLight.position.set(8.0, 3.3, 0.9);
  panelLight.target.position.set(8.0, 1.3, 0.18);
  root.add(panelLight, panelLight.target);

  /* ---------- feature wall (hero camera mount) ---------- */
  const featureWall = worldUV(slab(bas, 8.4, 9.0, 0, 4.3, -8, 4.0), 3.2);
  add(featureWall);
  // grazers at its foot
  const grazerA = new THREE.SpotLight(0xffc088, 0, 7, 0.5, 0.85, 1.4);
  grazerA.position.set(8.7, 0.08, 4.35);
  grazerA.target.position.set(8.7, 5, 3.9);
  const grazerB = new THREE.SpotLight(0xffc088, 0, 7, 0.55, 0.9, 1.4);
  grazerB.position.set(5.68, 0.08, 0.5);
  grazerB.target.position.set(5.68, 5, 0.1);
  root.add(grazerA, grazerA.target, grazerB, grazerB.target);

  /* ---------- upper volume (cantilever) ---------- */
  const upper = worldUV(slab(lime, -12, 6.8, 3.55, 7.0, -8.4, 2.2), 3.6);
  add(upper);
  add(worldUV(slab(conc, -12.3, 7.1, 7.0, 7.28, -8.7, 2.5), 3)); // roof fascia
  // soffit downlights + spots
  const soffitSpots: THREE.SpotLight[] = [];
  for (const x of [-8.5, -5.5, -2.5, 0.5, 3.5]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), eDownlight);
    d.rotation.x = Math.PI / 2;
    d.position.set(x, 3.545, 1.2);
    root.add(d);
  }
  for (const x of [-7, -1, 4.2]) {
    const s = new THREE.SpotLight(0xffcf9a, 0, 9, 0.75, 1, 1.5);
    s.position.set(x, 3.5, 1.2);
    s.target.position.set(x, 0, 1.6);
    root.add(s, s.target);
    soffitSpots.push(s);
  }
  // linear LED along the cantilever edge
  add(slab(eStrip, -12, 6.8, 3.53, 3.55, 2.12, 2.18));

  // bronze-framed picture window (protruding)
  const px0 = -9, px1 = 1.6, py0 = 4.25, py1 = 6.45, pz = 2.2, depth = 0.4, t = 0.12;
  add(slab(bronze, px0 - t, px1 + t, py1, py1 + t, pz - 0.05, pz + depth));
  add(slab(bronze, px0 - t, px1 + t, py0 - t, py0, pz - 0.05, pz + depth));
  add(slab(bronze, px0 - t, px0, py0, py1, pz - 0.05, pz + depth));
  add(slab(bronze, px1, px1 + t, py0, py1, pz - 0.05, pz + depth));
  const pw = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, py1 - py0), eInterior);
  pw.position.set((px0 + px1) / 2, (py0 + py1) / 2, pz + 0.02);
  add(pw);
  const pwGlass = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, py1 - py0), glass);
  pwGlass.position.set((px0 + px1) / 2, (py0 + py1) / 2, pz + 0.25);
  add(pwGlass);

  // timber fins with warm light behind (upper right)
  add(slab(eFins, 2.9, 5.9, 3.95, 6.75, pz + 0.01, pz + 0.02));
  const finGeo = box(0.06, 2.9, 0.22);
  const fins = new THREE.InstancedMesh(finGeo, wal, 22);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 22; i++) {
    mtx.makeTranslation(2.95 + i * 0.137, 5.35, pz + 0.14);
    fins.setMatrixAt(i, mtx);
  }
  fins.castShadow = true;
  add(fins);

  /* ---------- service / garage volume clad in fins ---------- */
  add(worldUV(slab(conc, 9.0, 15.8, 0, 3.4, -8, -1.4), 3));
  add(worldUV(slab(conc, 8.9, 16.0, 3.4, 3.62, -8.2, -0.9), 3));
  const gFins = new THREE.InstancedMesh(box(0.05, 3.3, 0.12), wal, 76);
  for (let i = 0; i < 76; i++) {
    mtx.makeTranslation(9.1 + i * 0.088, 1.68, -1.3);
    gFins.setMatrixAt(i, mtx);
  }
  add(gFins);
  add(slab(eStrip, 9.0, 15.9, 3.38, 3.4, -1.0, -0.95));

  /* ---------- pool ---------- */
  const poolX0 = -9.5, poolX1 = 1.5, poolZ0 = 3.2, poolZ1 = 8.2;
  const cop = 0.4;
  add(worldUV(slab(lime, poolX0 - cop, poolX1 + cop, 0.02, 0.1, poolZ0 - cop, poolZ0), 2));
  add(worldUV(slab(lime, poolX0 - cop, poolX1 + cop, 0.02, 0.1, poolZ1, poolZ1 + cop), 2));
  add(worldUV(slab(lime, poolX0 - cop, poolX0, 0.02, 0.1, poolZ0, poolZ1), 2));
  add(worldUV(slab(lime, poolX1, poolX1 + cop, 0.02, 0.1, poolZ0, poolZ1), 2));
  const waterN = T.waterNormal();
  let water: THREE.Mesh;
  let waterUniforms: Record<string, THREE.IUniform> | null = null;
  const poolGlow = new THREE.Color(0x0e3a42);
  if (opts.reflector) {
    const RS = (Reflector as unknown as { ReflectorShader: { name: string; uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string } }).ReflectorShader;
    const shader = {
      ...RS,
      uniforms: {
        ...THREE.UniformsUtils.clone(RS.uniforms),
        tNormal: { value: waterN },
        uTime: { value: 0 },
        uGlow: { value: new THREE.Color(0x000000) },
      },
      vertexShader: RS.vertexShader
        .replace("varying vec4 vUv;", "varying vec4 vUv;\nvarying vec2 vLocal;")
        .replace("vUv = textureMatrix", "vLocal = uv;\n\t\t\tvUv = textureMatrix"),
      fragmentShader: RS.fragmentShader
        .replace(
          "varying vec4 vUv;",
          "varying vec4 vUv;\nvarying vec2 vLocal;\nuniform sampler2D tNormal;\nuniform float uTime;\nuniform vec3 uGlow;",
        )
        .replace(
          "vec4 base = texture2DProj( tDiffuse, vUv );\n\t\t\tgl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",
          `vec2 n1 = texture2D( tNormal, vLocal * vec2(5.5, 2.5) + vec2(uTime * 0.012, uTime * 0.007) ).xy - 0.5;
			vec2 n2 = texture2D( tNormal, vLocal * vec2(3.0, 1.4) - vec2(uTime * 0.009, -uTime * 0.011) ).xy - 0.5;
			vec2 d = (n1 + n2) * 0.035;
			vec4 uvp = vUv; uvp.xy += d * uvp.w;
			vec4 base = texture2DProj( tDiffuse, uvp );
			float fres = 0.35 + 0.65 * pow(1.0 - clamp(abs(d.y) * 6.0, 0.0, 1.0), 2.0);
			vec3 refl = base.rgb * color * 2.2 * fres;
			float caust = smoothstep(0.02, 0.09, length(n1 - n2));
			gl_FragColor = vec4( refl + uGlow * (0.75 + 0.5 * caust), 1.0 );`,
        ),
    };
    const r = new Reflector(new THREE.PlaneGeometry(poolX1 - poolX0, poolZ1 - poolZ0), {
      textureWidth: 1024,
      textureHeight: 512,
      color: 0x8fa9b4,
      shader,
      multisample: 0,
    });
    waterUniforms = (r.material as THREE.ShaderMaterial).uniforms;
    water = r;
  } else {
    water = new THREE.Mesh(
      new THREE.PlaneGeometry(poolX1 - poolX0, poolZ1 - poolZ0),
      new THREE.MeshPhysicalMaterial({ color: 0x0a1c22, roughness: 0.04, metalness: 0, normalMap: waterN, normalScale: new THREE.Vector2(0.25, 0.25), emissive: poolGlow, emissiveIntensity: 0, envMapIntensity: 1.5 }),
    );
  }
  water.rotation.x = -Math.PI / 2;
  water.position.set((poolX0 + poolX1) / 2, 0.06, (poolZ0 + poolZ1) / 2);
  add(water);

  /* ---------- garden: cypresses with fake uplight ---------- */
  const leafN = T.lawn().normalMap;
  leafN.repeat.set(6, 10);
  const cypressMat = new THREE.MeshStandardMaterial({ color: 0x1d2a1f, roughness: 0.95, normalMap: leafN, normalScale: new THREE.Vector2(2.5, 2.5) });
  const uplight = { value: 0 };
  cypressMat.onBeforeCompile = (s) => {
    s.uniforms.uUp = uplight;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vH;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvH = position.y;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vH;\nuniform float uUp;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.9,0.55,0.3) * uUp * 0.07 * exp(-vH * 0.7) * (0.5 + 0.5 * vNormal.z);",
      );
  };
  const cypressGeo = (() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const tt = i / 24;
      const base = Math.min(1, tt / 0.07);
      const top = Math.pow(Math.max(0, 1 - Math.pow(tt, 2.6)), 0.55);
      const r = 0.78 * Math.sqrt(base) * top * (1 - tt * 0.15) + (tt < 0.02 ? 0.12 : 0);
      pts.push(new THREE.Vector2(Math.max(r, 0.01), tt * 10));
    }
    const g = new THREE.LatheGeometry(pts, 40);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.z, v.x);
      const n = 1 + 0.1 * Math.sin(a * 5 + v.y * 1.7) + 0.09 * Math.sin(a * 11 - v.y * 4.3) + 0.07 * Math.sin(a * 23 + v.y * 9.0) + 0.05 * Math.sin(v.y * 13.0 + a * 3);
      p.setXYZ(i, v.x * n, v.y, v.z * n);
    }
    g.computeVertexNormals();
    return g;
  })();
  const cypressSpots: [number, number, number][] = [
    [-15.5, -9.5, 1.05], [-12.5, -11, 0.9], [-4, -11.5, 1.1], [3.5, -11, 0.95], [11.5, -10.5, 1.05],
    [-16.5, 3.5, 0.95], [-18.5, 11, 1.1], [18.5, 5, 1.0], [20, -3, 1.1],
    [-30, 32, 1.2], [-22, 32.5, 1.0], [26, 32, 1.15], [34, 31, 1.0],
  ];
  const cypresses = new THREE.InstancedMesh(cypressGeo, cypressMat, cypressSpots.length);
  cypressSpots.forEach(([x, z, s], i) => {
    mtx.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, i * 1.7, 0)), new THREE.Vector3(s, s * (0.95 + (i % 3) * 0.08), s));
    cypresses.setMatrixAt(i, mtx);
  });
  add(cypresses);

  /* ---------- boundary wall, gate pillars, bollards ---------- */
  add(worldUV(slab(lime, -60, 9.6, 0, 1.15, 34, 34.4), 2.4));
  add(worldUV(slab(lime, 15.6, 60, 0, 1.15, 34, 34.4), 2.4));
  add(worldUV(slab(bas, 9.0, 9.6, 0, 2.1, 33.8, 34.6), 2));
  add(worldUV(slab(bas, 15.6, 16.2, 0, 2.1, 33.8, 34.6), 2));
  const bollards: THREE.Mesh[] = [];
  for (let z = 3; z <= 31; z += 4.5) {
    const b = slab(bronze, 9.25, 9.4, 0, 0.7, z - 0.075, z + 0.075);
    add(b);
    const cap = slab(eBollard, 9.26, 9.39, 0.5, 0.62, z - 0.07, z + 0.07);
    add(cap);
    bollards.push(cap);
  }
  // perimeter beam emitters on the gate pillars
  const beamPosts: THREE.Vector3[] = [new THREE.Vector3(9.3, 0.55, 33.7), new THREE.Vector3(15.9, 0.55, 33.7)];

  // landscape floods for the limestone volume
  const floods: THREE.SpotLight[] = [];
  for (const x of [-9, -1]) {
    const f = new THREE.SpotLight(0xffd1a0, 0, 26, 0.42, 0.9, 1.2);
    f.position.set(x, 0.1, 11);
    f.target.position.set(x + 1.5, 5.4, 2.2);
    root.add(f, f.target);
    floods.push(f);
  }

  // warm spill from the glazing onto terrace & pool edge
  const spillCards: THREE.SpotLight[] = [];
  for (const x of [-6.5, -0.5]) {
    const s = new THREE.SpotLight(warm, 0, 14, 1.0, 1, 1.4);
    s.position.set(x, 2.6, -1.6);
    s.target.position.set(x, 0, 4.5);
    root.add(s, s.target);
    spillCards.push(s);
  }

  /* ---------- driven state ---------- */
  const setLighting = (s: {
    facade: number;
    interior: [number, number, number];
    foyer: number;
    door: number;
    shades: number;
    pool: number;
    time: number;
  }) => {
    const f = s.facade;
    eDownlight.emissiveIntensity = 6 * f;
    eStrip.emissiveIntensity = 2.2 * f;
    eBollard.emissiveIntensity = 5 * f;
    soffitSpots.forEach((l) => (l.intensity = 14 * f));
    grazerA.intensity = 10 * f;
    grazerB.intensity = 7 * f;
    floods.forEach((l) => (l.intensity = 60 * f));
    uplight.value = f;

    const [a, b, c] = s.interior;
    interiorLights[0].intensity = 22 * a;
    interiorLights[1].intensity = 22 * b;
    interiorLights[2].intensity = 22 * c;
    const avg = (a + b + c) / 3;
    eCove.emissiveIntensity = 3.2 * avg;
    ePendant.emissiveIntensity = 7 * a;
    eInterior.color.setScalar(0.25 + 1.1 * avg);
    eFins.emissiveIntensity = 1.6 * avg;
    spillCards[0].intensity = 9 * c;
    spillCards[1].intensity = 9 * b;
    sheerMat.emissiveIntensity = 0.12 * avg;

    foyerLight.intensity = 3.2 * s.foyer;
    eFoyer.emissiveIntensity = 0.9 * s.foyer;
    spill.intensity = 22 * s.door * s.foyer;
    panelLight.intensity = 3.5 * Math.max(s.facade, 0.2);
    doorPivot.rotation.y = -s.door * 1.35;

    sheers.forEach((m, i) => (m.scale.y = Math.max(0.02, s.shades * (i % 2 ? 0.78 : 0.62))));

    if (waterUniforms) {
      waterUniforms.uTime.value = s.time;
      (waterUniforms.uGlow.value as THREE.Color).copy(poolGlow).multiplyScalar(0.12 + s.pool * 1.3);
    } else {
      (water.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.2 + s.pool * 1.2;
    }
  };

  return {
    root,
    glass,
    setLighting,
    doorPivot,
    featureWall,
    beamPosts,
    anchors: {
      cctvMount: new THREE.Vector3(8.7, 3.05, 4.0),
      panelMount: new THREE.Vector3(8.0, 1.42, 0.18),
      stationMount: new THREE.Vector3(9.3, 1.45, 34.6),
      touchPanelMount: new THREE.Vector3(-9.88, 1.45, -2.2),
      hub: new THREE.Vector3(-1.0, 0.2, -6.8),
      soffitDomes: [new THREE.Vector3(-9.6, 3.55, 1.9), new THREE.Vector3(6.4, 3.55, 1.9), new THREE.Vector3(15.6, 3.4, -1.0)],
      pirs: [new THREE.Vector3(-10.0, 2.7, 0.42), new THREE.Vector3(5.4, 2.9, 0.19), new THREE.Vector3(9.0, 2.6, 2.0)],
      siren: new THREE.Vector3(-12.0, 5.8, -2.0),
    },
  };
}
