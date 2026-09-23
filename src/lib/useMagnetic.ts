import { useEffect, useRef } from 'react'

/**
 * Buttons that lean toward the mouse while it is over them. Writes --pull-x /
 * --pull-y on the element, which `.btn` in global.css folds into its transform.
 * Disabled for touch and reduced-motion users.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.28, max = 9) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (
      !el ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const pull = (v: number) => `${Math.max(-max, Math.min(max, v * strength)).toFixed(2)}px`
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--pull-x', pull(e.clientX - (r.left + r.width / 2)))
      el.style.setProperty('--pull-y', pull(e.clientY - (r.top + r.height / 2)))
    }
    const onLeave = () => {
      el.style.removeProperty('--pull-x')
      el.style.removeProperty('--pull-y')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [strength, max])

  return ref
}
