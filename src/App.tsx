import { lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { Credentials } from './components/Credentials'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import styles from './App.module.css'

// three.js is the bulk of the bundle: load it after the page content is on screen.
const Background = lazy(() =>
  import('./scene/Background').then((m) => ({ default: m.Background })),
)

export default function App() {
  return (
    <>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <div className={styles.glow} aria-hidden="true" />
      <Suspense fallback={null}>
        <Background />
      </Suspense>
      <div className={styles.page}>
        <Header />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Credentials />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
