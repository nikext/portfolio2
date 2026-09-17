import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import { layers } from '../data/stack'
import type { Layer } from '../data/stack'
import { mulberry32 } from './random'
import { starShader } from './shaders'
import { useInView } from '../lib/useInView'
import { useReducedMotion } from '../lib/useReducedMotion'
import styles from './StackDiagram.module.css'

const ACCENT = '#67e8f9'
const SLAB = { w: 2.7, h: 0.16, d: 1.8 }
const GAP = 0.82
const TOP = ((layers.length - 1) * GAP) / 2
const { damp, clamp } = THREE.MathUtils

interface SlabProps {
  layer: Layer
  index: number
  active: boolean
  dimmed: boolean
  onOver: (id: string) => void
  onOut: () => void
  onClick: (id: string) => void
}

/** One layer of the stack: a slab that lifts and glows when active, with an HTML label beside it. */
function Slab({ layer, index, active, dimmed, onOver, onOut, onClick }: SlabProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const edge = useRef<THREE.LineBasicMaterial>(null)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const y0 = TOP - index * GAP

  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(SLAB.w, SLAB.h, SLAB.d)),
    [],
  )
  useEffect(() => () => edges.dispose(), [edges])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    if (mesh.current) {
      mesh.current.position.y = damp(mesh.current.position.y, y0 + (active ? 0.18 : 0), 8, dt)
    }
    if (mat.current) {
      mat.current.emissiveIntensity = damp(mat.current.emissiveIntensity, active ? 0.5 : 0.05, 8, dt)
      mat.current.opacity = damp(mat.current.opacity, dimmed ? 0.55 : 0.92, 8, dt)
    }
    if (edge.current) {
      edge.current.opacity = damp(edge.current.opacity, active ? 1 : dimmed ? 0.3 : 0.7, 8, dt)
    }
  })

  return (
    <mesh
      ref={mesh}
      position={[0, y0, 0]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHover(true)
        onOver(layer.id)
      }}
      onPointerOut={() => {
        setHover(false)
        onOut()
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onClick(layer.id)
      }}
    >
      <boxGeometry args={[SLAB.w, SLAB.h, SLAB.d]} />
      <meshStandardMaterial
        ref={mat}
        color="#0c1524"
        emissive={ACCENT}
        emissiveIntensity={0.05}
        metalness={0.2}
        roughness={0.5}
        transparent
        opacity={0.92}
      />
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edge} color={ACCENT} transparent opacity={0.7} />
      </lineSegments>
      <Html position={[SLAB.w / 2 + 0.2, 0, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <span className={`${styles.label} ${active ? styles.labelOn : ''}`}>
          <b>{layer.index}</b>
          <span className={styles.labelText}>{layer.title}</span>
        </span>
      </Html>
    </mesh>
  )
}

/** Small glowing points travelling down (requests) and back up (telemetry) through the layers. */
function Pulses({ count, animate }: { count: number; animate: boolean }) {
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

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...starShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0.95 },
          uColor: { value: new THREE.Color(ACCENT) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])

  useFrame((state) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    const attr = geo.getAttribute('position') as THREE.BufferAttribute
    const span = (layers.length - 1) * GAP
    for (let i = 0; i < count; i++) {
      const s = seeds[i]
      const u = (t * s.speed + s.offset) % 1
      const y = s.dir > 0 ? TOP - u * span : TOP - span + u * span
      attr.setXYZ(i, s.x, y, s.z)
    }
    attr.needsUpdate = true
    mat.uniforms.uTime.value = t
    mat.uniforms.uPixelRatio.value = state.viewport.dpr
  })

  // Drawn after the (transparent) slabs so the depth test hides only the pulses that are really inside one.
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={2} />
}

/** Isometric-ish tilt that follows the pointer and breathes slowly. */
function Rig({ animate, children }: { animate: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  useFrame((state, delta) => {
    const r = g.current
    if (!r) return
    const t = state.clock.elapsedTime
    // Narrow canvases: shrink and shift left so the labels on the right stay inside the card.
    const fit = clamp(state.viewport.aspect / 1.55, 0.78, 1)
    r.scale.setScalar(damp(r.scale.x, fit, 6, delta))
    r.position.x = damp(r.position.x, -0.45 - (1 - fit) * 2.4, 6, delta)
    const ty = -0.6 + state.pointer.x * 0.22 + (animate ? Math.sin(t * 0.35) * 0.1 : 0)
    const tx = 0.52 - state.pointer.y * 0.1
    r.rotation.y = damp(r.rotation.y, ty, 3, delta)
    r.rotation.x = damp(r.rotation.x, tx, 3, delta)
  })
  return (
    <group ref={g} rotation={[0.52, -0.6, 0]} position={[-0.45, 0, 0]}>
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
        onPointerMissed={() => onPin(null)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 6, 4]} intensity={1.8} />
        <pointLight position={[0, -3, 2.5]} intensity={8} color={ACCENT} distance={9} />
        <Rig animate={!reduced}>
          {layers.map((l, i) => (
            <Slab
              key={l.id}
              layer={l}
              index={i}
              active={current === l.id}
              dimmed={current !== null && current !== l.id}
              onOver={onActive}
              onOut={() => onActive(null)}
              onClick={(id) => onPin(pinned === id ? null : id)}
            />
          ))}
          {!reduced && <Pulses count={60} animate />}
        </Rig>
      </Canvas>
    </div>
  )
}
