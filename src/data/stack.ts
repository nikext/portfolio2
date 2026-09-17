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
      'Start with the people who will use it: discovery, requirements, a quick prototype, then iterate inside their real process.',
    chips: ['Stakeholder discovery', 'Rapid prototyping', 'Demos', 'UAT'],
  },
  {
    id: 'apps',
    index: '02',
    title: 'Applications',
    blurb: 'Full-stack delivery in TypeScript and Python, with tests, code review and CI/CD.',
    chips: ['Next.js', 'Node.js', 'Python', 'SQL', 'Jest'],
  },
  {
    id: 'ai',
    index: '03',
    title: 'AI & agents',
    blurb:
      'LLM tooling and agentic workflows that remove manual work, used responsibly with real data.',
    chips: ['Anthropic Claude', 'OpenAI', 'Gemini', 'MCP', 'Claude Code'],
  },
  {
    id: 'cloud',
    index: '04',
    title: 'Cloud & operations',
    blurb:
      'Infrastructure as code, alerting, release management and monitoring on Google Cloud. 99.9% uptime.',
    chips: ['Google Cloud', 'Terraform', 'dbt', 'Kubernetes', 'Monitoring'],
  },
]
