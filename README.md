# Nikola Todorovski — portfolio

Personal portfolio site. Vite + React + TypeScript with three.js rendered through React Three Fiber. Deployed on Cloudflare Pages.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in ./dist
npm run preview      # serve ./dist locally
npm run typecheck    # tsc only
npm run build:assets # regenerate public/models/mark.glb
```

## Where things live

| What | Where |
| --- | --- |
| Name, links, intro, facts, certifications, education, languages | `src/data/profile.ts` |
| Roles / experience | `src/data/experience.ts` |
| Projects | `src/data/projects.ts` |
| Skill groups | `src/data/skills.ts` |
| "How I work" layers (the 3D stack diagram) | `src/data/stack.ts` |
| Full-page background: neural sphere, starfield, shaders, scroll state | `src/scene/Background.tsx`, `NeuralSphere.tsx`, `Starfield.tsx`, `shaders.ts`, `state.ts` |
| Interactive stack diagram (About section) | `src/scene/StackDiagram.tsx` |
| Floating brand mark loaded from a GLB (Contact section) | `src/scene/MarkCanvas.tsx`, `public/models/mark.glb` |
| Page sections | `src/components/` |
| Colours, type, spacing tokens, buttons, chips | `src/styles/global.css` |
| GLB asset generator and Open Graph image template | `scripts/` |

Every 3D canvas is lazy-loaded so three.js arrives after the page content, pauses when it scrolls out of view, and renders a still frame for visitors who prefer reduced motion. If WebGL is unavailable the page simply shows without the 3D layer.

## Deploy to Cloudflare Pages

Connect the repo in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (read from `.node-version`) |
| Environment variable | `SITE_URL=https://your-domain.tld` (makes canonical and Open Graph URLs absolute) |

Every push to `main` deploys; other branches get preview URLs. `public/_headers` adds security and cache headers.

## Optional portrait and CV

Drop `public/portrait.jpg` (4:5 works best) and/or `public/cv.pdf` (a public-safe version without private contact details) into the repo and rebuild. The build detects the files (`vite.config.ts` → `__HAS_PORTRAIT__`, `__HAS_CV__`) and shows the portrait in About and "Download CV" buttons in the hero and contact sections.

## Open Graph image

`scripts/og.html` is the 1200×630 template behind `public/og.png`. To re-render it after editing:

```bash
npx playwright screenshot --viewport-size=1200,630 "file://$PWD/scripts/og.html" public/og.png
```

## Privacy

The site publishes email, GitHub, LinkedIn and Credly links only. The source CV PDF is git-ignored so it never ends up in the repository history.
