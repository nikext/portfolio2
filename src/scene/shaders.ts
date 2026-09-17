/* GLSL for the background scene. three.js injects the projection/model-view
   uniforms and the `position` attribute for ShaderMaterial, so only custom
   attributes and uniforms are declared here. */

export const nodeShader = {
  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    attribute float aSize;
    attribute float aPhase;
    varying float vPulse;

    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + aPhase * 6.28318);
      vPulse = pulse;
      gl_PointSize = aSize * uPixelRatio * (30.0 + 14.0 * pulse) / max(-mv.z, 0.1);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uOpacity;
    varying float vPulse;

    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c) * 2.0;
      if (d > 1.0) discard;
      float core = smoothstep(0.32, 0.0, d);
      float halo = pow(max(1.0 - d, 0.0), 2.4) * 0.5;
      vec3 col = mix(uColorB, uColorA, vPulse) + core * 0.7;
      float a = (core + halo) * uOpacity * (0.6 + 0.4 * vPulse);
      gl_FragColor = vec4(col, a);
    }
  `,
}

export const edgeShader = {
  vertexShader: /* glsl */ `
    attribute float aT;
    attribute float aPhase;
    attribute float aSpeed;
    attribute float aActive;
    varying float vT;
    varying float vPhase;
    varying float vSpeed;
    varying float vActive;

    void main() {
      vT = aT;
      vPhase = aPhase;
      vSpeed = aSpeed;
      vActive = aActive;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vT;
    varying float vPhase;
    varying float vSpeed;
    varying float vActive;

    void main() {
      // a short bright pulse travelling from one end of the edge to the other
      float p = fract(uTime * vSpeed + vPhase);
      float pulse = smoothstep(0.14, 0.0, abs(vT - p)) * vActive;
      float a = (0.09 + pulse * 0.85) * uOpacity;
      gl_FragColor = vec4(uColor + pulse * 0.5, a);
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
    varying vec3 vNormal;
    varying vec3 vView;

    void main() {
      float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
      float breathe = 0.85 + 0.15 * sin(uTime * 0.8);
      gl_FragColor = vec4(uColor, fresnel * breathe * uOpacity);
    }
  `,
}

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
