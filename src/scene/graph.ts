import * as THREE from 'three'
import { mulberry32 } from './random'

/**
 * Builds the "neural sphere": nodes spread on a jittered Fibonacci sphere,
 * connected to their k nearest neighbours. Every node also gets a random
 * far-away start position so the graph can assemble itself on load.
 */
export function buildGraph(count: number, k: number, radius = 2.1, seed = 11) {
  const rand = mulberry32(seed)

  const pos = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const phase = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const rad = radius * (0.88 + rand() * 0.24)
    pos[i * 3] = Math.cos(theta) * r * rad
    pos[i * 3 + 1] = y * rad
    pos[i * 3 + 2] = Math.sin(theta) * r * rad

    // scattered start position: same direction, much further out, plus noise
    const far = radius * (3.5 + rand() * 3)
    start[i * 3] = Math.cos(theta) * r * far + (rand() - 0.5) * 4
    start[i * 3 + 1] = y * far + (rand() - 0.5) * 4
    start[i * 3 + 2] = Math.sin(theta) * r * far + (rand() - 0.5) * 4

    // a few "hub" nodes are noticeably larger
    size[i] = rand() < 0.08 ? 1.8 + rand() * 0.6 : 0.7 + rand() * 0.8
    phase[i] = rand()
  }

  // k-nearest-neighbour edges (n is small, so the O(n²) scan is fine)
  const pairs: Array<[number, number]> = []
  const seen = new Set<number>()
  const dists: Array<{ j: number; d: number }> = []
  for (let i = 0; i < count; i++) {
    dists.length = 0
    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = pos[i * 3] - pos[j * 3]
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
      dists.push({ j, d: dx * dx + dy * dy + dz * dz })
    }
    dists.sort((a, b) => a.d - b.d)
    for (let n = 0; n < k && n < dists.length; n++) {
      const j = dists[n].j
      const key = i < j ? i * count + j : j * count + i
      if (seen.has(key)) continue
      seen.add(key)
      pairs.push([i, j])
    }
  }

  const ePos = new Float32Array(pairs.length * 6)
  const eStart = new Float32Array(pairs.length * 6)
  const eNodePhase = new Float32Array(pairs.length * 2)
  const eT = new Float32Array(pairs.length * 2)
  const ePhase = new Float32Array(pairs.length * 2)
  const eSpeed = new Float32Array(pairs.length * 2)
  const eActive = new Float32Array(pairs.length * 2)
  pairs.forEach(([a, b], n) => {
    for (let c = 0; c < 3; c++) {
      ePos[n * 6 + c] = pos[a * 3 + c]
      ePos[n * 6 + 3 + c] = pos[b * 3 + c]
      eStart[n * 6 + c] = start[a * 3 + c]
      eStart[n * 6 + 3 + c] = start[b * 3 + c]
    }
    eNodePhase[n * 2] = phase[a]
    eNodePhase[n * 2 + 1] = phase[b]
    eT[n * 2] = 0
    eT[n * 2 + 1] = 1
    const ph = rand()
    const sp = 0.06 + rand() * 0.16
    const active = rand() < 0.45 ? 1 : 0
    ePhase[n * 2] = ePhase[n * 2 + 1] = ph
    eSpeed[n * 2] = eSpeed[n * 2 + 1] = sp
    eActive[n * 2] = eActive[n * 2 + 1] = active
  })

  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  nodeGeo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))

  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
  edgeGeo.setAttribute('aStart', new THREE.BufferAttribute(eStart, 3))
  edgeGeo.setAttribute('aNodePhase', new THREE.BufferAttribute(eNodePhase, 1))
  edgeGeo.setAttribute('aT', new THREE.BufferAttribute(eT, 1))
  edgeGeo.setAttribute('aPhase', new THREE.BufferAttribute(ePhase, 1))
  edgeGeo.setAttribute('aSpeed', new THREE.BufferAttribute(eSpeed, 1))
  edgeGeo.setAttribute('aActive', new THREE.BufferAttribute(eActive, 1))

  return { nodeGeo, edgeGeo, edgeCount: pairs.length }
}
