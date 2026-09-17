import { profile } from '../data/profile'
import { HowIWork } from './HowIWork'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './About.module.css'

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function About() {
  return (
    <Section id="about" index="01" label="About" title="Close to the business, all the way to production.">
      <div className={styles.grid}>
        <Reveal className={styles.text}>
          {profile.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={120}>
          <aside className={`card ${styles.aside}`}>
            <h3>At a glance</h3>
            <dl>
              <div>
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Currently</dt>
                <dd>IT Operations Specialist at radicant bank, a Swiss digital bank</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>LLM tooling, automation and production reliability on Google Cloud</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>
                  {profile.languages.map((l) => `${l.name} (${l.code})`).join(' · ')}
                </dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </div>
      <HowIWork />
      <Reveal delay={80}>
        <ul className={styles.strengths} aria-label="Strengths">
          {profile.strengths.map((s) => (
            <li key={s}>
              <Check />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
