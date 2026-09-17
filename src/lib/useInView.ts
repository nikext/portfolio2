import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** True while the element is (nearly) in the viewport. Used to pause offscreen canvases. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '160px') {
  // Without IntersectionObserver there is nothing to observe: treat the element as visible.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])

  return inView
}
