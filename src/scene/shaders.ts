/* GLSL for the background scene. three.js injects the projection/model-view
   uniforms and the `position` attribute for ShaderMaterial, so only custom
   attributes and uniforms are declared here. */

/**
 * Signal waves: each of the four slots holds the time a wave was fired
 * (`uWaveStart`) and every vertex knows its hop distance from that wave's
 * origin (`aHop`). The wave front advances WAVE_SPEED hops per second.
 */
const waveChunk = /* glsl */ `
  const float WAVE_SPEED = 5.0;

  // x = how many hops the front has already passed this point, per slot.
  vec4 waveBehind(vec4 hop) {
    return (uTime - uWaveStart) * WAVE_SPEED - hop;
  }
`

/**
 * Cursor lens: pushes view-space positions away from the pointer, scaled by
 * depth so the bulge has the same on-screen size at any distance. Nodes and
 * edges run the same function, so edges stay attached to their nodes.
 */
const lensChunk = /* glsl */ `
  const float LENS_RADIUS = 0.4;
  const float LENS_PUSH = 0.09;

  float applyLens(inout vec4 mv) {
    vec4 clip = projectionMatrix * mv;
    vec2 d = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
    float r = length(d);
    float k = uLens * smoothstep(LENS_RADIUS, 0.0, r);
    mv.xy += d / max(r, 1e-4) * k * LENS_PUSH * -mv.z / projectionMatrix[1][1];
    return k;
  }
`

export const nodeShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uAssemble;
    uniform vec4 uWaveStart;
    uniform vec2 uPointer;
    uniform float uLens;
    uniform float uAspect;
    attribute float aSize;
    attribute float aPhase;
    attribute vec3 aStart;
    attribute vec4 aHop;
    varying float vPulse;
    varying float vHeat;

    ${waveChunk}
    ${lensChunk}

    void main() {
      // each node eases in on its own schedule so the sphere assembles organically
      float local = clamp(uAssemble * 1.35 - aPhase * 0.35, 0.0, 1.0);
      float ease = 1.0 - pow(1.0 - local, 3.0);
      vec3 p = mix(aStart, position, ease);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      float lens = applyLens(mv);

      // a node flares when a wave front reaches it, then cools while the front moves on
      vec4 x = waveBehind(aHop);
      vec4 g = smoothstep(-0.4, 0.0, x) * exp(-max(x, 0.0) * 0.75);
      float wave = max(max(g.x, g.y), max(g.z, g.w));

      float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + aPhase * 6.28318);
      vPulse = pulse;
      vHeat = clamp(wave + lens * 0.8, 0.0, 1.0);
      gl_PointSize = aSize * uPixelRatio * (30.0 + 14.0 * pulse) * (1.0 + 2.2 * wave + 1.0 * lens)
        / max(-mv.z, 0.1);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorHot;
    uniform float uOpacity;
    varying float vPulse;
    varying float vHeat;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c) * 2.0;
      if (d > 1.0) discard;
      float core = smoothstep(0.32, 0.0, d);
      float halo = pow(max(1.0 - d, 0.0), 2.4) * 0.5;
      vec3 col = mix(mix(uColorB, uColorA, vPulse), uColorHot, vHeat) + core * 0.7;
      float a = (core + halo) * uOpacity * (0.6 + 0.4 * vPulse + 0.9 * vHeat);
      gl_FragColor = vec4(col, a);
    }
  `,
}

export const edgeShader = {
  vertexShader: /* glsl */ `
    uniform float uAssemble;
    uniform vec2 uPointer;
    uniform float uLens;
    uniform float uAspect;
    attribute vec3 aStart;
    attribute float aNodePhase;
    attribute float aT;
    attribute float aPhase;
    attribute float aSpeed;
    attribute float aActive;
    attribute vec4 aHop;
    varying float vT;
    varying float vPhase;
    varying float vSpeed;
    varying float vActive;
    varying float vLens;
    varying vec4 vHop;

    ${lensChunk}

    void main() {
      // must match the node easing exactly so edges stay attached while assembling
      float local = clamp(uAssemble * 1.35 - aNodePhase * 0.35, 0.0, 1.0);
      float ease = 1.0 - pow(1.0 - local, 3.0);
      vec3 p = mix(aStart, position, ease);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vLens = applyLens(mv);
      vT = aT;
      vPhase = aPhase;
      vSpeed = aSpeed;
      vActive = aActive;
      // interpolated between the two end nodes, so the front visibly travels along the edge
      vHop = aHop;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uAssemble;
    uniform vec4 uWaveStart;
    uniform vec3 uColor;
    uniform vec3 uColorHot;
    uniform float uOpacity;
    varying float vT;
    varying float vPhase;
    varying float vSpeed;
    varying float vActive;
    varying float vLens;
    varying vec4 vHop;

    ${waveChunk}

    void main() {
      // a short bright pulse travelling from one end of the edge to the other
      float p = fract(uTime * vSpeed + vPhase);
      float pulse = smoothstep(0.14, 0.0, abs(vT - p)) * vActive;
      // signal waves: a sharp head with a glowing tail behind it
      vec4 x = waveBehind(vHop);
      vec4 g = smoothstep(-0.06, 0.0, x) * exp(-max(x, 0.0) * 1.3);
      float wave = max(max(g.x, g.y), max(g.z, g.w));
      float a = (0.09 + pulse * 0.85 + wave * 1.5 + vLens * 0.35) * uOpacity
        * smoothstep(0.55, 1.0, uAssemble);
      vec3 col = mix(uColor + pulse * 0.5, uColorHot, min(wave, 1.0));
      gl_FragColor = vec4(col, a);
    }
  `,
}

export const coreShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;

    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uFlash;
    varying vec3 vNormal;
    varying vec3 vView;

    void main() {
      float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
      float breathe = 0.85 + 0.15 * sin(uTime * 0.8);
      gl_FragColor = vec4(uColor, fresnel * (breathe + uFlash) * uOpacity);
    }
  `,
}

