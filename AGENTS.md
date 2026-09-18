# Agent notes for portfolio2

Personal portfolio of Nikola Todorovski. Vite + React 19 + TypeScript + React Three Fiber (three.js), static output, deployed on Cloudflare Pages. No backend.

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # tsc -b + vite build → dist/
npm run preview        # serve dist/
npm run check          # typecheck + eslint + prettier --check
npm run format         # prettier --write
npm run build:assets   # regenerate public/models/mark.glb
```

## Layout

- `src/data/*.ts` holds every piece of copy, link and list. Edit content there, not in components.
- `src/components/*` are the page sections, each with a CSS module beside it. `Section.tsx` gives sections their eyebrow, title and lede; `Reveal.tsx` handles scroll-in animation.
- `src/scene/*` is the three.js layer: `Background.tsx` (fixed full-page neural sphere + starfield, driven by `state.ts` which the DOM feeds with scroll and pointer values), `StackDiagram.tsx` (interactive "How I work" diagram in About), `MarkCanvas.tsx` (brand mark loaded from the GLB in Contact), `shaders.ts`, `graph.ts`.
- `scripts/` contains the GLB generator and the Open Graph template. `public/` holds static assets; `public/portrait.jpg` and `public/cv.pdf` are optional and switch features on at build time via `define` flags in `vite.config.ts`.

## Rules

- Privacy: the site publishes email, GitHub, LinkedIn and Credly only. Never add the phone number, permit status, nationality or exact town from the CV. The CV PDF stays git-ignored.
- Readability first. Body text must stay high-contrast over the 3D layer; the sphere fades to about 20% opacity behind content sections and only returns bright for the hero and Contact. If a 3D element competes with text, dim or move the 3D element.
- Every canvas must be lazy-loaded (`React.lazy`), pause when off-screen (`useInView` → `frameloop="never"`), render a still frame under `prefers-reduced-motion` (`frameloop="demand"`), and keep `touch-action: pan-y` on the canvas so phones can scroll over it.
- Grid columns that contain a canvas must use `minmax(0, 1fr)`; `aspect-ratio` plus `min-height` in a `1fr` column overflows on phones.
- The look is champagne gold on blue-black (`--accent: #e8d5a6`, cool blue `--glow` in the sphere core) and deliberately different from the older orange nikext.dev site. Every colour comes from the tokens in `src/styles/global.css`; the three.js layer reads them through `src/scene/palette.ts` and stylesheets tint with `color-mix()` on the tokens, so never hardcode the accent. Keep the accent single and the type stack (Space Grotesk, Inter, JetBrains Mono) self-hosted.
- Pinned versions: React 19.2 (React Three Fiber 9.7 rejects 19.3), TypeScript 6 (TypeScript 7 is the native compiler without the JS API that typescript-eslint needs).
- Before pushing run `npm run check && npm run build`. For visual QA use headless Chromium through Playwright with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`; freeze transitions before running axe or contrast checks.
