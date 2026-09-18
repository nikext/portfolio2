/**
 * Colour tokens for the three.js layer, read from the CSS custom properties in
 * src/styles/global.css so the scene always matches the page. The stylesheet is
 * imported before any scene chunk loads, so reading at module level is safe; the
 * fallbacks only cover environments without a document.
 */
const FALLBACK = {
  '--accent': '#e8d5a6',
  '--glow': '#7c93e8',
} as const

export type ColorToken = keyof typeof FALLBACK

export function cssColor(token: ColorToken): string {
  if (typeof document === 'undefined') return FALLBACK[token]
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return value || FALLBACK[token]
}
