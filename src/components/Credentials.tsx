import type { CSSProperties } from 'react'
import { profile } from '../data/profile'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Credentials.module.css'

const CEFR: Record<string, number> = { A1: 17, A2: 33, B1: 50, B2: 67, C1: 83, C2: 100 }

export function Credentials() {
  return (
    <Section
      id="credentials"
      index="05"
      label="Credentials"
      title="Certified on Google Cloud, with a degree in software science."
    >
      <div className={styles.certs}>
        {profile.certifications.map((c, i) => (
          <Reveal key={c.title} delay={i * 90} className={styles.cell}>
            <a className={`card ${styles.cert}`} href={c.url} target="_blank" rel="noreferrer">
              <span className="eyebrow">{c.issuer}</span>
              <h3>{c.title}</h3>
              <p>{c.summary}</p>
              <span className={styles.verify}>Verify on Credly ↗</span>
            </a>
          </Reveal>
        ))}
      </div>

      <div className={styles.row}>
        <Reveal className={styles.cell}>
          <div className={`card ${styles.edu}`}>
            <span className="eyebrow">Education</span>
            <h3>{profile.education.degree}</h3>
            <p className={styles.school}>
              {profile.education.school} · {profile.education.period}
            </p>
            <p className={styles.eduSummary}>{profile.education.summary}</p>
          </div>
        </Reveal>
        <Reveal delay={120} className={styles.cell}>
          <div className={`card ${styles.langs}`}>
            <span className="eyebrow">Languages</span>
            <ul>
              {profile.languages.map((l) => (
                <li key={l.name}>
                  <span>{l.name}</span>
                  <span className={styles.level}>
                    {l.level} · {l.code}
                  </span>
                  <span className={styles.bar} aria-hidden="true">
                    <i style={{ '--w': `${CEFR[l.code] ?? 50}%` } as CSSProperties} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
