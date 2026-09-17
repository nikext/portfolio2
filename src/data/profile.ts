export const profile = {
  name: 'Nikola Todorovski',
  firstName: 'Nikola',
  role: 'Software Engineer',
  focus: 'AI applications & production reliability',
  location: 'Zurich area, Switzerland',
  availabilityNote: 'Working inside a Swiss digital bank since 2025.',
  tagline:
    'I build LLM-powered tools and keep production software running, currently inside a Swiss digital bank.',
  intro: [
    'Software engineer with 5+ years shipping and running production software, the last year inside a Swiss digital bank. I work close to the business: understanding the real problem, prototyping quickly, and iterating with users until the tool is actually used.',
    'Day to day I work in Python, TypeScript and SQL on Google Cloud, building LLM-based tooling and automation with Anthropic Claude and OpenAI models, and using AI-assisted development tools such as Claude Code, Cursor and Google AI Studio responsibly.',
    'Google-certified in cloud engineering and generative AI, with a careful engineering mindset: clean code, testing, reliability and responsible data handling in a regulated environment.',
  ],
  email: 'nikolatod42@gmail.com',
  links: {
    github: 'https://github.com/nikext',
    linkedin: 'https://www.linkedin.com/in/nikola-todorovski-717927247/',
    credly: 'https://www.credly.com/users/nikola-todorovski',
  },
  facts: [
    { value: '5+', label: 'years shipping production software' },
    { value: '99.9%', label: 'uptime sustained on fintech applications' },
    { value: '3', label: 'Google Cloud and Google AI certifications' },
    { value: '20%', label: 'lift in user engagement from redesigned pages' },
  ],
  strengths: [
    'Clear communication with technical and non-technical stakeholders',
    'Asks good questions before building',
    'Personal ownership of results',
    'Attention to detail and structured problem-solving',
    'Proactive, self-motivated, always learning',
    'Genuine interest in financial services, digital assets and secure software in regulated environments',
  ],
  languages: [
    { name: 'Bulgarian', level: 'Native', code: 'C2' },
    { name: 'English', level: 'Professional', code: 'C1' },
    { name: 'German', level: 'Actively learning', code: 'A1' },
  ],
  certifications: [
    {
      title: 'Associate Cloud Engineer',
      issuer: 'Google Cloud',
      summary:
        'Deploying applications, monitoring operations and managing enterprise solutions on Google Cloud.',
      url: 'https://www.credly.com/badges/5c36685a-ade7-47f6-b432-28447b17538f/public_url',
    },
    {
      title: 'Generative AI Leader',
      issuer: 'Google Cloud',
      summary:
        'How generative AI transforms businesses and how to adopt it responsibly with Google Cloud offerings.',
      url: 'https://www.credly.com/badges/15ccf3d3-99cb-4b66-af54-0d950a2b3ef6/public_url',
    },
    {
      title: 'Google AI Professional Certificate',
      issuer: 'Google Career Certificates',
      summary:
        'Applying AI to research, communication, content, data analysis and coding, with a portfolio of AI-built artifacts.',
      url: 'https://www.credly.com/badges/49a8af0e-68f9-4dd3-bca8-0ee13ad8bad3/public_url',
    },
  ],
  education: {
    degree: 'BSc Informatics and Software Science',
    school: 'Technical University of Sofia',
    period: 'Graduated February 2024',
    summary:
      'Four years of hands-on software development and design in Java, Python, JavaScript and C#: computer science fundamentals, software architecture, system design and integration, web programming, big data, IoT, information security, data analysis and artificial intelligence.',
  },
} as const

export type Profile = typeof profile
