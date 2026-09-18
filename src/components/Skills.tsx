import { skillGroups } from '../data/skills'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Skills.module.css'

export function Skills() {
  return (
    <Section
      id="skills"
      index="04"
      label="Skills"
      title="What I work with."
      lede="Grouped the way I use them: models, agents and evals first, then the languages, architecture and cloud that get them to production."
    >
      <div className={styles.grid}>
        {skillGroups.map((g, i) => (
          <Reveal key={g.id} delay={i * 70} className={g.id === 'ai' ? styles.wide : undefined}>
            <div className={`card ${styles.group}`}>
              <h3>{g.title}</h3>
              <p className={styles.blurb}>{g.blurb}</p>
              <ul className={styles.list}>
                {g.items.map((item) => (
                  <li key={item} className={`chip ${g.id === 'ai' ? styles.hi : ''}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
