import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../lib/useReveal'

interface Props {
  children: ReactNode
  className?: string
  /** Stagger delay in ms. */
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: Props) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className ?? ''}`}
      style={{ '--delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
