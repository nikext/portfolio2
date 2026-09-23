import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from './random'
import { starfieldShader } from './shaders'
import { view } from './state'

const { damp, smoothstep } = THREE.MathUtils

/**
 * Sparse, slowly twinkling points far behind the sphere; drifts with scroll for
 * parallax, stretches into streaks when the page is scrolled fast, and lights
 * up a little around the mouse.
 */
export function Starfield({ count, animate }: { count: number; animate: boolean }) {
  const points = useRef<THREE.Points>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  const drift = useRef({ x: 0, y: 0 })

  const geo = useMemo(() => {
    const rand = mulberry32(3)
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 34
      pos[i * 3 + 1] = (rand() - 0.5) * 24
      pos[i * 3 + 2] = -10 + rand() * 10
      size[i] = 0.5 + rand() * 1.2
      phase[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    return g
  }, [count])
  useEffect(() => () => geo.dispose(), [geo])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.7 },
      uColor: { value: new THREE.Color('#bfe9ff') },
      uStretch: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uLight: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  )

  useFrame((state, delta) => {
    const m = mat.current
    const p = points.current
    if (!m || !p) return
    const dt = Math.min(delta, 0.1)
    m.uniforms.uPixelRatio.value = state.viewport.dpr
    p.position.y = view.scroll * 6 + drift.current.y
    p.rotation.z = view.scroll * 0.15
    // Reduced motion: no twinkle, streaks, light or drift; only the scroll parallax above.
    if (!animate) return
    m.uniforms.uTime.value = state.clock.elapsedTime
    // Reading-speed scrolling leaves the stars alone; a fast fling turns them into streaks.
    m.uniforms.uStretch.value = 1 + smoothstep(Math.abs(view.velocity), 0.6, 5) * 8
    m.uniforms.uPointer.value.set(view.px, view.py)
    m.uniforms.uLight.value = damp(m.uniforms.uLight.value, view.pointer ? 1 : 0, 4, dt)
    m.uniforms.uAspect.value = state.size.width / Math.max(1, state.size.height)

    // The field sits far back, so it drifts slightly against the mouse for depth.
    drift.current.x = damp(drift.current.x, -view.px * 0.35, 2, dt)
    drift.current.y = damp(drift.current.y, -view.py * 0.2, 2, dt)
    p.position.x = drift.current.x
  })

  return (
    <points ref={points} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={starfieldShader.vertexShader}
        fragmentShader={starfieldShader.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
