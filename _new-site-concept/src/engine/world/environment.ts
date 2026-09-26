/**
 * Blue-hour sky, atmospheric fog, and two image-based lighting environments:
 *  - night:  the sky + warm window glows (used by architecture)
 *  - studio: black room with softboxes (used by hardware, for crisp product highlights)
 */
import * as THREE from "three";

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w; // at far plane
  }
`;

const skyFragment = /* glsl */ `
  uniform float uBrightness;
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uGlowDir;
  varying vec3 vDir;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
    col = mix(col, uZenith, smoothstep(0.15, 0.85, h));
    float g = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), uGlowDir), 0.0), 3.0);
    col += uGlow * g * exp(-max(h, 0.0) * 9.0);
    // distant horizon silhouette band (hills / tree line)
    float band = smoothstep(0.035, 0.0, h + 0.012 * sin(d.x * 9.0 + d.z * 5.0) + 0.006 * sin(d.x * 31.0));
    col = mix(col, uHorizon * 0.28, band * 0.85);
    col *= uBrightness;
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createSky() {
  const uniforms = {
    uBrightness: { value: 1 },
    uZenith: { value: new THREE.Color(0x050c1c) },
    uMid: { value: new THREE.Color(0x152a48) },
    uHorizon: { value: new THREE.Color(0x3b5070) },
    uGlow: { value: new THREE.Color(0x5a3a2c) },
    uGlowDir: { value: new THREE.Vector3(-0.7, 0, -0.7).normalize() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

/** PMREM night environment: sky dome + low warm glows (house windows, garden lights). */
export function createNightEnv(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const sky = createSky();
  sky.mesh.scale.setScalar(0.05);
  scene.add(sky.mesh);
  const warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb468).multiplyScalar(2.2) });
  const panels: [number, number, number, number, number][] = [
    // x, y, z, w, h   (panels face the origin)
    [-14, 2, -20, 18, 3],
    [10, 5, -25, 8, 2],
    [25, 1.5, 12, 6, 1.5],
  ];
  for (const [x, y, z, w, h] of panels) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), warm);
    m.position.set(x, y, z);
    m.lookAt(0, y, 0);
    scene.add(m);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  return rt.texture;
}

/** PMREM studio environment: dark room, one large top softbox, two strip boxes, a warm kicker. */
export function createStudioEnv(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010101);
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: 0x060607, side: THREE.BackSide }));
  scene.add(room);
  const box = (c: number, k: number, w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  box(0xffffff, 3.2, 8, 4, [0, 5.5, 1]); // top
  box(0xf4f1ec, 5, 1.2, 7, [-6, 1, 3]); // left strip
  box(0xeaf0ff, 4, 1.0, 7, [6, 1, -2]); // right strip (cool)
  box(0xffc890, 2.5, 5, 1.2, [2, -1, 7]); // warm floor kicker
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.015);
  pmrem.dispose();
  return rt.texture;
}
