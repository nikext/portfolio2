export interface SkillGroup {
  id: string
  title: string
  blurb: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'ai',
    title: 'AI & agents',
    blurb: 'Building with models, not just calling them.',
    items: [
      'Anthropic Claude API',
      'OpenAI API',
      'Google Gemini',
      'Prompt design',
      'Agentic workflows',
      'Model Context Protocol (MCP)',
      'Retrieval over internal data',
      'Google AI Studio',
      'Claude Code',
      'Cursor',
      'Codex',
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    blurb: 'Daily drivers first.',
    items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Bash', 'Java', 'C#'],
  },
  {
    id: 'engineering',
    title: 'Engineering',
    blurb: 'Full-stack delivery with tests and reviews.',
    items: [
      'Algorithms & data structures',
      'Software design',
      'REST APIs',
      'OAuth2 / JWT',
      'Node.js',
      'Express',
      'React',
      'Next.js',
      'SwiftUI & Xcode',
      'PostgreSQL',
      'MongoDB',
      'Jest',
      'Cypress',
      'Git & code review',
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & operations',
    blurb: 'Keeping regulated systems up and observable.',
    items: [
      'Google Cloud',
      'Compute Engine',
      'Cloud SQL',
      'GKE',
      'BigQuery',
      'Cloud Logging & Monitoring',
      'Cloud Storage & IAM',
      'AWS',
      'Docker',
      'Kubernetes',
      'Terraform',
      'dbt',
      'CI/CD',
      'ITSM / ITIL',
    ],
  },
  {
    id: 'ways',
    title: 'Ways of working',
    blurb: 'Close to the business, all the way to production.',
    items: [
      'Stakeholder discovery',
      'Requirement gathering',
      'Rapid prototyping',
      'Demos',
      'Agile / Kanban',
      'Jira',
      'UAT',
      'Technical & non-technical communication',
    ],
  },
]
