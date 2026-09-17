import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { useTilt } from '../lib/useTilt'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Projects.module.css'

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M4 12L12 4M6 4h6v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLElement>(5)
  return (
    <article
      ref={ref}
      className={`card ${styles.card}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className={styles.top}>
        <span className={styles.kind}>{p.kind}</span>
        <span className={styles.year}>{p.year}</span>
      </div>
      <h3 className={styles.title}>{p.title}</h3>
      <p className={styles.summary}>{p.summary}</p>
      <ul className={styles.details}>
        {p.details.map((d) => (
          <li key={d.slice(0, 32)}>{d}</li>
        ))}
      </ul>
      <ul className={styles.stack} aria-label="Stack">
        {p.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
      {p.links && p.links.length > 0 && (
        <div className={styles.links}>
          {p.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label}
              <Arrow />
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

export function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      label="Projects"
      title="Work I can point to."
      lede="Client and workplace case studies, plus open-source projects that show how I build."
    >
      <div className={styles.grid}>
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90} className={styles.cell}>
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
