import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from './random'
import { starShader } from './shaders'
import { view } from './state'

/** Sparse, slowly twinkling points far behind the sphere; drifts with scroll for parallax. */
export function Starfield({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)

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

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...starShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0.7 },
          uColor: { value: new THREE.Color('#bfe9ff') },
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
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uPixelRatio.value = state.viewport.dpr
    const p = points.current
    if (p) {
      p.position.y = view.scroll * 6
      p.rotation.z = view.scroll * 0.15
    }
  })

  return <points ref={points} geometry={geo} material={mat} frustumCulled={false} />
}
