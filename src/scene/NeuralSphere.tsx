import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { buildGraph, WAVE_SLOTS, writeWave } from './graph'
import type { Graph } from './graph'
import { coreShader, edgeShader, nodeShader } from './shaders'
import { input, view } from './state'
import { cssColor } from './palette'

const ACCENT = cssColor('--accent')
const HOT = cssColor('--accent-tint')
const DEEP = '#3b82f6'
const GLOW = cssColor('--glow')
const WIRE_OPACITY = 0.14
const RING_OPACITY = 0.35
/** A click further than this from every node (in NDC, where the viewport is 2 high) misses. */
const PICK_RADIUS = 0.12
/** The sphere fires a signal by itself every IDLE_MIN..IDLE_MIN+IDLE_JITTER seconds. */
const IDLE_MIN = 4.5
const IDLE_JITTER = 3

interface Props {
  count: number
  k: number
  mobile: boolean
  /** false = reduced motion: render the finished sphere, no assembly or drift. */
  animate: boolean
}

const { lerp, damp, smoothstep, clamp } = THREE.MathUtils

/** The node within PICK_RADIUS of an NDC point that is nearest the camera, or -1 for a miss. */
function pickNode(
  graph: Graph,
  world: THREE.Matrix4,
  camera: THREE.Camera,
  aspect: number,
  x: number,
  y: number,
  v: THREE.Vector3,
) {
  let best = -1
  let bestScore = -Infinity
  for (let i = 0; i < graph.positions.length / 3; i++) {
    v.fromArray(graph.positions, i * 3).applyMatrix4(world)
    const z = v.z
    v.project(camera)
    const d = Math.hypot((v.x - x) * aspect, v.y - y)
    if (d > PICK_RADIUS) continue
    const score = z - d * 4
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

/** A random node on the side facing the camera (best of a few draws), so self-fired signals show. */
function frontNode(graph: Graph, world: THREE.Matrix4, v: THREE.Vector3) {
  let best = 0
  let bestZ = -Infinity
  for (let draw = 0; draw < 6; draw++) {
    const i = Math.floor(Math.random() * (graph.positions.length / 3))
    v.fromArray(graph.positions, i * 3).applyMatrix4(world)
    if (v.z > bestZ) {
      bestZ = v.z
      best = i
    }
  }
  return best
}

/**
 * The hero centrepiece: a sphere of glowing nodes joined to their nearest
 * neighbours, with light pulses travelling along the edges, a fresnel core
 * and a slow wireframe shell. On load the nodes fly in and assemble. Scroll
 * moves the sphere from the hero's right column to a faint layer behind the
 * page, then brings it back for the contact section.
 *
 * While it is bright (hero and contact) the sphere is interactive: nodes near
 * the mouse bulge away from it, dragging spins it, and a click fires a signal
 * that spreads through the graph hop by hop, breadth first from the nearest
 * node. It also fires signals by itself now and then.
 */
export function NeuralSphere({ count, k, mobile, animate }: Props) {
  const group = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const nodeMat = useRef<THREE.ShaderMaterial>(null)
  const edgeMat = useRef<THREE.ShaderMaterial>(null)
  const coreMat = useRef<THREE.ShaderMaterial>(null)
  const wireMat = useRef<THREE.MeshBasicMaterial>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const assemble = useRef(animate ? 0 : 1)
  const opacity = useRef(1)
  const spin = useRef({ angle: 0, velocity: 0 })
  // The first idle signal fires as the assembly finishes.
  const signals = useRef({ slot: 0, nextIdle: 2.4, arrived: false, flash: 0 })

  const graph = useMemo(() => buildGraph(count, k), [count, k])
  const { nodeGeo, edgeGeo } = graph
  useEffect(
    () => () => {
      nodeGeo.dispose()
      edgeGeo.dispose()
    },
    [nodeGeo, edgeGeo],
  )
  const scratch = useMemo(
    () => ({ hops: new Float32Array(count), v: new THREE.Vector3() }),
    [count],
  )

  // Uniform objects are created once; the frame loop updates their values through the material refs.
  // `shared` holds the same objects in both materials, so nodes and edges always agree.
  const shared = useMemo(
    () => ({
      uWaveStart: { value: new THREE.Vector4(-1e4, -1e4, -1e4, -1e4) },
      uPointer: { value: new THREE.Vector2() },
      uLens: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  )
  const nodeUniforms = useMemo(
    () => ({
      ...shared,
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uAssemble: { value: animate ? 0 : 1 },
      uColorA: { value: new THREE.Color(ACCENT) },
      uColorB: { value: new THREE.Color(DEEP) },
      uColorHot: { value: new THREE.Color(HOT) },
    }),
    [animate, shared],
  )
  const edgeUniforms = useMemo(
    () => ({
      ...shared,
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uAssemble: { value: animate ? 0 : 1 },
      uColor: { value: new THREE.Color(ACCENT) },
      uColorHot: { value: new THREE.Color(HOT) },
    }),
    [animate, shared],
  )
  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uFlash: { value: 0 },
      uColor: { value: new THREE.Color(GLOW) },
    }),
    [],
  )

  useFrame((state, delta) => {
    const g = group.current
    const nm = nodeMat.current
    const em = edgeMat.current
    const cm = coreMat.current
    if (!g || !nm || !em || !cm) return
    // Reduced motion: the clock stands still and every pose value snaps to its target, because
    // frames only render on demand (when the page scrolls) and easing would never arrive.
    const t = animate ? state.clock.elapsedTime : 0
    const dt = Math.min(delta, 0.1)
    const ease = (from: number, to: number, lambda: number) =>
      animate ? damp(from, to, lambda, dt) : to
    const isMobile = view.mobile
    const halfW = state.viewport.width / 2
    const aspect = state.size.width / Math.max(1, state.size.height)

    // 0 → 1 over ~2.6 s after mount
    assemble.current = Math.min(1, assemble.current + dt / 2.6)
    const built = 1 - Math.pow(1 - assemble.current, 3)

    // Three "poses" blended by scroll: hero (bright, right column) →
    // ambient (faint, pushed back and aside) → contact (bright, centre-right).
    const heroT = smoothstep(view.hero, 0, 1)
    const endT = smoothstep(view.scroll, 0.84, 1)
    const bright = clamp(1 - heroT + endT, 0, 1)
    const base = isMobile ? clamp(halfW / 2.4, 0.55, 1) : clamp(halfW / 4.8, 0.75, 1)

    const heroX = isMobile ? 0 : halfW * 0.5
    const ambX = isMobile ? halfW * 0.4 : halfW * 0.58
    const endX = isMobile ? 0 : halfW * 0.3
    const heroY = isMobile ? 1.5 : 0
    const ambY = isMobile ? 1.3 : 0.5
    // On phones the Contact heading sits high, so the sphere settles lower, behind the card.
    const endY = isMobile ? -0.8 : -0.3

    const tx = lerp(lerp(heroX, ambX, heroT), endX, endT)
    const ty = lerp(lerp(heroY, ambY, heroT), endY, endT)
    const tz = lerp(lerp(0, -2.5, heroT), 0.3, endT)
    const tScale = base * lerp(lerp(1, 1.3, heroT), 1.1, endT)
    const tOpacity = lerp(lerp(1, 0.22, heroT), isMobile ? 0.6 : 0.85, endT)

    g.position.x = ease(g.position.x, tx, 4)
    g.position.y = ease(g.position.y, ty, 4)
    g.position.z = ease(g.position.z, tz, 4)
    g.scale.setScalar(ease(g.scale.x, tScale, 4))
    // Fade out faster than in: a quick scroll into the content must not leave it bright behind text.
    opacity.current = ease(opacity.current, tOpacity, tOpacity < opacity.current ? 7 : 4)
    const o = opacity.current * built

    // Drag spins the sphere 1:1; on release it keeps the fling speed and slows down.
    const s = spin.current
    const drag = input.drag * 2.4
    input.drag = 0
    if (input.dragging) {
      s.angle += drag
      s.velocity = lerp(s.velocity, drag / Math.max(dt, 1e-3), 0.3)
    } else {
      s.angle += s.velocity * dt
      s.velocity = damp(s.velocity, 0, 1.4, dt)
    }
    s.velocity = clamp(s.velocity, -9, 9)

    if (animate) {
      mouse.current.x = damp(mouse.current.x, view.px, 2.5, dt)
      mouse.current.y = damp(mouse.current.y, view.py, 2.5, dt)
      g.rotation.y = t * 0.05 + view.scroll * 2.4 + mouse.current.x * 0.28 + s.angle
      g.rotation.x = -mouse.current.y * 0.18 + view.scroll * 0.6
    }

    // Signals: from clicks near a node or on the Contact mark, by themselves while idle,
    // and once on reaching Contact.
    const sig = signals.current
    const fire = (origin: number) => {
      writeWave(graph, origin, sig.slot, scratch.hops)
      nm.uniforms.uWaveStart.value.setComponent(sig.slot, t)
      sig.slot = (sig.slot + 1) % WAVE_SLOTS
      sig.flash = 1
    }
    const live = animate && bright > 0.5 && built > 0.5
    for (const tap of input.taps.splice(0)) {
      const node = live
        ? pickNode(graph, g.matrixWorld, state.camera, aspect, tap.x, tap.y, scratch.v)
        : -1
      if (node < 0) continue
      fire(node)
      sig.nextIdle = t + IDLE_MIN * 2
    }
    if (input.pings > 0) {
      if (live) fire(frontNode(graph, g.matrixWorld, scratch.v))
      input.pings = 0
      sig.nextIdle = t + IDLE_MIN * 2
    }
    if (live && t > sig.nextIdle) {
      fire(frontNode(graph, g.matrixWorld, scratch.v))
      sig.nextIdle = t + IDLE_MIN + Math.random() * IDLE_JITTER
    }
    if (live && endT > 0.6 && !sig.arrived) {
      sig.arrived = true
      fire(frontNode(graph, g.matrixWorld, scratch.v))
    } else if (endT < 0.2) {
      sig.arrived = false
    }
    sig.flash = damp(sig.flash, 0, 3, dt)

    // The cursor lens only works for a mouse, and only while the sphere is bright.
    // (Pointer, lens, aspect and wave uniforms are shared objects: setting them on nm sets em too.)
    nm.uniforms.uPointer.value.set(view.px, view.py)
    nm.uniforms.uLens.value = damp(
      nm.uniforms.uLens.value,
      animate && view.pointer ? bright : 0,
      5,
      dt,
    )
    nm.uniforms.uAspect.value = aspect

    nm.uniforms.uTime.value = t
    nm.uniforms.uOpacity.value = opacity.current
    nm.uniforms.uAssemble.value = assemble.current
    nm.uniforms.uPixelRatio.value = state.viewport.dpr
    em.uniforms.uTime.value = t
    em.uniforms.uOpacity.value = opacity.current
    em.uniforms.uAssemble.value = assemble.current
    cm.uniforms.uTime.value = t
    cm.uniforms.uOpacity.value = o
    cm.uniforms.uFlash.value = sig.flash * 0.7
    if (wireMat.current) wireMat.current.opacity = WIRE_OPACITY * o * (1 + sig.flash)
    if (ringMat.current) ringMat.current.opacity = RING_OPACITY * o

    if (wire.current) {
      wire.current.rotation.y = -t * 0.12
      wire.current.rotation.z = t * 0.06
    }
    if (ring.current) ring.current.rotation.z = t * 0.08
  })

  return (
    <group ref={group} position={[mobile ? 0 : 2.2, mobile ? 1.5 : 0, 0]} scale={mobile ? 0.6 : 1}>
      <points geometry={nodeGeo} frustumCulled={false}>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={nodeShader.vertexShader}
          fragmentShader={nodeShader.fragmentShader}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={edgeGeo} frustumCulled={false}>
        <shaderMaterial
          ref={edgeMat}
          vertexShader={edgeShader.vertexShader}
          fragmentShader={edgeShader.fragmentShader}
          uniforms={edgeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <shaderMaterial
          ref={coreMat}
          vertexShader={coreShader.vertexShader}
          fragmentShader={coreShader.fragmentShader}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial
          ref={wireMat}
          color={ACCENT}
          wireframe
          transparent
          opacity={WIRE_OPACITY}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0.4, 0]}>
        <torusGeometry args={[2.85, 0.006, 6, 200]} />
        <meshBasicMaterial
          ref={ringMat}
          color={ACCENT}
          transparent
          opacity={RING_OPACITY}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
