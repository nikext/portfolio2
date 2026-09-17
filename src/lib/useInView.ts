import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** True while the element is (nearly) in the viewport. Used to pause offscreen canvases. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '160px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])

  return inView
}
