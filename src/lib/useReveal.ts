import { useEffect, useRef, useState } from 'react'

/** Marks an element as shown once it scrolls into view (once only). */
export function useReveal<T extends HTMLElement>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, shown }
}
