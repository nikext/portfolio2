import { profile } from '../data/profile'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <Section id="contact" index="06" label="Contact" title="Let’s build something that actually gets used.">
      <Reveal>
        <div className={`card ${styles.wrap}`}>
          <p className={styles.lede}>
            The quickest way to reach me is email. I’m based in the Zurich area and happy to talk about
            AI tooling, full-stack product work or keeping production stable in a regulated setting.
          </p>
          <div className={styles.actions}>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn btn-ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="btn btn-ghost" href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn btn-ghost" href={profile.links.credly} target="_blank" rel="noreferrer">
              Credly
            </a>
          </div>
          <p className={styles.meta}>
            <span>{profile.location}</span>
            <span>Europe/Zurich (CET)</span>
            <span>English · Bulgarian · German (learning)</span>
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
