// Painting for the selected fire (§7, §10) on three canvases: fills under the homes (ignition heat,
// burn-probability bands, isochrone fills), lines over the homes (isochrones, the current perimeter,
// barriers, the ignition zone and points), and the wind arrow and label on top of everything.
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

/** Escarpments and plowed fields: a quiet grey line with short hachures on one side. */
function hatchedLine(ctx, pts, view) {
  ctx.beginPath()
  traceLine(ctx, pts, view)
  ctx.strokeStyle = 'rgba(12, 12, 13, 0.45)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = 'rgba(214, 216, 220, 0.55)'
  ctx.lineWidth = 1.25
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
    for (let d = carry; d < len; d += 10) {
      const x = x0 + ux * d
      const y = y0 + uy * d
      ctx.moveTo(x, y)
      ctx.lineTo(x - uy * 4, y + ux * 4)
    }
    carry = (carry + 10 - (len % 10)) % 10
  }
  ctx.lineWidth = 1
  ctx.stroke()
}

/** The fire's full extent in canvas pixels (last growing step, tail band), padded. */
function fireExtentPx(fire, view, padFrac = 0.25) {
  let i = fire.steps.length - 1
  while (i > 0 && fire.steps[i].held) i--
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const poly of fire.steps[i].p25) {
    for (const [lat, lng] of poly[0]) {
      const x = view.px(lng)
      const y = view.py(lat)
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  const px = Math.max(40, (x1 - x0) * padFrac)
  const py = Math.max(40, (y1 - y0) * padFrac)
  return [x0 - px, y0 - py, x1 - x0 + px * 2, y1 - y0 + py * 2]
}

function paintBarriers(ctx, fire, view, cur) {
  // Barriers only matter where the fire can reach them: clip to its padded extent. Inside the
  // current P50 they are already burned over, so they step back to a third of their strength.
  const extent = fireExtentPx(fire, view)
  ctx.save()
  ctx.beginPath()
  ctx.rect(...extent)
  ctx.clip()
  if (!cur) {
    drawBarriers(ctx, fire, view, 0.8)
  } else {
    ctx.save()
    ctx.beginPath()
    ctx.rect(...extent)
    tracePolys(ctx, cur.p50, view)
    ctx.clip('evenodd')
    drawBarriers(ctx, fire, view, 0.8)
    ctx.restore()
    ctx.save()
    ctx.beginPath()
    tracePolys(ctx, cur.p50, view)
    ctx.clip('evenodd')
    drawBarriers(ctx, fire, view, 0.3)
    ctx.restore()
  }
  ctx.restore()
}

function drawBarriers(ctx, fire, view, alpha) {
  const c = palette()
  ctx.globalAlpha = alpha
  for (const b of fire.barriers) {
    if (b.kind === 'island' || b.kind === 'patch') {
      // Unburnable patches read as holes in the fill: a faint tint and a thin outline.
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.closePath()
      if (b.kind === 'patch') {
        ctx.fillStyle = 'rgba(20, 17, 15, 0.38)'
        ctx.fill()
      }
      ctx.strokeStyle = b.kind === 'patch' ? 'rgba(226, 214, 198, 0.8)' : 'rgba(240, 236, 226, 0.6)'
      ctx.lineWidth = 1
      ctx.stroke()
    } else if (b.kind === 'escarpment' || b.kind === 'field') {
      hatchedLine(ctx, b.geometry, view)
    } else if (b.kind === 'highway') {
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.strokeStyle = 'rgba(12, 12, 13, 0.6)'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.strokeStyle = c.road
      ctx.lineWidth = 2
      ctx.setLineDash([8, 5])
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      ctx.beginPath()
      traceLine(ctx, b.geometry, view)
      ctx.strokeStyle = c.water
      ctx.globalAlpha = 0.6 * (alpha / 0.8)
      ctx.lineWidth = b.effect === 'partial' ? 1.4 : 1.5
      ctx.setLineDash(b.effect === 'partial' ? [9, 5] : [])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = alpha
    }
  }
  ctx.globalAlpha = 1
}

/**
 * Ignition-prior heat, clipped to the zone: hottest along lines, roads and ranch tracks.
 * Once the spread starts the heat steps back (strength < 1) so the perimeters read first.
 */
function paintHeat(ctx, fire, view, strength = 1) {
  if (strength <= 0) return
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
    g.addColorStop(0, alpha(hot, 0.16 + 0.38 * h.w))
    g.addColorStop(1, alpha(hot, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** The ignition zone's faint orange fill (under the homes). */
function paintZoneFill(ctx, fire, view) {
  const c = palette()
  ctx.beginPath()
  for (const ring of fire.ignitionZone.polygon) traceLine(ctx, ring, view)
  ctx.closePath()
  ctx.fillStyle = alpha(c.orange, 0.06)
  ctx.fill()
}

/** The ignition zone's orange boundary and the ignition points (over the homes). */
function paintZone(ctx, fire, view) {
  const c = palette()
  const zone = fire.ignitionZone
  ctx.beginPath()
  for (const ring of zone.polygon) traceLine(ctx, ring, view)
  ctx.closePath()
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
/**
 * Where the wind arrow goes: beside the fire (perpendicular to the wind, outside its bounding box)
 * on whichever side has room inside the free map area; otherwise just behind the head, inside.
 */
function windAnchor(view, box, dx, dy, len, free) {
  const [x0, y0, x1, y1] = box
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const px = -dy
  const py = dx
  const halfPerp = (Math.abs(px) * (x1 - x0)) / 2 + (Math.abs(py) * (y1 - y0)) / 2
  const off = halfPerp + 30
  const need = len / 2 + 70 // arrow plus the label pill beyond its tail
  if (free) {
    for (const sgn of [1, -1]) {
      const ax = cx + px * off * sgn
      const ay = cy + py * off * sgn
      if (ax - need >= free[0] && ax + need <= free[2] && ay - need >= free[1] && ay + need <= free[3]) return [ax, ay]
    }
  }
  const halfW = (x1 - x0) / 2
  const halfH = (y1 - y0) / 2
  const reach = Math.max(0, Math.min(Math.abs(dx) > 1e-6 ? halfW / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? halfH / Math.abs(dy) : Infinity) - len * 0.75)
  return [cx + dx * reach, cy + dy * reach]
}

function paintWind(ctx, fire, view, cur, free) {
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
  const [cx, cy] = windAnchor(view, [view.px(w), view.py(n), view.px(e), view.py(s)], dx, dy, len, free)
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
  // The label sits on a dark pill behind the arrow's tail, so lines under it never cross the text.
  ctx.font = '700 11.5px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = `${compass(wind.windFromDeg)} ${wind.windKmh} km/h`
  const pw = ctx.measureText(label).width + 16
  const ph = 20
  const lx = x0 - dx * (pw / 2 + 6)
  const ly = y0 - dy * (ph / 2 + 6)
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(lx - pw / 2, ly - ph / 2, pw, ph, 999)
  else ctx.rect(lx - pw / 2, ly - ph / 2, pw, ph)
  ctx.fillStyle = 'rgba(15, 15, 16, 0.86)'
  ctx.fill()
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(243, 241, 236, 0.22)'
  ctx.stroke()
  ctx.fillStyle = '#F3F1EC'
  ctx.fillText(label, lx, ly + 0.5)
  ctx.restore()
}

/** Ignition heat: full before the spread starts, stepping back once perimeters are drawn. */
const heatStrength = (step) => (step < 0 ? 1 : step === 0 ? 0.4 : 0)

/** Earlier growing steps before the current one. */
function earlierSteps(fire, step) {
  const drawn = []
  for (let i = 0; i < step; i++) if (!fire.steps[i].held) drawn.push(i)
  return drawn
}

/**
 * Under the homes. st: { fire, step (index, −1 = ignition), fade (0→1 for the newest perimeter), views }
 */
export function paintSpreadFills(ctx, view, st) {
  const { fire, step, views } = st
  if (!fire) return
  const c = palette()
  const cur = step >= 0 ? fire.steps[step] : null
  const fade = st.fade ?? 1
  paintHeat(ctx, fire, view, heatStrength(step))
  paintZoneFill(ctx, fire, view)
  if (cur && views.probability) {
    for (const band of ['p25', 'p50', 'p90']) fillPolys(ctx, cur[band], view, bandColor(band), 0.35)
  }
  if (cur && views.isochrones) {
    // Earlier steps fainter, the current one solid at 45% (§10). The earlier fills share one
    // alpha budget so a 19-step fire is no heavier than a 7-step one.
    const drawn = earlierSteps(fire, step)
    const each = drawn.length ? Math.min(0.07, 0.3 / drawn.length) : 0
    for (const i of drawn) fillPolys(ctx, fire.steps[i].p50, view, hourColor(fire.steps[i].hour), each)
    fillPolys(ctx, cur.p50, view, hourColor(cur.hour), 0.45 * fade)
  } else if (cur && !views.probability) {
    fillPolys(ctx, cur.p50, view, c.red, 0.3 * fade)
  }
}

/** Over the homes: isochrone contours, the current perimeter, the tail band, barriers and the zone. */
export function paintSpreadLines(ctx, view, st) {
  const { fire, step, views } = st
  if (!fire) return
  const c = palette()
  const cur = step >= 0 ? fire.steps[step] : null
  const fade = st.fade ?? 1
  if (views.barriers) paintBarriers(ctx, fire, view, cur)
  if (cur && views.isochrones) {
    // Earlier isochrones as contour lines on a dark halo, so 1 h → 48 h reads over the red fill.
    const drawn = earlierSteps(fire, step)
    drawn.forEach((i, k) => {
      const s = fire.steps[i]
      const t = (k + 1) / (drawn.length + 1)
      strokePolys(ctx, s.p50, view, 'rgba(12, 12, 13, 0.7)', 3.4, 0.7)
      strokePolys(ctx, s.p50, view, hourColor(s.hour), 1.8, 0.75 + 0.25 * t)
    })
    strokePolys(ctx, cur.p50, view, 'rgba(12, 12, 13, 0.55)', 4, 0.4 + 0.6 * fade)
    strokePolys(ctx, cur.p50, view, hourColor(cur.hour), 2.2, 0.4 + 0.6 * fade)
  } else if (cur) {
    strokePolys(ctx, cur.p50, view, 'rgba(12, 12, 13, 0.55)', 4, 0.4 + 0.6 * fade)
    strokePolys(ctx, cur.p50, view, c.red, 2.2, 0.4 + 0.6 * fade)
  }
  if (cur && views.probability) strokePolys(ctx, cur.p25, view, bandColor('p25'), 1.2, 0.9, [4, 4])
  paintZone(ctx, fire, view)
}

/** On top of everything: the wind arrow and its label. st.free: free map area in container px. */
export function paintSpreadTop(ctx, view, st) {
  const { fire, step, free } = st
  if (!fire) return
  const f = free ? [free[0] + view.pad.x, free[1] + view.pad.y, free[2] + view.pad.x, free[3] + view.pad.y] : null
  paintWind(ctx, fire, view, step >= 0 ? fire.steps[step] : null, f)
}
