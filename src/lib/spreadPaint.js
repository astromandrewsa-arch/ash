// Painting for the selected fire (§7, §10): burn-probability bands, isochrones, the current
// perimeter, barriers, the ignition zone with its ignition-prior heat, and the ignition points.
import { alpha, palette } from '../styles/palette.js'
import { bandColor, hourColor } from './severity.js'
import { compass, windAt } from './recipe.js'

const TAU = Math.PI * 2

function tracePolys(ctx, polys, view) {
  for (const poly of polys) {
    for (const ring of poly) {
      ring.forEach(([lat, lng], i) => (i ? ctx.lineTo(view.px(lng), view.py(lat)) : ctx.moveTo(view.px(lng), view.py(lat))))
      ctx.closePath()
    }
  }
}

function fillPolys(ctx, polys, view, color, a) {
  if (a <= 0) return
  ctx.beginPath()
  tracePolys(ctx, polys, view)
  ctx.fillStyle = color
  ctx.globalAlpha = a
  ctx.fill('evenodd')
  ctx.globalAlpha = 1
}

function strokePolys(ctx, polys, view, color, width, a = 1, dash = null) {
  ctx.beginPath()
  tracePolys(ctx, polys, view)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.globalAlpha = a
  ctx.setLineDash(dash || [])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1
}

function traceLine(ctx, pts, view) {
  pts.forEach(([lat, lng], i) => (i ? ctx.lineTo(view.px(lng), view.py(lat)) : ctx.moveTo(view.px(lng), view.py(lat))))
}

/** Escarpments and plowed fields: a grey line with hachures on one side. */
function hatchedLine(ctx, pts, view) {
  ctx.beginPath()
  traceLine(ctx, pts, view)
  ctx.strokeStyle = 'rgba(214, 216, 220, 0.95)'
  ctx.lineWidth = 2.2
  ctx.stroke()
  ctx.beginPath()
  let carry = 0
  for (let i = 1; i < pts.length; i++) {
    const x0 = view.px(pts[i - 1][1])
    const y0 = view.py(pts[i - 1][0])
    const x1 = view.px(pts[i][1])
    const y1 = view.py(pts[i][0])
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (!len) continue
    const ux = (x1 - x0) / len
    const uy = (y1 - y0) / len
    for (let d = carry; d < len; d += 7) {
      const x = x0 + ux * d
      const y = y0 + uy * d
      ctx.moveTo(x, y)
      ctx.lineTo(x - uy * 6, y + ux * 6)
    }
    carry = (carry + 7 - (len % 7)) % 7
  }
  ctx.lineWidth = 1.3
  ctx.stroke()
}

function paintBarriers(ctx, fire, view) {
  const c = palette()
  for (const b of fire.barriers) {
    if (b.kind === 'island' || b.kind === 'patch') {
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.closePath()
      ctx.fillStyle = b.kind === 'patch' ? 'rgba(38, 30, 26, 0.72)' : 'rgba(226, 222, 210, 0.55)'
      ctx.fill()
      ctx.strokeStyle = b.kind === 'patch' ? 'rgba(140, 120, 104, 0.9)' : 'rgba(240, 236, 226, 0.9)'
      ctx.lineWidth = 1.2
      ctx.stroke()
    } else if (b.kind === 'escarpment' || b.kind === 'field') {
      hatchedLine(ctx, b.geometry, view)
    } else if (b.kind === 'highway') {
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.strokeStyle = 'rgba(12, 12, 13, 0.7)'
      ctx.lineWidth = 4.5
      ctx.stroke()
      ctx.strokeStyle = c.road
      ctx.lineWidth = 2.2
      ctx.setLineDash([8, 5])
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.strokeStyle = c.water
      ctx.globalAlpha = 0.85
      ctx.lineWidth = b.effect === 'partial' ? 1.5 : 1.7
      ctx.setLineDash(b.effect === 'partial' ? [9, 5] : [])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }
  }
}

/**
 * Ignition-prior heat, clipped to the zone: hottest along lines, roads and ranch tracks.
 * Once the spread starts the heat steps back (strength < 1) so the perimeters read first.
 */
