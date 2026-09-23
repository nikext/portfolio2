/** 2D helpers for screen-space picking. Points are [x, y] in pixels. */
export type Pt = readonly [number, number]

/** > 0 when o → a → b turns counter-clockwise (in the numeric x/y space). */
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

/** Convex hull by Andrew's monotone chain, counter-clockwise, without a repeated end point. */
export function convexHull(points: Pt[]): Pt[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (sorted.length < 3) return sorted
  // One chain along the sorted points; its last point starts the other chain, so drop it.
  const chain = (list: Pt[]) => {
    const out: Pt[] = []
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop()
      out.push(q)
    }
    out.pop()
    return out
  }
  const lower = chain(sorted)
  const upper = chain([...sorted].reverse())
  return [...lower, ...upper]
}

function segmentDistance(a: Pt, b: Pt, x: number, y: number) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len2 = dx * dx + dy * dy
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / len2)) : 0
  return Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y)
}

/** True when (x, y) is inside the convex polygon `hull`, or within `margin` of its outline. */
export function nearHull(hull: Pt[], x: number, y: number, margin: number) {
  let inside = hull.length >= 3
  let nearest = Infinity
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i]
    const b = hull[(i + 1) % hull.length]
    if (cross(a, b, [x, y]) < 0) inside = false
    nearest = Math.min(nearest, segmentDistance(a, b, x, y))
  }
  return inside || nearest <= margin
}
