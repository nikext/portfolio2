import type { CSSProperties } from 'react'
import { profile } from '../data/profile'
import styles from './Hero.module.css'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

export function Hero() {
  return (
    <section className={styles.hero} id="top" aria-label="Introduction">
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={`eyebrow ${styles.eyebrow}`} style={stagger(0)}>
              <span className={styles.dot} aria-hidden="true" />
              {profile.name} · {profile.location}
            </p>
            <h1 className={styles.title} style={stagger(1)}>
              AI applications that <span className={styles.accent}>ship</span>.
              <br />
              Production that <span className={styles.accent}>stays up</span>.
            </h1>
            <p className={styles.lede} style={stagger(2)}>
              {profile.tagline}
            </p>
            <div className={styles.actions} style={stagger(3)}>
              <a className="btn btn-primary" href="#projects">
                See my work
              </a>
              <a className="btn btn-ghost" href="#contact">
                Get in touch
              </a>
            </div>
            <dl className={styles.facts} style={stagger(4)}>
              {profile.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.value}</dt>
                  <dd>{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.visual} aria-hidden="true" />
        </div>
        <a className={styles.scrollCue} href="#about">
          <span>Scroll</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
