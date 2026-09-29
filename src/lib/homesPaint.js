// Painting and hit-testing for the homes canvas (CLAUDE.md §2 rendering rule): below zoom 9 one
// cluster dot per area with its home count; zoom 9–13 small circles for the homes in view; zoom 14
// and above the rotated footprints. Everything is drawn in batches, one path per colour.
import { store } from './store.js'
import { MAP } from '../config/map.js'
import { alpha, palette } from '../styles/palette.js'

const TAU = Math.PI * 2

/** Homes areas grouped into screen-space clusters, largest first. */
export function clusterAreas(areas, view, mergePx = MAP.clusterMergePx) {
  const pts = areas.map((a) => ({ a, x: view.px(a.centroid[1]), y: view.py(a.centroid[0]) })).sort((p, q) => q.a.homes - p.a.homes)
  const clusters = []
  for (const p of pts) {
    let best = null
    let bestD = mergePx * mergePx
    for (const c of clusters) {
      const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    if (best) {
      const w = best.homes + p.a.homes
      best.x = (best.x * best.homes + p.x * p.a.homes) / w
      best.y = (best.y * best.homes + p.y * p.a.homes) / w
      best.homes = w
      best.tiv += p.a.tiv
      best.areas.push(p.a)
    } else {
      clusters.push({ x: p.x, y: p.y, homes: p.a.homes, tiv: p.a.tiv, areas: [p.a] })
    }
  }
  for (const c of clusters) c.r = clusterRadius(c.homes)
  return clusters
}

export const clusterRadius = (homes) => 11.5 + 3.6 * Math.log10(Math.max(1, homes / 400))

export function countLabel(n) {
  if (n >= 10000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

/** Visit every home whose centroid sits in the index cells covering `bounds`. */
export function eachHomeIn(bounds, visit) {
  const cell = store.indexCellDeg
  const s = Math.floor(bounds.getSouth() / cell)
  const n = Math.floor(bounds.getNorth() / cell)
  const w = Math.floor(bounds.getWest() / cell)
  const e = Math.floor(bounds.getEast() / cell)
  for (let i = s; i <= n; i++) {
    for (let j = w; j <= e; j++) {
      const list = store.homeIndex.get(`${i},${j}`)
      if (list) for (const h of list) visit(h)
    }
  }
}

function inView(ring, bounds) {
  let s = 90
  let n = -90
  let w = 180
  let e = -180
  for (const [lat, lng] of ring) {
    if (lat < s) s = lat
    if (lat > n) n = lat
    if (lng < w) w = lng
    if (lng > e) e = lng
  }
  return !(n < bounds.getSouth() || s > bounds.getNorth() || e < bounds.getWest() || w > bounds.getEast())
}

function tracePolygon(ctx, ring, view) {
  ring.forEach(([lat, lng], i) => {
    const x = view.px(lng)
    const y = view.py(lat)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
}

const MIN_FOOTPRINT_PX = 4.5

/** A footprint, scaled about its centre when it would draw smaller than a few pixels (zoom 14). */
function traceFootprint(ctx, h, view) {
  const cx = view.px(h.centroid[1])
  const cy = view.py(h.centroid[0])
  const f = h.footprint
  const xs = [view.px(f[0][1]), view.px(f[1][1]), view.px(f[2][1]), view.px(f[3][1])]
  const ys = [view.py(f[0][0]), view.py(f[1][0]), view.py(f[2][0]), view.py(f[3][0])]
  const side = Math.min(Math.hypot(xs[1] - xs[0], ys[1] - ys[0]), Math.hypot(xs[2] - xs[1], ys[2] - ys[1]))
  const k = side < MIN_FOOTPRINT_PX ? MIN_FOOTPRINT_PX / Math.max(side, 0.5) : 1
  ctx.moveTo(cx + (xs[0] - cx) * k, cy + (ys[0] - cy) * k)
  for (let i = 1; i < 4; i++) ctx.lineTo(cx + (xs[i] - cx) * k, cy + (ys[i] - cy) * k)
  ctx.closePath()
}

function paintClusters(ctx, view, st) {
  const c = palette()
  const clusters = clusterAreas(st.areas, view)
  st.clusters = clusters
  ctx.font = '700 11px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const k of clusters) {
    // Soft halo, solid yellow disc with a dark rim, count in ink.
    const g = ctx.createRadialGradient(k.x, k.y, k.r * 0.6, k.x, k.y, k.r * 2.1)
    g.addColorStop(0, alpha(c.yellow, 0.34))
    g.addColorStop(1, alpha(c.yellow, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(k.x, k.y, k.r * 2.1, 0, TAU)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(k.x, k.y, k.r, 0, TAU)
    ctx.fillStyle = c.yellow
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(15, 15, 16, 0.85)'
    ctx.stroke()
    ctx.fillStyle = '#16140C'
    ctx.fillText(countLabel(k.homes), k.x, k.y + 0.5)
    // Homes the open fire has reached: a red arc for their share of the cluster.
    let burnt = 0
    if (st.engulfed?.size) for (const a of k.areas) burnt += st.engulfed.get(a.id) || 0
    if (burnt > 0) {
      const share = Math.max(0.08, Math.min(1, burnt / k.homes))
      ctx.beginPath()
      ctx.arc(k.x, k.y, k.r + 3.5, -Math.PI / 2, -Math.PI / 2 + share * TAU)
      ctx.strokeStyle = c.red
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.lineCap = 'butt'
    }
  }
}

function paintAreas(ctx, view, st) {
  const c = palette()
  ctx.beginPath()
  for (const a of st.areas) if (inView(a.polygon, view.bounds)) tracePolygon(ctx, a.polygon, view)
  ctx.fillStyle = alpha(c.yellow, view.zoom >= MAP.footprintMinZoom ? 0.03 : 0.07)
  ctx.fill()
  ctx.lineWidth = 1.2
  ctx.setLineDash([5, 4])
  ctx.strokeStyle = alpha(c.yellow, 0.7)
  ctx.stroke()
  ctx.setLineDash([])
}

function paintAreaLabels(ctx, view, st) {
  if (view.zoom < MAP.areaLabelMinZoom) return
  ctx.font = '600 11.5px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.lineJoin = 'round'
  for (const a of st.areas) {
    if (!inView(a.polygon, view.bounds)) continue
    let top = a.polygon[0]
    for (const p of a.polygon) if (p[0] > top[0]) top = p
    const x = view.px(a.centroid[1])
    const y = view.py(top[0]) - 6
    ctx.lineWidth = 3.5
    ctx.strokeStyle = 'rgba(12, 12, 13, 0.85)'
    ctx.strokeText(a.name, x, y)
    ctx.fillStyle = '#F7E7A6'
    ctx.fillText(a.name, x, y)
  }
}

/** Colour keys per home: fill (covered / engulfed) and an optional ring (protected / warned). */
function homeColors(c) {
  return {
    covered: c.yellow,
    engulfed: c.red,
    protected: c.green,
    warned: c.amber,
  }
}

function paintHomeDots(ctx, view, st) {
  const colors = homeColors(palette())
  // Small enough that a subdivision reads as a stipple of homes rather than a painted block.
  const r = view.zoom >= 13 ? 2.2 : 2
  const fills = new Map()
  const rings = new Map()
  let drawn = 0
  eachHomeIn(view.bounds, (h) => {
    const s = st.styleOf(h)
    if (!s) return
    const x = view.px(h.centroid[1])
    const y = view.py(h.centroid[0])
    let list = fills.get(s.fill)
    if (!list) fills.set(s.fill, (list = []))
    list.push(x, y)
    if (s.ring) {
      let rl = rings.get(s.ring)
      if (!rl) rings.set(s.ring, (rl = []))
      rl.push(x, y)
    }
    drawn++
  })
  for (const [key, pts] of fills) {
    ctx.beginPath()
    for (let i = 0; i < pts.length; i += 2) {
      ctx.moveTo(pts[i] + r, pts[i + 1])
      ctx.arc(pts[i], pts[i + 1], r, 0, TAU)
    }
    ctx.fillStyle = colors[key]
    ctx.globalAlpha = key === 'covered' ? 0.92 : 1
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.lineWidth = 1.6
  for (const [key, pts] of rings) {
    ctx.beginPath()
    for (let i = 0; i < pts.length; i += 2) {
      ctx.moveTo(pts[i] + r + 2.2, pts[i + 1])
      ctx.arc(pts[i], pts[i + 1], r + 2.2, 0, TAU)
    }
    ctx.strokeStyle = colors[key]
    ctx.stroke()
  }
  return drawn
}

function paintFootprints(ctx, view, st) {
  const colors = homeColors(palette())
  const fills = new Map()
  const rings = new Map()
  let drawn = 0
  // Footprints: homes in view only (§2), not the padded margin the dots use.
  eachHomeIn(view.viewport, (h) => {
    const s = st.styleOf(h)
    if (!s) return
    let list = fills.get(s.fill)
    if (!list) fills.set(s.fill, (list = []))
    list.push(h)
    if (s.ring) {
      let rl = rings.get(s.ring)
      if (!rl) rings.set(s.ring, (rl = []))
      rl.push(h)
    }
    drawn++
  })
  // At 14–15 a footprint is only a few pixels: an outline would swallow it, so fill alone.
  const outline = view.zoom >= 16 ? 1 : view.zoom >= 15 ? 0.6 : 0
  for (const [key, homes] of fills) {
    ctx.beginPath()
    for (const h of homes) traceFootprint(ctx, h, view)
    ctx.fillStyle = colors[key]
    ctx.fill()
    if (outline) {
      ctx.lineWidth = outline
      ctx.strokeStyle = 'rgba(12, 12, 13, 0.75)'
      ctx.stroke()
    }
  }
  ctx.lineWidth = 2.4
  for (const [key, homes] of rings) {
    ctx.beginPath()
    for (const h of homes) traceFootprint(ctx, h, view)
    ctx.strokeStyle = colors[key]
    ctx.stroke()
  }
  return drawn
}

/**
 * Paint the homes canvas (zoom 9 and above): area outlines, then dots or footprints, then labels.
 * `st` carries showHomes, areas (homes areas in the book) and styleOf(home) → { fill, ring } | null.
 * Records the mode for hit tests in `st.mode`.
 */
export function paintHomes(ctx, view, st) {
  st.mode = 'none'
  if (!st.showHomes || !st.areas.length || view.zoom < MAP.dotsMinZoom) return
  paintAreas(ctx, view, st)
  if (view.zoom < MAP.footprintMinZoom) {
    st.mode = 'dots'
    paintHomeDots(ctx, view, st)
  } else {
    st.mode = 'footprints'
    paintFootprints(ctx, view, st)
  }
  paintAreaLabels(ctx, view, st)
}

/** Paint the cluster canvas (below zoom 9): one dot per area, merged where they overlap. */
export function paintClusterDots(ctx, view, st) {
  st.clusters = []
  if (!st.showHomes || !st.areas.length || view.zoom >= MAP.dotsMinZoom) return
  st.clusterView = view
  paintClusters(ctx, view, st)
}

/** The cluster under a container point, if any. */
export function clusterAt(st, cp) {
  const view = st.clusterView
  if (!st.clusters?.length || !view) return null
  for (const k of st.clusters) {
    const [x, y] = view.toContainer(k.x, k.y)
    if ((x - cp.x) ** 2 + (y - cp.y) ** 2 <= (k.r + 3) ** 2) return k
  }
  return null
}

/** The nearest drawn home within `px` pixels of a container point, or null. */
export function homeAt(st, map, cp, px = 8) {
  if (st.mode !== 'dots' && st.mode !== 'footprints') return null
  const zoom = map.getZoom()
  const ll = map.containerPointToLatLng(cp)
  const deg = (px / (256 * 2 ** zoom)) * 360 * 1.5
  const bounds = { getSouth: () => ll.lat - deg, getNorth: () => ll.lat + deg, getWest: () => ll.lng - deg, getEast: () => ll.lng + deg }
  let best = null
  let bestD = px * px
  eachHomeIn(bounds, (h) => {
    if (!st.styleOf(h)) return
    const p = map.latLngToContainerPoint(h.centroid)
    const d = (p.x - cp.x) ** 2 + (p.y - cp.y) ** 2
    if (d <= bestD) {
      bestD = d
      best = h
    }
  })
  return best
}
