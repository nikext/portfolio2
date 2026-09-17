import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { buildGraph } from './graph'
import { coreShader, edgeShader, nodeShader } from './shaders'
import { view } from './state'

const ACCENT = '#67e8f9'
const DEEP = '#3b82f6'
const VIOLET = '#a78bfa'

interface Props {
  count: number
  k: number
  mobile: boolean
}

/**
 * The hero centrepiece: a sphere of glowing nodes joined to their nearest
 * neighbours, with light pulses travelling along the edges, a fresnel core
 * and a slow wireframe shell. Scroll moves it from the hero's right column
 * to a large, dim ambient layer behind the rest of the page.
 */
export function NeuralSphere({ count, k, mobile }: Props) {
  const group = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const mouse = useRef({ x: 0, y: 0 })

  const { nodeGeo, edgeGeo } = useMemo(() => buildGraph(count, k), [count, k])

  const nodeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...nodeShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
          uColorA: { value: new THREE.Color(ACCENT) },
          uColorB: { value: new THREE.Color(DEEP) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...edgeShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color(ACCENT) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
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
    const h = view.hero
    const s = view.scroll
    const isMobile = view.mobile
    const halfW = state.viewport.width / 2

    // Where the sphere sits in the hero, and how it grows into an ambient layer.
    const base = isMobile
      ? THREE.MathUtils.clamp(halfW / 2.4, 0.55, 1)
      : THREE.MathUtils.clamp(halfW / 4.8, 0.75, 1)
    const targetX = isMobile ? 0 : halfW * 0.5 * (1 - h)
    const targetY = isMobile ? 1.5 * (1 - h) : 0
    const targetScale = base * (1 + h * 0.85)

    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 4, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 4, dt)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 4, dt))

    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, view.px, 2.5, dt)
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, view.py, 2.5, dt)
    g.rotation.y = t * 0.05 + s * 2.4 + mouse.current.x * 0.28
    g.rotation.x = -mouse.current.y * 0.18 + s * 0.6

    // Bright in the hero, dim behind content, bright again near the contact section.
    const ambient = 0.3 + THREE.MathUtils.smoothstep(s, 0.86, 1) * 0.55
    const opacity = THREE.MathUtils.lerp(1, ambient, THREE.MathUtils.smoothstep(h, 0, 1))

    nodeMat.uniforms.uTime.value = t
    nodeMat.uniforms.uOpacity.value = opacity
    nodeMat.uniforms.uPixelRatio.value = state.viewport.dpr
    edgeMat.uniforms.uTime.value = t
    edgeMat.uniforms.uOpacity.value = opacity
    coreMat.uniforms.uTime.value = t
    coreMat.uniforms.uOpacity.value = opacity

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
          color={ACCENT}
          wireframe
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0.4, 0]}>
        <torusGeometry args={[2.85, 0.006, 6, 200]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
