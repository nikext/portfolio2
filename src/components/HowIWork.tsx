import { lazy, Suspense, useState } from 'react'
import { layers } from '../data/stack'
import { Reveal } from './Reveal'
import styles from './HowIWork.module.css'

const StackDiagram = lazy(() => import('../scene/StackDiagram'))

export function HowIWork() {
  const [active, setActive] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const current = pinned ?? active

  return (
    <div className={styles.wrap} id="how-i-work">
      <Reveal className={styles.head}>
        <p className="eyebrow">How I work</p>
        <h3 className={styles.title}>
          From the people who use it to the models and infrastructure that run it.
        </h3>
        <p className={styles.lede}>
          Hover or tap a layer. The pulses are requests travelling down the stack and telemetry
          coming back up.
        </p>
      </Reveal>

      <div className={styles.grid}>
        <Reveal className={styles.stageCell}>
          <div className={`card ${styles.stage}`}>
            <Suspense fallback={<div className={styles.fallback} aria-hidden="true" />}>
              <StackDiagram
                active={active}
                pinned={pinned}
                onActive={setActive}
                onPin={setPinned}
              />
            </Suspense>
          </div>
        </Reveal>

        <ol className={styles.list} aria-label="Layers I work across">
          {layers.map((l, i) => (
            <li key={l.id}>
              <Reveal delay={i * 70}>
                <button
                  type="button"
                  className={`${styles.layer} ${current === l.id ? styles.on : ''}`}
                  onMouseEnter={() => setActive(l.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(l.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setPinned(pinned === l.id ? null : l.id)}
                  aria-pressed={pinned === l.id}
                >
                  <span className={styles.idx}>{l.index}</span>
                  <span className={styles.body}>
                    <strong>{l.title}</strong>
                    <span className={styles.blurb}>{l.blurb}</span>
                    <span className={styles.chips}>
                      {l.chips.map((c) => (
                        <span key={c} className="chip">
                          {c}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
