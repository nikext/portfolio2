/**
 * Mutable view state shared between the DOM (scroll / pointer listeners) and
 * the render loop. Kept outside React state so the 3D scene never re-renders.
 */
export const view = {
  /** 0..1 across the whole document. */
  scroll: 0,
  /** 0..1 across roughly the first viewport (hero → about). */
  hero: 0,
  /** Pointer position, -1..1 (mouse only). */
  px: 0,
  py: 0,
  mobile: false,
}