function paintHeat(ctx, fire, view, strength = 1) {
  const zone = fire.ignitionZone
  ctx.save()
  ctx.globalAlpha = strength
  ctx.beginPath()
  for (const ring of zone.polygon) traceLine(ctx, ring, view)
  ctx.closePath()
  ctx.clip()
  const mPerPx = (40075016 * Math.cos((zone.polygon[0][0][0] * Math.PI) / 180)) / (256 * 2 ** view.zoom)
  const r = Math.max(9, Math.min(60, 420 / mPerPx))
  for (const h of zone.heat) {
    const x = view.px(h.lng)
    const y = view.py(h.lat)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const hot = h.w > 0.66 ? '#D7263D' : h.w > 0.4 ? '#E2561B' : '#F5A623'
    g.addColorStop(0, alpha(hot, 0.2 + 0.45 * h.w))
    g.addColorStop(1, alpha(hot, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** The ignition zone's orange boundary and the ignition points. */
function paintZone(ctx, fire, view) {
  const c = palette()
  const zone = fire.ignitionZone
  ctx.beginPath()
  for (const ring of zone.polygon) traceLine(ctx, ring, view)
  ctx.closePath()
  ctx.fillStyle = alpha(c.orange, 0.06)
  ctx.fill()
  ctx.strokeStyle = 'rgba(12, 12, 13, 0.55)'
  ctx.lineWidth = 4.5
  ctx.stroke()
  ctx.strokeStyle = c.orange
  ctx.lineWidth = 2.2
  ctx.setLineDash([7, 5])
  ctx.stroke()
  ctx.setLineDash([])
  for (const ig of zone.ignitions || []) {
    const x = view.px(ig.pos[1])
    const y = view.py(ig.pos[0])
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, TAU)
    ctx.fillStyle = '#FFE8B0'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#1C1C1C'
    ctx.stroke()
  }
}

/** A large translucent arrow showing where the wind is driving the fire at this step. */
function paintWind(ctx, fire, view, cur) {
  const wind = windAt(fire, cur ? cur.hour : 0)
  let s = 90
  let n = -90
  let w = 180
  let e = -180
  const rings = cur ? cur.p50.map((p) => p[0]) : fire.ignitionZone.polygon
  for (const ring of rings) {
    for (const [lat, lng] of ring) {
      if (lat < s) s = lat
      if (lat > n) n = lat
      if (lng < w) w = lng
      if (lng > e) e = lng
    }
  }
  const to = ((wind.windFromDeg + 180) * Math.PI) / 180
  const dx = Math.sin(to)
  const dy = -Math.cos(to)
  const len = 64
  // Sit the arrow just behind the head of the fire, clear of the marker at the ignition zone.
  const halfW = (view.px(e) - view.px(w)) / 2
  const halfH = (view.py(s) - view.py(n)) / 2
  const reach = Math.max(0, Math.min(Math.abs(dx) > 1e-6 ? halfW / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? halfH / Math.abs(dy) : Infinity) - len * 0.75)
  const cx = view.px((w + e) / 2) + dx * reach
  const cy = view.py((s + n) / 2) + dy * reach
  const x0 = cx - dx * len * 0.5
  const y0 = cy - dy * len * 0.5
  const x1 = cx + dx * len * 0.5
  const y1 = cy + dy * len * 0.5
  const head = (ang) => [x1 - 16 * Math.sin(to + ang), y1 + 16 * Math.cos(to + ang)]
  const [hx1, hy1] = head(0.5)
  const [hx2, hy2] = head(-0.5)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const [color, width] of [['rgba(12, 12, 13, 0.55)', 9], ['rgba(243, 241, 236, 0.9)', 4]]) {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.moveTo(hx1, hy1)
    ctx.lineTo(x1, y1)
    ctx.lineTo(hx2, hy2)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.stroke()
  }
  ctx.font = '700 11.5px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = `${compass(wind.windFromDeg)} ${wind.windKmh} km/h`
  const lx = x0 - dx * 16
  const ly = y0 - dy * 16
  ctx.lineWidth = 3.5
  ctx.strokeStyle = 'rgba(12, 12, 13, 0.85)'
  ctx.strokeText(label, lx, ly)
  ctx.fillStyle = '#F3F1EC'
  ctx.fillText(label, lx, ly)
  ctx.restore()
}

/**
 * st: { fire, step (index, −1 = ignition), fade (0→1 for the newest perimeter), views }
 */
export function paintSpread(ctx, view, st) {
  const { fire, step, views } = st
  if (!fire) return
  const c = palette()
  const cur = step >= 0 ? fire.steps[step] : null
  const fade = st.fade ?? 1
  paintHeat(ctx, fire, view, cur ? 0.3 : 1)
  if (cur && views.probability) {
    for (const band of ['p25', 'p50', 'p90']) fillPolys(ctx, cur[band], view, bandColor(band), 0.35)
  }
  if (cur && views.isochrones) {
    // Earlier steps fainter, the current one solid at 45% (§10). The earlier fills share one
    // alpha budget so a 19-step fire is no heavier than a 7-step one; strokes ramp 1.2 → 1.7 px.
    const drawn = []
    for (let i = 0; i < step; i++) if (!fire.steps[i].held) drawn.push(i)
    const each = drawn.length ? Math.min(0.07, 0.3 / drawn.length) : 0
    for (const i of drawn) fillPolys(ctx, fire.steps[i].p50, view, hourColor(fire.steps[i].hour), each)
    fillPolys(ctx, cur.p50, view, hourColor(cur.hour), 0.45 * fade)
    // Earlier isochrones are stroked over the current fill so they read as contour lines.
    drawn.forEach((i, k) => {
      const s = fire.steps[i]
      const t = (k + 1) / (drawn.length + 1)
      strokePolys(ctx, s.p50, view, 'rgba(12, 12, 13, 0.5)', 2.6 + 0.5 * t, 0.3 + 0.25 * t)
      strokePolys(ctx, s.p50, view, hourColor(s.hour), 1.2 + 0.5 * t, 0.6 + 0.35 * t)
    })
    strokePolys(ctx, cur.p50, view, 'rgba(12, 12, 13, 0.55)', 4, 0.4 + 0.6 * fade)
    strokePolys(ctx, cur.p50, view, hourColor(cur.hour), 2.2, 0.4 + 0.6 * fade)
  } else if (cur) {
    fillPolys(ctx, cur.p50, view, c.red, (views.probability ? 0 : 0.3) * fade)
    strokePolys(ctx, cur.p50, view, c.red, 2.2, 0.4 + 0.6 * fade)
  }
  if (cur && views.probability) {
    strokePolys(ctx, cur.p25, view, bandColor('p25'), 1.2, 0.9, [4, 4])
  }
  if (views.barriers) paintBarriers(ctx, fire, view)
  paintZone(ctx, fire, view)
  paintWind(ctx, fire, view, cur)
}