/** A soft glow ball: brightest where the surface faces the camera, fading to nothing at the rim. */
export const haloShader = {
  vertexShader: /* glsl */ `
    varying float vFacing;

    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vFacing = max(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)), 0.0);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vFacing;

    void main() {
      gl_FragColor = vec4(uColor, pow(vFacing, 2.5) * uOpacity);
    }
  `,
}

/** Twinkling points; used for the stack diagram's pulses. */
export const starShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aSize;
    attribute float aPhase;
    varying float vTwinkle;

    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float tw = 0.6 + 0.4 * sin(uTime * 0.7 + aPhase * 6.28318);
      vTwinkle = tw;
      gl_PointSize = aSize * uPixelRatio * (12.0 + 6.0 * tw) / max(-mv.z, 0.1);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vTwinkle;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c) * 2.0;
      if (d > 1.0) discard;
      float a = pow(1.0 - d, 2.0) * vTwinkle * uOpacity;
      gl_FragColor = vec4(uColor, a);
    }
  `,
}

/**
 * The background starfield: stars stretch into vertical streaks with scroll
 * speed (`uStretch`) and brighten around the mouse (`uLight`).
 */
export const starfieldShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uStretch;
    uniform vec2 uPointer;
    uniform float uLight;
    uniform float uAspect;
    attribute float aSize;
    attribute float aPhase;
    varying float vTwinkle;

    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec4 clip = projectionMatrix * mv;
      vec2 d = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
      float light = uLight * smoothstep(0.3, 0.0, length(d));
      float tw = 0.6 + 0.4 * sin(uTime * 0.7 + aPhase * 6.28318);
      vTwinkle = tw + light * 1.4;
      // the sprite grows with the stretch; the fragment shader keeps the star itself narrow
      gl_PointSize = aSize * uPixelRatio * (12.0 + 6.0 * tw) * (1.0 + light * 0.8) * uStretch
        / max(-mv.z, 0.1);
      gl_Position = clip;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uStretch;
    varying float vTwinkle;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      c.x *= uStretch;
      float d = length(c) * 2.0;
      if (d > 1.0) discard;
      // a streak dims a little as it lengthens, but not so much that it vanishes
      float a = pow(1.0 - d, 2.0) * vTwinkle * uOpacity * inversesqrt(sqrt(uStretch));
      gl_FragColor = vec4(uColor, a);
    }
  `,
}
