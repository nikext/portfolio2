import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { layers } from '../data/stack'
import type { Layer } from '../data/stack'
import { convexHull, nearHull } from './hull'
import type { Pt } from './hull'
import { mulberry32 } from './random'
import { starShader } from './shaders'
import { useInView } from '../lib/useInView'
import { useReducedMotion } from '../lib/useReducedMotion'
import { cssColor } from './palette'
import styles from './StackDiagram.module.css'

const ACCENT = cssColor('--accent')
const SLAB = { w: 2.7, h: 0.16, d: 1.8 }
const GAP = 0.95
const TOP = ((layers.length - 1) * GAP) / 2
/** Layer spacing, relative to GAP, before the diagram has scrolled into view. */
const COLLAPSED = 0.3
/** Corners of a slab's box in its own space, for projecting its outline onto the screen. */
const CORNERS = [-1, 1].flatMap((x) =>
  [-1, 1].flatMap((y) =>
    [-1, 1].map((z) => new THREE.Vector3((x * SLAB.w) / 2, (y * SLAB.h) / 2, (z * SLAB.d) / 2)),
  ),
)
/** Pixels around a slab's outline, or its label, that still count as pointing at it. */
const PICK_MARGIN = 10
const { damp, clamp, lerp, smoothstep } = THREE.MathUtils

/** Eases toward the target while animating; under reduced motion it jumps straight there. */
const ease = (animate: boolean, from: number, to: number, dt: number) =>
  animate ? damp(from, to, 8, dt) : to

/**
 * Scroll-linked exploded view: `spreadRef` goes 0 → 1 as the diagram's centre
 * rises from the bottom of the viewport to the middle, and the layers move
 * apart with it.
 */
function Spread({ spreadRef, animate }: { spreadRef: RefObject<number>; animate: boolean }) {
  // Negative priority: runs before the slabs and pulses read `spreadRef` in the same frame.
  useFrame(({ gl }, delta) => {
    if (!animate) {
      spreadRef.current = 1
      return
    }
    const r = gl.domElement.getBoundingClientRect()
    const vh = window.innerHeight
    const target = smoothstep(vh - (r.top + r.height / 2), 0, vh * 0.5)
    spreadRef.current = damp(spreadRef.current, target, 4, Math.min(delta, 0.1))
  }, -1)
  return null
}

/**
 * Screen-space picking for the slabs. Raycasting made the lower layers hard to
 * hit: three.js counts a ray within one world unit of a line as a hit, so each
 * slab's outline (a child line segment) caught clicks meant for the layers
 * below it, and the hover lift moved a slab away from the pointer. Instead each
 * slab is projected at its resting height; the pointer belongs to the slab whose
 * outline or label it is over, and where outlines overlap, the nearest centre wins.
 */
function Picker({
  wrapRef,
  rigRef,
  spreadRef,
  onHover,
  onPick,
}: {
  /** The diagram's own wrapper, which contains the canvas and the HTML labels. */
  wrapRef: RefObject<HTMLDivElement | null>
  rigRef: RefObject<THREE.Group | null>
  spreadRef: RefObject<number>
  onHover: (id: string | null) => void
  onPick: (id: string | null) => void
}) {
  const camera = useThree((s) => s.camera)
  const canvas = useThree((s) => s.gl.domElement)
  // Latest callbacks for the listeners below, which are attached once.
  const handlers = useRef({ onHover, onPick })
  useEffect(() => {
    handlers.current = { onHover, onPick }
  })

  useEffect(() => {
    const world = new THREE.Matrix4()
    const v = new THREE.Vector3()

    const pick = (clientX: number, clientY: number): string | null => {
      // The labels ignore the pointer (so it reaches the canvas) but are an obvious thing to click.
      const labels = wrapRef.current?.querySelectorAll<HTMLElement>('[data-layer]') ?? []
      for (const label of labels) {
        const r = label.getBoundingClientRect()
        const m = PICK_MARGIN
        if (
          clientX > r.left - m &&
          clientX < r.right + m &&
          clientY > r.top - m &&
          clientY < r.bottom + m
        )
          return label.dataset.layer ?? null
      }
      const rig = rigRef.current
      if (!rig) return null
      const box = canvas.getBoundingClientRect()
      const x = clientX - box.left
      const y = clientY - box.top
      const toScreen = (p: THREE.Vector3): Pt => {
        p.project(camera)
        return [((p.x + 1) / 2) * box.width, ((1 - p.y) / 2) * box.height]
      }
      const spread = lerp(COLLAPSED, 1, spreadRef.current)
      let best: string | null = null
      let bestDistance = Infinity
      layers.forEach((layer, i) => {
        world.makeTranslation(0, (TOP - i * GAP) * spread, 0).premultiply(rig.matrixWorld)
        const outline = convexHull(CORNERS.map((c) => toScreen(v.copy(c).applyMatrix4(world))))
        if (!nearHull(outline, x, y, PICK_MARGIN)) return
        const [cx, cy] = toScreen(v.set(0, 0, 0).applyMatrix4(world))
        const distance = Math.hypot(cx - x, cy - y)
        if (distance < bestDistance) {
          bestDistance = distance
          best = layer.id
        }
      })
      return best
    }

    let hovered: string | null = null
    const hover = (id: string | null) => {
      if (id === hovered) return
      hovered = id
      canvas.style.cursor = id ? 'pointer' : ''
      handlers.current.onHover(id)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hover(pick(e.clientX, e.clientY))
    }
    const onLeave = () => hover(null)
    const onClick = (e: MouseEvent) => handlers.current.onPick(pick(e.clientX, e.clientY))

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
      canvas.style.cursor = ''
    }
  }, [camera, canvas, wrapRef, rigRef, spreadRef])

  return null
}

