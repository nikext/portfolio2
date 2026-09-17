import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Replaces __SITE_URL__ in index.html with the SITE_URL build env var (no trailing
 * slash), so Open Graph and canonical URLs are absolute once the domain is known.
 */
function siteUrl(): Plugin {
  const url = (process.env.SITE_URL ?? '').replace(/\/+$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrl()],
})
