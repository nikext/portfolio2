export interface Project {
  id: string
  title: string
  kind: 'Client work' | 'At work' | 'iOS app' | 'Open source' | 'University'
  year: string
  summary: string
  details: string[]
  stack: string[]
  links?: { label: string; url: string }[]
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: 'ems',
    title: 'Employee Management System',
    kind: 'Client work',
    year: '2024–2025',
    summary:
      'Multi-tenant HR platform for a Swiss staffing company: company and employee administration, time tracking and PDF document generation.',
    details: [
      'Role-based access for Admins, Employers and Employees.',
      'Requirements gathered directly from the client and iterated in their real process.',
      'Next.js + TypeScript frontend, Node.js / Express API on PostgreSQL, NextAuth.js sessions, PDFKit reports, CI/CD on Render.',
    ],
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    featured: true,
  },
  {
    id: 'ops-ai',
    title: 'AI-assisted operations tooling',
    kind: 'At work',
    year: '2025–',
    summary:
      'Internal tools and automation for a Swiss digital bank, built with Claude Code, Gemini and Google AI Studio to speed up incident diagnosis and remove manual work.',
    details: [
      'Python and SQL automation of routine operational processes.',
      'Metric- and log-based alerting defined in dbt and Terraform on Google Cloud.',
      'Prototypes shaped with the non-engineers who use them, in a regulated environment.',
    ],
    stack: ['Python', 'SQL', 'Google Cloud', 'Terraform', 'dbt', 'LLM APIs'],
    featured: true,
  },
  {
    id: 'zuri-sunny',
    title: 'Zürich Sunny Spots',
    kind: 'Open source',
    year: '2026',
    summary:
      'Shows which Zürich cafés, bars and restaurants with outdoor seating are in the sun right now, or at a chosen time.',
    details: [
      'Points of interest and building footprints from OpenStreetMap, sun position from SunCalc.',
      'Shadow occlusion raycast in a Web Worker on the client.',
      'TanStack Start (Vite + Nitro), Drizzle + SQLite, MapLibre GL + deck.gl, deployed on Railway.',
    ],
    stack: ['TanStack Start', 'TypeScript', 'MapLibre GL', 'deck.gl', 'SQLite'],
    links: [
      { label: 'Live', url: 'https://zuri-sunny-production.up.railway.app' },
      { label: 'Code', url: 'https://github.com/nikext/zuri-sunny' },
    ],
    featured: true,
  },
  {
    id: 'charmiq',
    title: 'CharmIQ',
    kind: 'iOS app',
    year: '2026',
    summary:
      'Speech coaching for iPhone: analyses how you talk, scores delivery on device or in the cloud, and lets you practise with a live AI partner.',
    details: [
      'Swift 6, SwiftUI, MVVM with @Observable and structured concurrency; modular SPM packages, iOS 18 minimum with iOS 26 paths.',
      'On-device pipeline: AVAudioEngine, SpeechAnalyzer with iOS 18 fallback, AudioKit pitch, vDSP rules for vocal fry and uptalk.',
      'Apple Foundation Models on device or Gemini in the cloud for scoring; ElevenLabs and OpenAI Realtime for the live partner. Supabase, RevenueCat, Superwall, PostHog.',
    ],
    stack: ['Swift 6', 'SwiftUI', 'Foundation Models', 'Supabase', 'RevenueCat'],
    links: [{ label: 'Website', url: 'https://charmiq.app' }],
    featured: true,
  },
  {
    id: 'pollenly',
    title: 'Pollenly',
    kind: 'iOS app',
    year: '2026',
    summary:
      'Pollen forecast app for iPhone with a home-screen widget, so allergy sufferers can check today’s levels at a glance.',
    details: [
      'Swift and SwiftUI on the Google Pollen API for per-type pollen levels and forecasts.',
      'Custom iOS widget built with WidgetKit that keeps the forecast on the home screen.',
      'Supabase backend and RevenueCat subscriptions.',
    ],
    stack: ['Swift', 'SwiftUI', 'WidgetKit', 'Google Pollen API', 'Supabase', 'RevenueCat'],
    links: [{ label: 'Website', url: 'https://pollenly.app' }],
  },
  {
    id: 'ai-content',
    title: 'AI Content Generation Platform',
    kind: 'University',
    year: '2024',
    summary:
      'Bachelor’s final project: a SaaS platform that generates conversations, images, code, video and music from prompts.',
    details: [
      'OpenAI models for text, image and code; Replicate models for video and music.',
      'Clerk authentication with social logins, Stripe monthly subscriptions, free tier with usage limits.',
      'Next.js 14, Prisma, Tailwind CSS, fully responsive.',
    ],
    stack: ['Next.js', 'Prisma', 'Stripe', 'OpenAI API', 'Replicate'],
    links: [{ label: 'Code', url: 'https://github.com/nikext/AI-Content-Generation-Platform' }],
  },
]
