// Offscreen map snapshots for the PDF report (CLAUDE.md §17): the same Esri imagery the map uses,
// composited tile by tile on a canvas (the service sends CORS headers), with the fire's P25/P50/P90
// perimeters and the homes in its path drawn on top. If a tile cannot be read back, the snapshot
// falls back to the perimeters on a plain dark background.
import { MAP } from '../../config/map.js'

const TILE = 256
const RAD = Math.PI / 180

const worldX = (lng, z) => ((lng + 180) / 360) * TILE * 2 ** z
function worldY(lat, z) {
  const s = Math.sin(lat * RAD)
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z
}

function loadTile(url, timeoutMs) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const t = setTimeout(() => resolve(null), timeoutMs)
    img.onload = () => {
      clearTimeout(t)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(t)
      resolve(null)
    }
    img.src = url
  })
}

/** The zoom (in quarter steps) at which `bounds` fits a width × height canvas with a margin. */
export function fitZoom([[s, w], [n, e]], width, height, margin = 24) {
  for (let z = 15; z >= 4; z -= 0.25) {
    const dx = worldX(e, z) - worldX(w, z)
    const dy = worldY(s, z) - worldY(n, z)
    if (dx <= width - margin * 2 && dy <= height - margin * 2) return z
  }
  return 4
}

/**
 * Render one snapshot. `layers(ctx, project)` draws the overlay; `project([lat, lng])` gives canvas
 * pixels. Returns { dataUrl, imagery } where imagery is false when the fallback background was used.
 */
export async function renderSnapshot({ bounds, width, height, scale = 2, layers, timeoutMs = 7000 }) {
  const zf = fitZoom(bounds, width, height)
  const z = Math.floor(zf)
  const k = 2 ** (zf - z) // draw tiles of zoom z scaled up to the fractional zoom
  const [[s, w], [n, e]] = bounds
  const cx = (worldX(w, zf) + worldX(e, zf)) / 2
  const cy = (worldY(s, zf) + worldY(n, zf)) / 2
  const x0 = cx - width / 2
  const y0 = cy - height / 2
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.fillStyle = '#1C1C1C'
  ctx.fillRect(0, 0, width, height)

  // Tiles at integer zoom z cover the view; each is drawn at TILE × k pixels.
  const size = TILE * k
  const tx0 = Math.floor(x0 / size)
  const ty0 = Math.floor(y0 / size)
  const tx1 = Math.floor((x0 + width) / size)
  const ty1 = Math.floor((y0 + height) / size)
  const jobs = []
  for (let tx = tx0; tx <= tx1; tx++) {
    for (let ty = ty0; ty <= ty1; ty++) {
      const url = MAP.imageryUrl.replace('{z}', z).replace('{x}', tx).replace('{y}', ty)
      jobs.push(loadTile(url, timeoutMs).then((img) => ({ img, tx, ty })))
    }
  }
  const tiles = await Promise.all(jobs)
  let imagery = tiles.every((t) => t.img)
  if (imagery) {
    for (const t of tiles) ctx.drawImage(t.img, t.tx * size - x0, t.ty * size - y0, size, size)
    // Read-back test: a tainted canvas throws here and the snapshot falls back to the dark ground.
    try {
      ctx.getImageData(0, 0, 1, 1)
    } catch {
      imagery = false
      ctx.fillStyle = '#1C1C1C'
      ctx.fillRect(0, 0, width, height)
    }
  }
  if (imagery) {
    ctx.fillStyle = 'rgba(12, 12, 13, 0.28)'
    ctx.fillRect(0, 0, width, height)
  }
  const project = ([lat, lng]) => [worldX(lng, zf) - x0, worldY(lat, zf) - y0]
  layers(ctx, project)
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.88), imagery }
}
