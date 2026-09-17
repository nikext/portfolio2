import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { buildGraph } from './graph'
import { coreShader, edgeShader, nodeShader } from './shaders'
import { view } from './state'

const ACCENT = '#67e8f9'
const DEEP = '#3b82f6'
const VIOLET = '#a78bfa'
const WIRE_OPACITY = 0.14
const RING_OPACITY = 0.35

interface Props {
  count: number
  k: number
  mobile: boolean
  /** false = reduced motion: render the finished sphere, no assembly or drift. */
  animate: boolean
}

const { lerp, damp, smoothstep, clamp } = THREE.MathUtils

/**
 * The hero centrepiece: a sphere of glowing nodes joined to their nearest
 * neighbours, with light pulses travelling along the edges, a fresnel core
 * and a slow wireframe shell. On load the nodes fly in and assemble. Scroll
 * moves the sphere from the hero's right column to a faint layer behind the
 * page, then brings it back for the contact section.
 */
export function NeuralSphere({ count, k, mobile, animate }: Props) {
  const group = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const wireMat = useRef<THREE.MeshBasicMaterial>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const assemble = useRef(animate ? 0 : 1)
  const opacity = useRef(1)

  const { nodeGeo, edgeGeo } = useMemo(() => buildGraph(count, k), [count, k])

  const nodeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...nodeShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
          uAssemble: { value: animate ? 0 : 1 },
          uColorA: { value: new THREE.Color(ACCENT) },
          uColorB: { value: new THREE.Color(DEEP) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...edgeShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uAssemble: { value: animate ? 0 : 1 },
          uColor: { value: new THREE.Color(ACCENT) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const coreMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...coreShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color(VIOLET) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(
    () => () => {
      nodeGeo.dispose()
      edgeGeo.dispose()
    },
    [nodeGeo, edgeGeo],
  )
  useEffect(
    () => () => {
      nodeMat.dispose()
      edgeMat.dispose()
      coreMat.dispose()
    },
    [nodeMat, edgeMat, coreMat],
  )

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.1)
    const isMobile = view.mobile
    const halfW = state.viewport.width / 2

    // 0 → 1 over ~2.6 s after mount
    assemble.current = Math.min(1, assemble.current + dt / 2.6)
    const built = 1 - Math.pow(1 - assemble.current, 3)

    // Three "poses" blended by scroll: hero (bright, right column) →
    // ambient (faint, pushed back and aside) → contact (bright, centre-right).
    const heroT = smoothstep(view.hero, 0, 1)
    const endT = smoothstep(view.scroll, 0.84, 1)
    const base = isMobile ? clamp(halfW / 2.4, 0.55, 1) : clamp(halfW / 4.8, 0.75, 1)

    const heroX = isMobile ? 0 : halfW * 0.5
    const ambX = isMobile ? halfW * 0.4 : halfW * 0.58
    const endX = isMobile ? 0 : halfW * 0.3
    const heroY = isMobile ? 1.5 : 0
    const ambY = isMobile ? 1.3 : 0.5
    const endY = isMobile ? 1.0 : -0.3

    const tx = lerp(lerp(heroX, ambX, heroT), endX, endT)
    const ty = lerp(lerp(heroY, ambY, heroT), endY, endT)
    const tz = lerp(lerp(0, -2.5, heroT), 0.3, endT)
    const tScale = base * lerp(lerp(1, 1.3, heroT), 1.1, endT)
    const tOpacity = lerp(lerp(1, 0.22, heroT), 0.85, endT)

    g.position.x = damp(g.position.x, tx, 4, dt)
    g.position.y = damp(g.position.y, ty, 4, dt)
    g.position.z = damp(g.position.z, tz, 4, dt)
    g.scale.setScalar(damp(g.scale.x, tScale, 4, dt))
    opacity.current = damp(opacity.current, tOpacity, 4, dt)
    const o = opacity.current * built

    mouse.current.x = damp(mouse.current.x, view.px, 2.5, dt)
    mouse.current.y = damp(mouse.current.y, view.py, 2.5, dt)
    g.rotation.y = t * 0.05 + view.scroll * 2.4 + mouse.current.x * 0.28
    g.rotation.x = -mouse.current.y * 0.18 + view.scroll * 0.6

    nodeMat.uniforms.uTime.value = t
    nodeMat.uniforms.uOpacity.value = opacity.current
    nodeMat.uniforms.uAssemble.value = assemble.current
    nodeMat.uniforms.uPixelRatio.value = state.viewport.dpr
    edgeMat.uniforms.uTime.value = t
    edgeMat.uniforms.uOpacity.value = opacity.current
    edgeMat.uniforms.uAssemble.value = assemble.current
    coreMat.uniforms.uTime.value = t
    coreMat.uniforms.uOpacity.value = o
    if (wireMat.current) wireMat.current.opacity = WIRE_OPACITY * o
    if (ringMat.current) ringMat.current.opacity = RING_OPACITY * o

    if (wire.current) {
      wire.current.rotation.y = -t * 0.12
      wire.current.rotation.z = t * 0.06
    }
    if (ring.current) ring.current.rotation.z = t * 0.08
  })

  return (
    <group ref={group} position={[mobile ? 0 : 2.2, mobile ? 1.5 : 0, 0]} scale={mobile ? 0.6 : 1}>
      <points geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
      <lineSegments geometry={edgeGeo} material={edgeMat} frustumCulled={false} />
      <mesh material={coreMat}>
        <sphereGeometry args={[0.9, 48, 48]} />
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
