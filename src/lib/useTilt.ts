import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'

/**
 * Pointer-driven 3D tilt for cards. Writes CSS custom properties directly on
 * the element (no re-renders). Disabled for touch and reduced-motion users.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 6) {
  const ref = useRef<T>(null)
  const enabled = useRef(false)

  useEffect(() => {
    enabled.current =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const onPointerMove = (e: PointerEvent<T>) => {
    const el = ref.current
    if (!enabled.current || !el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * maxDeg).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * maxDeg).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  const onPointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return { ref, onPointerMove, onPointerLeave }
}
