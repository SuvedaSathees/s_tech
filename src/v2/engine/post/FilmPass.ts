/**
 * Final display-space pass: colour grade, surveillance IR look,
 * system (schematic) tint, chromatic aberration, vignette, grain, letterbox, fades.
 * Runs after OutputPass (tone mapping + sRGB), so all values here are display-referred.
 */
import * as THREE from "three";

export const FilmShader = {
  name: "StecFilmShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uFade: { value: 1 }, // 0 = black, 1 = picture
    uFlash: { value: 0 }, // white-out for lens transitions
    uIR: { value: 0 }, // 0..1 infrared surveillance feed
    uSystem: { value: 0 }, // 0..1 schematic tint
    uGrain: { value: 0.06 },
    uVignette: { value: 0.42 },
    uCA: { value: 0.0018 },
    uLetterbox: { value: 0 }, // 0..1 → 2.39:1 bars
    uSaturation: { value: 0.92 },
    uLift: { value: new THREE.Vector3(0.012, 0.016, 0.024) },
    uGain: { value: new THREE.Vector3(1.03, 1.0, 0.96) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uFade, uFlash, uIR, uSystem, uGrain, uVignette, uCA, uLetterbox, uSaturation;
    uniform vec2 uResolution;
    uniform vec3 uLift, uGain;
    varying vec2 vUv;

    float hash(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }

    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;

      // IR feed: slight barrel distortion like a wide CCTV lens
      uv = mix(uv, 0.5 + c * (1.0 - 0.06 * dot(c, c) * 4.0), uIR);

      // chromatic aberration grows toward the edges
      float ca = uCA * (0.3 + dot(c, c) * 3.0) * (1.0 - uIR * 0.5);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + c * ca).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - c * ca).b;

      // grade: lift / gain + gentle saturation
      col = col * uGain + uLift * (1.0 - col);
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, uSaturation);

      // schematic system view: cool, desaturated base so the overlay reads
      vec3 sys = vec3(l * 0.55) * vec3(0.78, 0.9, 1.08) + col * 0.25;
      col = mix(col, sys, uSystem * 0.85);

      // IR surveillance look
      if (uIR > 0.001) {
        float y = dot(col, vec3(0.3, 0.59, 0.11));
        y = pow(clamp(y * 1.7, 0.0, 1.0), 0.85);
        y = smoothstep(0.02, 0.95, y);
        float lines = 0.94 + 0.06 * sin(uv.y * uResolution.y * 1.4);
        float n = hash(uv * uResolution + fract(uTime * 43.0)) - 0.5;
        vec3 ir = vec3(y) * vec3(0.93, 0.98, 1.0) * lines + n * 0.12;
        ir *= 1.0 - 0.9 * pow(length(c) * 1.25, 3.0);
        col = mix(col, ir, uIR);
      }

      // vignette
      float v = smoothstep(0.95, 0.25, length(c * vec2(1.0, 0.85)));
      col *= mix(1.0, v, uVignette);

      // grain (luma-weighted, animated)
      float g = hash(uv * uResolution + fract(uTime) * 100.0) - 0.5;
      col += g * uGrain * (0.35 + 0.65 * (1.0 - l));

      col = mix(col, vec3(1.0), uFlash);
      col *= uFade;

      // letterbox to 2.39:1
      float aspect = uResolution.x / uResolution.y;
      float bar = max(0.0, (1.0 - aspect / 2.39) * 0.5) * uLetterbox;
      if (vUv.y < bar || vUv.y > 1.0 - bar) col = vec3(0.0);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
