export interface Layer {
  id: string
  index: string
  title: string
  blurb: string
  chips: string[]
}

/** The four layers of the "How I work" diagram, top to bottom. */
export const layers: Layer[] = [
  {
    id: 'people',
    index: '01',
    title: 'People & business',
    blurb:
      'Forward-deployed by default: embed with the people who will use it, run discovery, scope the problem, ship a prototype in days, then iterate inside their real process until it sticks.',
    chips: [
      'Forward-deployed delivery',
      'Discovery & scoping',
      'Rapid prototyping',
      'Demos',
      'UAT',
      'Enablement',
    ],
  },
  {
    id: 'apps',
    index: '02',
    title: 'Applications',
    blurb:
      'Full-stack delivery in TypeScript, Python and Swift: typed APIs, modular architecture, tests, code review and CI/CD.',
    chips: [
      'TypeScript',
      'Next.js',
      'Node.js',
      'Python',
      'SwiftUI',
      'PostgreSQL',
      'REST & webhooks',
      'CI/CD',
    ],
  },
  {
    id: 'ai',
    index: '03',
    title: 'AI & agents',
    blurb:
      'LLM applications and agentic workflows end to end: retrieval, tool use, structured outputs, evals and guardrails, with a human in the loop where it matters and real data handled responsibly.',
    chips: [
      'Anthropic Claude',
      'OpenAI',
      'Gemini',
      'RAG',
      'Tool use',
      'Structured outputs',
      'Evals',
      'MCP',
      'Claude Code',
    ],
  },
  {
    id: 'cloud',
    index: '04',
    title: 'Cloud & operations',
    blurb:
      'Infrastructure as code, observability, alerting, release management and incident response on Google Cloud. 99.9% uptime.',
    chips: [
      'Google Cloud',
      'Terraform',
      'Kubernetes',
      'dbt',
      'BigQuery',
      'Observability',
      'SLOs & alerting',
      'Incident response',
    ],
  },
]
