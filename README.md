# Nikola Todorovski — portfolio

Personal portfolio site. Vite + React + TypeScript with three.js rendered through React Three Fiber. Deployed on Cloudflare Workers as static assets.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in ./dist
npm run preview      # serve ./dist locally
npm run typecheck    # tsc only
npm run check        # typecheck + eslint + prettier --check
npm run format       # prettier --write
npm run build:assets # regenerate public/models/mark.glb
```

## Where things live

| What                                                                 | Where                                                                                     |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Name, links, hero headline, intro, facts, certifications, languages  | `src/data/profile.ts`                                                                     |
| Roles / experience                                                   | `src/data/experience.ts`                                                                  |
| Projects                                                             | `src/data/projects.ts`                                                                    |
| Skill groups                                                         | `src/data/skills.ts`                                                                      |
| "How I work" layers (the 3D stack diagram)                           | `src/data/stack.ts`                                                                       |
| Full-page background: neural sphere, starfield, shaders, input state | `src/scene/Background.tsx`, `NeuralSphere.tsx`, `Starfield.tsx`, `shaders.ts`, `state.ts` |
| Interactive stack diagram (About section)                            | `src/scene/StackDiagram.tsx`                                                              |
| Floating brand mark loaded from a GLB (Contact section)              | `src/scene/MarkCanvas.tsx`, `public/models/mark.glb`                                      |
| Page sections                                                        | `src/components/`                                                                         |
| Colours, type, spacing tokens, buttons, chips                        | `src/styles/global.css`                                                                   |
| GLB asset generator and Open Graph image template                    | `scripts/`                                                                                |

Every 3D canvas is lazy-loaded so three.js arrives after the page content, pauses when it scrolls out of view, and renders a still frame for visitors who prefer reduced motion. If WebGL is unavailable the page simply shows without the 3D layer.

## Interactions

- Hero sphere: nodes bulge away from the mouse, dragging the empty right column spins it, and a click near it fires a signal that spreads through the graph hop by hop (a breadth-first search over its edges). It also fires signals by itself while idle, and once when you reach Contact.
- Starfield: stars stretch into streaks when the page is scrolled fast and brighten around the mouse.
- Type: headings reveal word by word; the champagne headline words carry a sheen and a light that follows the mouse; the hero stats count up.
- Scroll: a signal runs down the Experience timeline and lights each role, the "How I work" stack spreads into an exploded view, and the header shows reading progress with a pill that slides between links.
- Cards and buttons: project cards tilt with layered depth and a rim light; primary buttons lean toward the mouse.
- Contact: drag the 3D mark to spin it, click it to ping (which also fires a signal through the sphere behind the card), and copy the email address with one click.

All of it is off for touch where it needs a mouse, and replaced by the final static state under `prefers-reduced-motion`.

## Deploy to Cloudflare

The site deploys as a Cloudflare Worker with static assets through Workers Builds (Workers & Pages → Create → Import a repository). `wrangler.jsonc` holds the deploy config: `npx wrangler deploy` runs `npm run build` and uploads `./dist`.

| Setting        | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Build command  | empty or `npm run build` (the deploy step builds either way)                      |
| Deploy command | `npx wrangler deploy`                                                             |
| Node version   | `22` (read from `.node-version`)                                                  |
| Build variable | `SITE_URL=https://your-domain.tld` (makes canonical and Open Graph URLs absolute) |

Every push to `main` deploys. The Worker's name in the dashboard must stay `portfolio2`, the `name` in `wrangler.jsonc`. `public/_headers` adds security and cache headers; Workers static assets read it the same way Pages did. To check a deploy without uploading anything, run `npx wrangler deploy --dry-run`.

## Optional portrait and CV

Drop `public/portrait.jpg` (4:5 works best) and/or `public/cv.pdf` (a public-safe version without private contact details) into the repo and rebuild. The build detects the files (`vite.config.ts` → `__HAS_PORTRAIT__`, `__HAS_CV__`) and shows the portrait in About and "Download CV" buttons in the hero and contact sections.

## Open Graph image

`scripts/og.html` is the 1200×630 template behind `public/og.png`. To re-render it after editing:

```bash
npx playwright screenshot --viewport-size=1200,630 "file://$PWD/scripts/og.html" public/og.png
```

## Privacy

The site publishes email, GitHub, LinkedIn and Credly links only. The source CV PDF is git-ignored so it never ends up in the repository history.