/** Under frameloop="demand" (reduced motion) nothing draws by itself: redraw when the highlight changes. */
function RedrawOn({ value }: { value: string | null }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [value, invalidate])
  return null
}

interface SlabProps {
  layer: Layer
  index: number
  active: boolean
  dimmed: boolean
  animate: boolean
  spreadRef: RefObject<number>
}

/** One layer of the stack: a slab that lifts and glows when active, with an HTML label beside it. */
function Slab({ layer, index, active, dimmed, animate, spreadRef }: SlabProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const edge = useRef<THREE.LineBasicMaterial>(null)
  const y0 = TOP - index * GAP

  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(SLAB.w, SLAB.h, SLAB.d)),
    [],
  )
  useEffect(() => () => edges.dispose(), [edges])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    if (mesh.current) {
      const y = y0 * lerp(COLLAPSED, 1, spreadRef.current) + (active ? 0.18 : 0)
      mesh.current.position.y = ease(animate, mesh.current.position.y, y, dt)
    }
    if (mat.current) {
      mat.current.emissiveIntensity = ease(
        animate,
        mat.current.emissiveIntensity,
        active ? 0.5 : 0.05,
        dt,
      )
      mat.current.opacity = ease(animate, mat.current.opacity, dimmed ? 0.5 : 0.85, dt)
    }
    if (edge.current) {
      edge.current.opacity = ease(
        animate,
        edge.current.opacity,
        active ? 1 : dimmed ? 0.3 : 0.7,
        dt,
      )
    }
  })

  return (
    <mesh ref={mesh} position={[0, animate ? y0 * COLLAPSED : y0, 0]}>
      <boxGeometry args={[SLAB.w, SLAB.h, SLAB.d]} />
      <meshStandardMaterial
        ref={mat}
        color="#0c1524"
        emissive={ACCENT}
        emissiveIntensity={0.05}
        metalness={0.2}
        roughness={0.5}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edge} color={ACCENT} transparent opacity={0.7} />
      </lineSegments>
      <Html
        position={[SLAB.w / 2 + 0.2, 0, 0]}
        zIndexRange={[5, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <span className={`${styles.label} ${active ? styles.labelOn : ''}`} data-layer={layer.id}>
          <b>{layer.index}</b>
          <span className={styles.labelText}>{layer.title}</span>
        </span>
      </Html>
    </mesh>
  )
}

