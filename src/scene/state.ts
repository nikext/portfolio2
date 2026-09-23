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
  /** True while a mouse is over the page; drives the cursor lens and star light. */
  pointer: false,
  /** Smoothed scroll speed in viewport heights per second, written by the scene. */
  velocity: 0,
  mobile: false,
}

/**
 * Clicks and drags the DOM hands to the neural sphere. The render loop drains
 * `taps`, `drag` and `pings` every frame, so nothing here triggers React work.
 */
export const input = {
  /** Clicks / taps in normalised device coordinates, waiting to fire a signal. */
  taps: [] as Array<{ x: number; y: number }>,
  /** Horizontal drag since the last frame, in NDC units (2 = full viewport width). */
  drag: 0,
  dragging: false,
  /** Clicks on the Contact mark since the last frame; the sphere answers with a signal. */
  pings: 0,
}
