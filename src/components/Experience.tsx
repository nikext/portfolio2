import { roles } from '../data/experience'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      label="Experience"
      title="Five-plus years across banking, staffing, AI products and telecom."
      lede="Roles where I owned the outcome: from requirements and prototypes to deployment, monitoring and support."
    >
      <ol className={styles.timeline}>
        {roles.map((r) => (
          <li key={r.id} className={styles.item}>
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
    </Section>
  )
}
