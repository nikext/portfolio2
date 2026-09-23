import { useEffect, useRef, useState } from 'react'
import type { RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { NeuralSphere } from './NeuralSphere'
import { Starfield } from './Starfield'
import { ErrorBoundary } from './ErrorBoundary'
import { input, view } from './state'
import { useReducedMotion } from '../lib/useReducedMotion'
import styles from './Background.module.css'

const MOBILE_QUERY = '(max-width: 860px)'
/** Clicks on these already do something else, so they never fire a signal. */
const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, [role="button"], canvas, header'
const { clamp, damp } = THREE.MathUtils

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Turns the scroll position into a smoothed speed (viewport heights per second) for the scene. */
function ScrollSpeed() {
  const last = useRef<number | null>(null)
  // Negative priority: runs before the sphere and stars read `view.velocity` in the same frame.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const y = window.scrollY
    const prev = last.current
    last.current = y
    if (prev === null || dt <= 0) return
    const raw = (y - prev) / window.innerHeight / dt
    view.velocity = damp(view.velocity, clamp(raw, -12, 12), 6, dt)
  }, -1)
  return null
}

/**
 * Fixed 3D layer behind the whole page. It never takes pointer events (text
 * stays selectable and links clickable); instead the DOM feeds scroll, pointer,
 * clicks and drags into `view` / `input`, and the scene reads them every frame.
 */
export function Background() {
  const reduced = useReducedMotion()
  const [enabled] = useState(() => supportsWebGL())
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  // Set once the canvas exists. Under reduced motion the canvas only renders on demand, so
  // every scroll has to ask for a frame or the sphere would stay in its hero pose.
  const invalidate = useRef<RootState['invalidate'] | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    view.mobile = mq.matches
    const onChange = () => {
      setMobile(mq.matches)
      view.mobile = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      view.scroll = max > 0 ? Math.min(1, window.scrollY / max) : 0
      view.hero = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.9))
      invalidate.current?.()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      view.px = (e.clientX / window.innerWidth) * 2 - 1
      view.py = -((e.clientY / window.innerHeight) * 2 - 1)
      view.pointer = true
    }
    // relatedTarget is null when the mouse leaves the window.
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) view.pointer = false
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('mouseout', onOut)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('mouseout', onOut)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Clicks and taps fire signals; a mouse drag that starts on [data-sphere] (the hero's
  // empty right column) spins the sphere. Touch drags are left alone so the page scrolls.
  useEffect(() => {
    if (!enabled || reduced) return
    const root = document.documentElement
    root.dataset.scene = 'live'
    let press: {
      id: number
      x: number
      y: number
      lastX: number
      time: number
      drag: boolean
    } | null = null

    const onDown = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (e.button !== 0 || !target || target.closest(INTERACTIVE)) return
      const drag = e.pointerType === 'mouse' && target.closest('[data-sphere]') !== null
      press = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        lastX: e.clientX,
        time: e.timeStamp,
        drag,
      }
      if (drag) {
        input.dragging = true
        root.classList.add('sphere-grabbing')
      }
    }
    const onMove = (e: PointerEvent) => {
      if (!press?.drag || e.pointerId !== press.id) return
      input.drag += ((e.clientX - press.lastX) / window.innerWidth) * 2
      press.lastX = e.clientX
    }
    const release = (e: PointerEvent, canTap: boolean) => {
      if (!press || e.pointerId !== press.id) return
      const still =
        Math.hypot(e.clientX - press.x, e.clientY - press.y) < 8 && e.timeStamp - press.time < 600
      // A click that ends a text selection is about the text, not the sphere.
      if (canTap && still && !window.getSelection()?.toString()) {
        input.taps.push({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -((e.clientY / window.innerHeight) * 2 - 1),
        })
      }
      if (press.drag) {
        input.dragging = false
        root.classList.remove('sphere-grabbing')
      }
      press = null
    }
    const onUp = (e: PointerEvent) => release(e, true)
    const onCancel = (e: PointerEvent) => release(e, false)

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      delete root.dataset.scene
      root.classList.remove('sphere-grabbing')
      input.dragging = false
    }
  }, [enabled, reduced])

  if (!enabled) return null

  return (
    <div className={styles.canvas} aria-hidden="true">
      <ErrorBoundary>
        <Canvas
          flat
          dpr={[1, mobile ? 1.25 : 1.5]}
          frameloop={reduced ? 'demand' : 'always'}
          camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 7] }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          onCreated={(state) => {
            state.gl.setClearColor(0x000000, 0)
            invalidate.current = state.invalidate
            // The first measure ran before the canvas existed; render the current scroll pose.
            state.invalidate()
          }}
        >
          {!reduced && <ScrollSpeed />}
          <Starfield count={mobile ? 260 : 520} animate={!reduced} />
          <NeuralSphere
            count={mobile ? 150 : 240}
            k={mobile ? 2 : 3}
            mobile={mobile}
            animate={!reduced}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
