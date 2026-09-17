import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import styles from './Header.module.css'

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!('IntersectionObserver' in window) || sections.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`${styles.header} ${scrolled || open ? styles.scrolled : ''} ${open ? styles.menuOpen : ''}`}
    >
      <div className={`container ${styles.inner}`}>
        <a className={styles.brand} href="#top" aria-label="Nikola Todorovski, back to top">
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <g stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                <line x1="18" y1="44" x2="32" y2="20" />
                <line x1="32" y1="20" x2="46" y2="44" />
                <line x1="18" y1="44" x2="46" y2="44" />
              </g>
              <g fill="#e0f7ff">
                <circle cx="18" cy="44" r="6" />
                <circle cx="32" cy="20" r="6" />
                <circle cx="46" cy="44" r="6" />
              </g>
            </svg>
          </span>
          <span className={styles.brandText}>
            {profile.name}
            <small>{profile.role}</small>
          </span>
        </a>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={`${styles.bars} ${open ? styles.barsOpen : ''}`} aria-hidden="true" />
        </button>

        <nav id="site-nav" className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Sections">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={active === n.id ? styles.active : undefined}
              aria-current={active === n.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <a className={`btn btn-primary btn-sm ${styles.cta}`} href={`mailto:${profile.email}`}>
            Email me
          </a>
        </nav>
      </div>
    </header>
  )
}
