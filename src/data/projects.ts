export interface Project {
  id: string
  title: string
  kind: 'Client work' | 'At work' | 'iOS app' | 'Open source' | 'Side project' | 'University'
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
    id: 'swiss-admin-navigator',
    title: 'Swiss Admin Navigator',
    kind: 'Open source',
    year: '2026',
    summary:
      'Multilingual agent over 23 Swiss federal acts: answers everyday questions on permits, work, rent and social insurance, citing the exact article with a quote checked against the law.',
    details: [
      'ADK agent on Gemini Enterprise Agent Platform (Agent Runtime, Memory Bank, Model Armor) with a public MCP server over Fedlex law in DE, FR, IT and EN.',
      'Evals on a 150-case golden set with paired CIs and two judge families: 0 hallucinated citations, 99.6% verbatim quotes, CHF 0.039 per answer.',
      'Benchmarked multi-agent vs single agent and seven models, incl. Apertus self-hosted on a Cloud Run GPU; eval-gated CI with GitHub Actions and WIF.',
    ],
    stack: ['Python', 'Google ADK', 'MCP', 'Gemini', 'Agent Runtime', 'Next.js'],
    links: [{ label: 'Code', url: 'https://github.com/nikext/swiss-admin-navigator' }],
    featured: true,
  },
  {
    id: 'knight-school',
    title: 'Knight School',
    kind: 'Open source',
    year: '2026',
    summary:
      'Trained a 2B open LLM to solve chess puzzles with SFT and GRPO, testing whether a teacher-free “chess primer” lifts the plateau that RL alone hits.',
    details: [
      'Qwen3.5-2B with TRL + vLLM (LoRA GRPO, full-FT SFT) on spot A100s; a primer built only from python-chess and Stockfish data took held-out solve rate from 4.1% to 35.7%, against a 26–28% plateau for RL from the base model.',
      'Pre-registered predictions and paired bootstrap CIs on 2,000 Lichess puzzles: primer → RL beat RL alone by +7.4 points [+5.8, +9.2], RL added nothing on top of the primer, and a rules-only primer added nothing either.',
      '18 training runs for USD 198 of USD 600 in credits, behind a self-built budget gate: ledger, worst-case pre-flight checks and a billing kill switch. Models, data and a React puzzle browser are public.',
    ],
    stack: ['Python', 'PyTorch', 'TRL', 'vLLM', 'GRPO', 'Google Cloud'],
    links: [
      { label: 'Code', url: 'https://github.com/nikext/knight-school' },
      { label: 'Puzzle browser', url: 'https://nikext.github.io/knight-school/' },
      { label: 'Models', url: 'https://huggingface.co/nikext' },
    ],
    featured: true,
  },
  {
    id: 'content-orchestrator',
    title: 'Content Orchestrator',
    kind: 'Side project',
    year: '2026',
    summary:
      'Unattended SEO blog engine for three of my app sites, including Pollenly and CharmIQ: picks a topic, writes and checks the post, and publishes it to the site’s repo.',
    details: [
      'LLM pipeline from topic to outline, draft and self-QA with one revise on Gemini 3, behind a provider interface with a Claude adapter; a zod frontmatter schema and deterministic on-page checks block a bad post.',
      'Embedding dedup against each site’s ledger with calibrated cosine thresholds, plus per-post and daily USD ceilings: 40 posts published at about USD 0.05 each.',
      'Hourly GitHub Actions cron with a kill switch and volume gates, build test before push, one commit per post through a GitHub App, then a Cloudflare deploy and an IndexNow ping.',
    ],
    stack: ['TypeScript', 'Gemini', 'Claude API', 'Embeddings', 'GitHub Actions', 'Cloudflare'],
    links: [
      { label: 'Pollenly blog', url: 'https://pollenly.app/blog/' },
      { label: 'CharmIQ blog', url: 'https://charmiq.app/blog/' },
    ],
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
      { label: 'Live', url: 'https://zuri-sunny-286937397059.europe-west6.run.app' },
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
