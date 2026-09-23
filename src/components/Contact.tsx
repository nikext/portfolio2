import { lazy, Suspense, useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { useMagnetic } from '../lib/useMagnetic'
import { Reveal } from './Reveal'
import { Section } from './Section'
import styles from './Contact.module.css'

const MarkCanvas = lazy(() => import('../scene/MarkCanvas'))

/** Copies the email address; `copied` flips back after a moment. Hidden where the Clipboard API is missing. */
function useCopyEmail() {
  const [copied, setCopied] = useState(false)
  const [canCopy] = useState(() => typeof navigator !== 'undefined' && !!navigator.clipboard)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2200)
    return () => clearTimeout(id)
  }, [copied])

  const copy = () => {
    navigator.clipboard.writeText(profile.email).then(
      () => setCopied(true),
      // Clipboard access denied: the mailto link next to the button still works.
      () => {},
    )
  }

  return { canCopy, copied, copy }
}

export function Contact() {
  // The floating 3D mark is decoration; skip it (and its WebGL context) on small screens.
  const [wide] = useState(() => window.matchMedia('(min-width: 861px)').matches)
  const mail = useMagnetic<HTMLAnchorElement>()
  const { canCopy, copied, copy } = useCopyEmail()

  return (
    <Section
      id="contact"
      index="06"
      label="Contact"
      title="Let’s build something that actually gets used."
    >
      <Reveal>
        <div className={`card ${styles.wrap}`}>
          <div className={styles.main}>
            <p className={styles.lede}>
              The quickest way to reach me is email. I’m based in the Zurich area and happy to talk
              about AI tooling, full-stack product work or keeping production stable in a regulated
              setting.
            </p>
            <div className={styles.actions}>
              <a ref={mail} className="btn btn-primary" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              {canCopy && (
                <button
                  type="button"
                  className={`btn btn-ghost ${styles.copy} ${copied ? styles.copied : ''}`}
                  onClick={copy}
                >
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                    {copied ? (
                      <path
                        d="M3 8.5l3.2 3.2L13 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <>
                        <rect
                          x="5.5"
                          y="5.5"
                          width="8"
                          height="8"
                          rx="1.8"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                        <path
                          d="M10.5 3.5v-.3A1.7 1.7 0 0 0 8.8 1.5H4.2A1.7 1.7 0 0 0 2.5 3.2v4.6a1.7 1.7 0 0 0 1.7 1.7h.3"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </>
                    )}
                  </svg>
                  {copied ? 'Copied' : 'Copy email'}
                </button>
              )}
              <a
                className="btn btn-ghost"
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="btn btn-ghost"
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="btn btn-ghost"
                href={profile.links.credly}
                target="_blank"
                rel="noreferrer"
              >
                Credly
              </a>
              {__HAS_CV__ && (
                <a className="btn btn-ghost" href="/cv.pdf" download>
                  Download CV
                </a>
              )}
            </div>
            <p className="sr-only" role="status">
              {copied ? 'Email address copied to the clipboard' : ''}
            </p>
            <p className={styles.meta}>
              <span>{profile.location}</span>
              <span>Europe/Zurich (CET)</span>
              <span>English · Bulgarian · German (learning)</span>
            </p>
          </div>
          {wide && (
            <div className={styles.mark}>
              <Suspense fallback={null}>
                <MarkCanvas />
              </Suspense>
            </div>
          )}
        </div>
      </Reveal>
    </Section>
  )
}
