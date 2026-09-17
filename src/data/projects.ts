export interface Project {
  id: string
  title: string
  kind: 'Client work' | 'At work' | 'Open source' | 'University'
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
  {
    id: 'boilerplate',
    title: 'Full-stack TypeScript boilerplate',
    kind: 'Open source',
    year: '2025',
    summary:
      'Production-ready monorepo starter: Next.js app, Express API, shared Zod schemas, Prisma on PostgreSQL, shadcn/ui and Docker Compose.',
    details: [
      'Turborepo workspace with shared types and schemas across frontend and backend.',
      'End-to-end type safety with TypeScript and Zod validation.',
      'Set up for AI-assisted development in Cursor.',
    ],
    stack: ['Turborepo', 'Next.js', 'Express', 'Prisma', 'Zod'],
    links: [{ label: 'Code', url: 'https://github.com/nikext/boilerplate' }],
  },
  {
    id: 'gallery',
    title: 'Modern Gallery App',
    kind: 'Open source',
    year: '2024',
    summary: 'Image gallery built on React Server Components with Next.js, Drizzle and shadcn/ui.',
    details: [
      'Server components and server actions for uploads and listing.',
      'Drizzle ORM schema and migrations, Tailwind CSS styling.',
    ],
    stack: ['Next.js', 'React Server Components', 'Drizzle', 'Tailwind CSS'],
    links: [
      { label: 'Live', url: 'https://gallery-delta-pearl.vercel.app' },
      { label: 'Code', url: 'https://github.com/nikext/gallery' },
    ],
  },
]
