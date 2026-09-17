export interface Role {
  id: string
  company: string
  companyNote: string
  title: string
  period: string
  start: string
  end: string | null
  location: string
  summary: string
  highlights: string[]
  stack: string[]
}

export const roles: Role[] = [
  {
    id: 'radicant',
    company: 'radicant bank',
    companyNote: 'Swiss digital bank',
    title: 'IT Operations Specialist',
    period: 'Aug 2025 – present',
    start: '2025-08',
    end: null,
    location: 'Zurich, Switzerland',
    summary:
      'Running production for a regulated banking platform and using AI tooling to automate the operational work around it.',
    highlights: [
      'Use AI tooling (Claude Code, Gemini, Google AI Studio) to automate operational work, speed up incident diagnosis and prototype internal tools for colleagues who are not engineers.',
      'Automate routine and manual processes with Python and SQL; build and maintain metric- and log-based alerting with dbt and Terraform.',
      'Support production environments and release management for high-priority fintech applications, from deployment to post-release monitoring, sustaining 99.9% uptime.',
      'Manage Google Cloud infrastructure (Compute Engine, Cloud SQL, GKE, BigQuery, Logging, Monitoring, Cloud Storage) following ITSM best practice.',
      'Support users of the online banking platform daily and translate what they report into fixes and tooling, working with development, security and compliance teams.',
    ],
    stack: [
      'Python',
      'SQL',
      'Google Cloud',
      'Terraform',
      'dbt',
      'GKE',
      'BigQuery',
      'Claude Code',
      'Gemini',
    ],
  },
  {
    id: 'vad',
    company: 'VAD Personal',
    companyNote: 'Swiss staffing company · contract',
    title: 'Full-Stack Engineer',
    period: 'Nov 2024 – May 2025',
    start: '2024-11',
    end: '2025-05',
    location: 'Bülach (Zurich), Switzerland',
    summary:
      'Designed and delivered a multi-tenant Employee Management System end to end, from requirements to production.',
    highlights: [
      'Built company and employee administration, time tracking and document generation, gathering requirements directly from the client and iterating until it worked in their real process.',
      'Implemented role-based permission control with explicit levels for Admins, Employers and Employees.',
      'Responsive, accessible frontend in Next.js with TypeScript and Tailwind CSS on a RESTful Node.js / Express backend with PostgreSQL.',
      'Secured authentication and sessions with NextAuth.js (JWT); generated employee time reports as PDFs with PDFKit.',
      'Deployed and operated the application on Render with CI/CD pipelines.',
    ],
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express',
      'PostgreSQL',
      'NextAuth.js',
      'Render',
    ],
  },
  {
    id: 'floatz',
    company: 'floatz.ai',
    companyNote: 'AI product startup',
    title: 'Frontend Engineer',
    period: 'Apr 2024 – Oct 2024',
    start: '2024-04',
    end: '2024-10',
    location: 'Zurich, Switzerland',
    summary:
      'Built and refined the user-facing side of an AI platform, then took on backend work for auth and payments.',
    highlights: [
      'Built new functionality and enhanced the UI of an AI platform with Next.js and React, making it both operational and pleasant to use.',
      'Integrated OAuth protocols and end-to-end user registration and login; added OAuth2 authentication and Stripe payments on the Node.js backend.',
      'Delivered full-cycle solutions, performance optimisation and several of the project’s architecture decisions.',
      'Redesigned pages with advanced CSS and JavaScript libraries, lifting user engagement metrics by 20%.',
    ],
    stack: ['Next.js', 'React', 'Node.js', 'OAuth2', 'Stripe'],
  },
  {
    id: 'amdocs',
    company: 'Amdocs',
    companyNote: 'Telecom software',
    title: 'Software Engineer',
    period: 'Mar 2021 – May 2023',
    start: '2021-03',
    end: '2023-05',
    location: 'Sofia, Bulgaria',
    summary:
      'Shipped features and tests for cloud web applications in an Agile team, and helped new engineers get productive.',
    highlights: [
      'Implemented features in TypeScript and React for cloud web applications, improving functionality and user satisfaction.',
      'Wrote and maintained unit and UI tests with Jest and Cypress to keep the codebase stable.',
      'Fixed bugs efficiently and anticipated problems in advance, reducing user complaints by 25%.',
      'Led technical discussions and demos with stakeholders; onboarded and guided new engineers across the team’s codebases.',
      'Worked in Agile teams on requirement gathering, using Git, PostgreSQL and AWS services.',
    ],
    stack: ['TypeScript', 'React', 'Jest', 'Cypress', 'PostgreSQL', 'AWS'],
  },
]
