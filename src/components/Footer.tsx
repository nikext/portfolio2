import { profile } from '../data/profile'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </span>
        <span>Built with React, three.js and React Three Fiber</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
