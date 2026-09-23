import { Fragment, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { profile } from '../data/profile'
import { useMagnetic } from '../lib/useMagnetic'
import { CountUp } from './CountUp'
import styles from './Hero.module.css'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Splits a headline line into words. "*stays" opens an accent run and "up*."
 * closes it; anything after the closing asterisk is trailing punctuation.
 */
function parseLine(line: string) {
  let open = false
  return line.split(' ').map((raw) => {
    let text = raw
    let tail = ''
    if (text.startsWith('*')) {
      open = true
      text = text.slice(1)
    }
    const accent = open
    const close = text.indexOf('*')
    if (close >= 0) {
      tail = text.slice(close + 1)
      text = text.slice(0, close)
      open = false
    }
    return { text, tail, accent }
  })
}

/** Headline words with a running index (--w) for the staggered reveal. */
const HEADLINE = (() => {
  let w = 0
  return profile.headline.map((line) => parseLine(line).map((t) => ({ ...t, w: w++ })))
})()

/**
 * The mouse carries a soft light over the champagne words: --lx / --ly are the
 * pointer position relative to each accent word (see .accent in Hero.module.css).
 */
function useFoilLight() {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-foil]'))
    let raf = 0
    let x = 0
    let y = 0
    const apply = () => {
      raf = 0
      const rects = words.map((w) => w.getBoundingClientRect())
      words.forEach((w, i) => {
        w.style.setProperty('--lx', `${(x - rects[i].left).toFixed(1)}px`)
        w.style.setProperty('--ly', `${(y - rects[i].top).toFixed(1)}px`)
      })
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return ref
}

export function Hero() {
  const title = useFoilLight()
  const work = useMagnetic<HTMLAnchorElement>()
  const contact = useMagnetic<HTMLAnchorElement>()

  return (
    <section className={styles.hero} id="top" aria-label="Introduction">
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={`eyebrow ${styles.eyebrow}`} style={stagger(0)}>
              <span className={styles.dot} aria-hidden="true" />
              {profile.name} · {profile.location}
            </p>
            <h1 ref={title} className={styles.title}>
              {HEADLINE.map((line, l) => (
                <Fragment key={l}>
                  {l > 0 && <br />}
                  {line.map((t, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <span className="word" style={{ '--w': t.w } as CSSProperties}>
                        {t.accent ? (
                          <span className={styles.accent} data-foil>
                            {t.text}
                          </span>
                        ) : (
                          t.text
                        )}
                        {t.tail}
                      </span>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </h1>
            <p className={styles.lede} style={stagger(2)}>
              {profile.tagline}
            </p>
            <div className={styles.actions} style={stagger(3)}>
              <a ref={work} className="btn btn-primary" href="#projects">
                See my work
              </a>
              <a ref={contact} className="btn btn-ghost" href="#contact">
                Get in touch
              </a>
              {__HAS_CV__ && (
                <a className="btn btn-ghost" href="/cv.pdf" download>
                  Download CV
                </a>
              )}
            </div>
            <dl className={styles.facts} style={stagger(4)}>
              {profile.facts.map((f, i) => (
                <div key={f.label}>
                  <dt>
                    <CountUp value={f.value} delay={650 + i * 120} />
                  </dt>
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          {/* The sphere is drawn by the background canvas; this empty column is its drag handle. */}
          <div className={styles.visual} data-sphere aria-hidden="true">
            <p className={styles.hint}>
              <span>Drag to spin</span>
              <span>Click to fire a signal</span>
            </p>
          </div>
        </div>
        <a className={styles.scrollCue} href="#about">
          <span>Scroll</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
