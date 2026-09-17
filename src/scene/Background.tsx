import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralSphere } from './NeuralSphere'
import { Starfield } from './Starfield'
import { ErrorBoundary } from './ErrorBoundary'
import { view } from './state'
import { useReducedMotion } from '../lib/useReducedMotion'
import styles from './Background.module.css'

const MOBILE_QUERY = '(max-width: 860px)'

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Fixed, non-interactive 3D layer behind the whole page. The DOM feeds scroll
 * and pointer position into `view`; the scene reads it every frame.
 */
export function Background() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    setEnabled(supportsWebGL())
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const apply = () => {
      setMobile(mq.matches)
      view.mobile = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      view.scroll = max > 0 ? Math.min(1, window.scrollY / max) : 0
      view.hero = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.9))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      view.px = (e.clientX / window.innerWidth) * 2 - 1
      view.py = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onPointer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className={styles.canvas} aria-hidden="true">
          <ErrorBoundary>
            <Canvas
              flat
              dpr={[1, mobile ? 1.25 : 1.5]}
              frameloop={reduced ? 'demand' : 'always'}
              camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 7] }}
              gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
              onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            >
              <Starfield count={mobile ? 260 : 520} />
              <NeuralSphere count={mobile ? 150 : 240} k={mobile ? 2 : 3} mobile={mobile} animate={!reduced} />
      </Canvas>
      </ErrorBoundary>
    </div>
  )
}
