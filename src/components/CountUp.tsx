import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

const DURATION = 1400

/**
 * Counts the number at the start of a stat such as "99.9%" or "5+" up from
 * zero once, after `delay` ms. Values without a leading number render as they
 * are. The animated digits are hidden from screen readers, which read the
 * final value instead.
 */
export function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value)
    if (!el || !match || reduced) return
    const target = Number(match[1])
    const decimals = match[1].split('.')[1]?.length ?? 0
    const suffix = match[2]
    const render = (n: number) => {
      el.textContent = n.toFixed(decimals) + suffix
    }
    const start = performance.now() + delay
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / DURATION))
      render(target * (1 - Math.pow(1 - k, 4)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    render(0)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      render(target)
    }
  }, [value, delay, reduced])

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  )
}
