import { useEffect, useRef, useState } from 'react'
import { roles } from '../data/experience'
import { useReducedMotion } from '../lib/useReducedMotion'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Experience.module.css'

/** The signal's head follows this line, as a fraction of the viewport height. */
const READ_LINE = 0.6
/** Rail offset from the top of the track, and the centre of each role's node within its item. */
const RAIL_TOP = 6
const NODE_Y = 19

export function Experience() {
  const reduced = useReducedMotion()
  const track = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const head = useRef<HTMLSpanElement>(null)
  const items = useRef<Array<HTMLLIElement | null>>([])
  const [lit, setLit] = useState(0)

  // A signal runs down the timeline as you read, lighting each role's node as it passes.
  useEffect(() => {
    const el = track.current
    if (!el || reduced) return
    let raf = 0
    const update = () => {
      raf = 0
      // Read all geometry first, then write, so nothing forces an extra layout.
      const r = el.getBoundingClientRect()
      const y = Math.min(Math.max(window.innerHeight * READ_LINE - r.top, 0), r.height)
      const passed = items.current.filter((li) => li && li.offsetTop + NODE_Y <= y).length
      const k = Math.max(0, y - RAIL_TOP) / Math.max(1, r.height - RAIL_TOP)
      if (fill.current) fill.current.style.transform = `scaleY(${k.toFixed(4)})`
      if (head.current) {
        head.current.style.transform = `translateY(${y.toFixed(1)}px)`
        head.current.style.opacity = y > RAIL_TOP && y < r.height ? '1' : '0'
      }
      setLit(passed)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  const litCount = reduced ? roles.length : lit

  return (
    <Section
      id="experience"
      index="02"
      label="Experience"
      title="Five-plus years across banking, staffing, AI products and telecom."
      lede="Roles where I owned the outcome: from requirements and prototypes to deployment, monitoring and support."
    >
      <div ref={track} className={styles.track}>
        <span className={styles.rail} aria-hidden="true">
          <span ref={fill} className={styles.fill} />
        </span>
        <span ref={head} className={styles.head} aria-hidden="true" />
        <ol className={styles.timeline}>
          {roles.map((r, i) => (
            <li
              key={r.id}
              ref={(li) => {
                items.current[i] = li
              }}
              className={`${styles.item} ${i < litCount ? styles.lit : ''} ${r.end === null ? styles.current : ''}`}
            >
              <Reveal className={styles.inner}>
                <div className={styles.meta}>
                  <span className={styles.period}>{r.period}</span>
                  <span className={styles.place}>{r.location}</span>
                </div>
                <div>
                  <h3 className={styles.role}>{r.title}</h3>
                  <p className={styles.company}>
                    {r.company} <span>· {r.companyNote}</span>
                  </p>
                  <p className={styles.summary}>{r.summary}</p>
                  <ul className={styles.highlights}>
                    {r.highlights.map((h) => (
                      <li key={h.slice(0, 32)}>{h}</li>
                    ))}
                  </ul>
                  <ul className={styles.stack} aria-label="Technologies">
                    {r.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
