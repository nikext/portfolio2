# Nikola Todorovski — portfolio

Personal portfolio site. Vite + React + TypeScript with a three.js background rendered through React Three Fiber. Deployed on Cloudflare Pages.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in ./dist
npm run preview    # serve ./dist locally
npm run typecheck  # tsc only
```

## Where things live

| What | Where |
| --- | --- |
| Name, links, intro, facts, certifications, education, languages | `src/data/profile.ts` |
| Roles / experience | `src/data/experience.ts` |
| Projects | `src/data/projects.ts` |
| Skill groups | `src/data/skills.ts` |
| 3D background: neural sphere, starfield, shaders, scroll state | `src/scene/` |
| Page sections | `src/components/` |
| Colours, type, spacing tokens, buttons, chips | `src/styles/global.css` |

## Deploy to Cloudflare Pages

Connect the repo in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (read from `.node-version`) |

Every push to `main` deploys; other branches get preview URLs. `public/_headers` adds security and cache headers.

## Privacy

The site publishes email, GitHub, LinkedIn and Credly links only. The source CV PDF is git-ignored so it never ends up in the repository history.
