import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { Words } from './Words'
import styles from './Section.module.css'

interface Props {
  id: string
  index: string
  label: string
  title: string
  lede?: string
  children: ReactNode
}

export function Section({ id, index, label, title, lede, children }: Props) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">
            <span className={styles.index}>{index}</span>
            {label}
          </p>
          <h2 id={`${id}-title`} className={styles.title}>
            <Words text={title} />
          </h2>
          {lede && <p className={styles.lede}>{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