/** Small glowing points travelling down (requests) and back up (telemetry) through the layers. */
function Pulses({
  count,
  animate,
  spreadRef,
}: {
  count: number
  animate: boolean
  spreadRef: RefObject<number>
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)

  const { geo, seeds } = useMemo(() => {
    const rand = mulberry32(21)
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const seeds = Array.from({ length: count }, (_, i) => {
      size[i] = 3.2 + rand() * 2.2
      phase[i] = rand()
      return {
        x: (rand() - 0.5) * SLAB.w * 0.8,
        z: (rand() - 0.5) * SLAB.d * 0.8,
        offset: rand(),
        speed: 0.1 + rand() * 0.16,
        dir: rand() < 0.5 ? 1 : -1,
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return { geo: g, seeds }
  }, [count])
  useEffect(() => () => geo.dispose(), [geo])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.95 },
      uColor: { value: new THREE.Color(ACCENT) },
    }),
    [],
  )

  useFrame((state) => {
    const m = mat.current
    if (!animate || !m) return
    const t = state.clock.elapsedTime
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const span = (layers.length - 1) * GAP
    const f = lerp(COLLAPSED, 1, spreadRef.current)
    for (let i = 0; i < count; i++) {
      const s = seeds[i]
      const u = (t * s.speed + s.offset) % 1
      const y = s.dir > 0 ? TOP - u * span : TOP - span + u * span
      attr.setXYZ(i, s.x, y * f, s.z)
    }
    attr.needsUpdate = true
    m.uniforms.uTime.value = t
    m.uniforms.uPixelRatio.value = state.viewport.dpr
  })

  // Drawn after the (transparent) slabs so the depth test hides only the pulses that are really inside one.
  return (
    <points geometry={geo} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={mat}
        vertexShader={starShader.vertexShader}
        fragmentShader={starShader.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Isometric-ish tilt that breathes slowly; while the stack is still collapsed
 * it is seen a little more from above and turned away. It deliberately does not
 * follow the pointer: the slabs are click targets and must stay where you aim.
 */
function Rig({
  animate,
  spreadRef,
  rigRef,
  children,
}: {
  animate: boolean
  spreadRef: RefObject<number>
  rigRef: RefObject<THREE.Group | null>
  children: ReactNode
}) {
  useFrame((state, delta) => {
    const r = rigRef.current
    if (!r) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.1)
    const closed = 1 - spreadRef.current
    // Narrow canvases: shrink and shift left so the labels on the right stay inside the card.
    const fit = clamp(state.viewport.aspect / 1.55, 0.78, 1)
    r.scale.setScalar(ease(animate, r.scale.x, fit, dt))
    r.position.x = ease(animate, r.position.x, -0.45 - (1 - fit) * 2.4, dt)
    // Reduced motion: a fixed isometric view without the breathing.
    if (!animate) return
    const ty = -0.6 - closed * 0.45 + Math.sin(t * 0.35) * 0.08
    const tx = 0.52 + closed * 0.3
    r.rotation.y = damp(r.rotation.y, ty, 3, dt)
    r.rotation.x = damp(r.rotation.x, tx, 3, dt)
  })
  // Start in the collapsed pose when animating, so the first frames don't swing into it.
  return (
    <group
      ref={rigRef}
      rotation={animate ? [0.82, -1.05, 0] : [0.52, -0.6, 0]}
      position={[-0.45, 0, 0]}
    >
      {children}
    </group>
  )
}

interface Props {
  active: string | null
  pinned: string | null
  onActive: (id: string | null) => void
  onPin: (id: string | null) => void
}

export default function StackDiagram({ active, pinned, onActive, onPin }: Props) {
  const reduced = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const spreadRef = useRef(reduced ? 1 : 0)
  const rigRef = useRef<THREE.Group>(null)
  const inView = useInView(wrap)
  const current = pinned ?? active
  const frameloop: 'always' | 'demand' | 'never' = reduced ? 'demand' : inView ? 'always' : 'never'

  return (
    <div ref={wrap} className={styles.canvas}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        camera={{ position: [0, 0.6, 7.8], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 4]} intensity={1.8} />
        <pointLight position={[0, -3, 2.5]} intensity={8} color={ACCENT} distance={9} />
        <Spread spreadRef={spreadRef} animate={!reduced} />
        <Picker
          wrapRef={wrap}
          rigRef={rigRef}
          spreadRef={spreadRef}
          onHover={onActive}
          onPick={(id) => onPin(id !== null && id !== pinned ? id : null)}
        />
        <RedrawOn value={current} />
        <Rig animate={!reduced} spreadRef={spreadRef} rigRef={rigRef}>
          {layers.map((l, i) => (
            <Slab
              key={l.id}
              layer={l}
              index={i}
              active={current === l.id}
              dimmed={current !== null && current !== l.id}
              animate={!reduced}
              spreadRef={spreadRef}
            />
          ))}
          {!reduced && <Pulses count={60} animate spreadRef={spreadRef} />}
        </Rig>
      </Canvas>
    </div>
  )
}
