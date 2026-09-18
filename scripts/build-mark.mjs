/**
 * Generates public/models/mark.glb: the site's brand mark (three nodes joined
 * in a triangle) as a real 3D asset, so the runtime can load it with useGLTF.
 * Run with `npm run build:assets`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

// GLTFExporter reads its binary output through FileReader, which Node lacks.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf
      this.onloadend?.()
    })
  }
}

const nodes = [
  new THREE.Vector3(-0.62, -0.36, 0),
  new THREE.Vector3(0, 0.68, 0),
  new THREE.Vector3(0.62, -0.36, 0),
]

const nodeMat = new THREE.MeshStandardMaterial({
  name: 'node',
  color: 0xfbf5e6,
  emissive: 0xe8d5a6,
  emissiveIntensity: 0.55,
  metalness: 0.25,
  roughness: 0.3,
})
const edgeMat = new THREE.MeshStandardMaterial({
  name: 'edge',
  color: 0xe8d5a6,
  emissive: 0xd9bf7d,
  emissiveIntensity: 0.35,
  metalness: 0.4,
  roughness: 0.35,
})

const scene = new THREE.Scene()
const mark = new THREE.Group()
mark.name = 'mark'
scene.add(mark)

const sphereGeo = new THREE.SphereGeometry(0.15, 32, 24)
nodes.forEach((p, i) => {
  const m = new THREE.Mesh(sphereGeo, nodeMat)
  m.name = `node-${i}`
  m.position.copy(p)
  mark.add(m)
})

const up = new THREE.Vector3(0, 1, 0)
for (let i = 0; i < nodes.length; i++) {
  const a = nodes[i]
  const b = nodes[(i + 1) % nodes.length]
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const geo = new THREE.CylinderGeometry(0.035, 0.035, len, 16, 1)
  const m = new THREE.Mesh(geo, edgeMat)
  m.name = `edge-${i}`
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(up, dir.normalize())
  mark.add(m)
}

new GLTFExporter().parse(
  scene,
  (result) => {
    mkdirSync('public/models', { recursive: true })
    writeFileSync('public/models/mark.glb', Buffer.from(result))
    console.log(`wrote public/models/mark.glb (${(result.byteLength / 1024).toFixed(1)} kB)`)
  },
  (err) => {
    console.error(err)
    process.exit(1)
  },
  { binary: true },
)
