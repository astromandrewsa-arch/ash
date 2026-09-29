// Huygens vertex-expansion spread generator (CLAUDE.md §7).
//
// Works in a local metre frame (x east, y north). The fire is a set of polygons whose outer rings
// are resampled (never fewer than 72 vertices) and pushed outward every sub-step. Each vertex moves
// along its outward normal at the normal speed of the elliptical Huygens wavelet for its bearing
// relative to the wind: head rate R, back rate R·b with b = 1/HB, and a half-width that gives the
// stated length-to-breadth ratio LB, where HB = (LB + √(LB²−1)) / (LB − √(LB²−1)).
// The grown ring is unioned with the previous area, so concave pockets and crossings stay valid.
//
// Modifiers: night slowdown (×0.3, 21:00–07:00 local), fingers (normals within ±10° of a finger
// bearing ×1.6), slope sectors, spotting (satellite ignitions downwind that grow and merge),
// barriers (hard, or crossed only after a delay: highways are 70% effective = 2 h), islands
// (never burn), wind-shift events that freeze the old polygon and restart expansion from the newly
// exposed flank, and a hold hour after which crews stop the spread.

import ClipperLib from 'clipper-lib'

const RAD = Math.PI / 180
const SCALE = 10 // Clipper works on integers: decimetres
const { Clipper, ClipType, PolyType, PolyFillType, PolyTree, ClipperOffset, JoinType, EndType } = ClipperLib

// ---------------------------------------------------------------------------
// Polygon helpers (metre frame). A polygon is [outer, ...holes]; rings are open [x, y] arrays.
// Boolean operations go through Clipper, which stays robust on the self-crossing rings that
// vertex expansion produces at concave corners.
// ---------------------------------------------------------------------------

function signedArea(ring) {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1])
  return -a / 2
}

const ccw = (ring) => (signedArea(ring) >= 0 ? ring : [...ring].reverse())

const toPath = (ring) => ring.map(([x, y]) => ({ X: Math.round(x * SCALE), Y: Math.round(y * SCALE) }))
const fromPath = (path) => path.map((p) => [p.X / SCALE, p.Y / SCALE])
const toPaths = (polys) => polys.flat().map(toPath)

function execute(type, a, b) {
  const c = new Clipper()
  c.AddPaths(toPaths(a), PolyType.ptSubject, true)
  if (b && b.length) c.AddPaths(toPaths(b), PolyType.ptClip, true)
  const tree = new PolyTree()
  c.Execute(type, tree, PolyFillType.pftNonZero, PolyFillType.pftNonZero)
  return ClipperLib.JS.PolyTreeToExPolygons(tree)
    .map((ex) => [fromPath(ex.outer), ...ex.holes.map(fromPath)])
    .filter((poly) => poly[0].length >= 3 && Math.abs(signedArea(poly[0])) > 4)
}

export const unionPolys = (a, b) => (!a.length ? execute(ClipType.ctUnion, b) : !b.length ? execute(ClipType.ctUnion, a) : execute(ClipType.ctUnion, a, b))
export const differencePolys = (a, b) => (!a.length || !b || !b.length ? a : execute(ClipType.ctDifference, a, b))
export const intersectPolys = (a, b) => (!a.length || !b || !b.length ? [] : execute(ClipType.ctIntersection, a, b))

export function polysAreaM2(polys) {
  let a = 0
  for (const poly of polys) {
    a += Math.abs(signedArea(poly[0]))
    for (let i = 1; i < poly.length; i++) a -= Math.abs(signedArea(poly[i]))
  }
  return a
}

/** Buffer an open polyline (metre frame) by `halfWidth` metres with round ends. */
export function bufferLineXY(pts, halfWidth) {
  const co = new ClipperOffset(2, 0.25 * SCALE)
  co.AddPath(toPath(pts), JoinType.jtRound, EndType.etOpenRound)
  const out = new ClipperLib.Paths()
  co.Execute(out, halfWidth * SCALE)
  return unionPolys(out.map((p) => [ccw(fromPath(p))]), [])
}

/** Grow or shrink polygons by `m` metres. */
export function offsetPolys(polys, m) {
  const co = new ClipperOffset(2, 0.25 * SCALE)
  co.AddPaths(toPaths(polys), JoinType.jtRound, EndType.etClosedPolygon)
  const out = new ClipperLib.Paths()
  co.Execute(out, m * SCALE)
  return unionPolys(out.map((p) => [ccw(fromPath(p))]), [])
}

function bboxOfPolys(polys) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const poly of polys) {
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  return { minX, minY, maxX, maxY }
}

const bboxesTouch = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minY <= b.maxY && b.minY <= a.maxY

function ringPerimeter(ring) {
  let p = 0
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    p += Math.hypot(b[0] - a[0], b[1] - a[1])
  }
  return p
}

function resampleRing(ring, n) {
  const per = ringPerimeter(ring)
  const step = per / n
  const out = []
  let idx = 0
  let acc = 0
  let a = ring[0]
  let b = ring[1 % ring.length]
  let seg = Math.hypot(b[0] - a[0], b[1] - a[1])
  for (let k = 0; k < n; k++) {
    const target = k * step
    while (acc + seg < target && idx < ring.length) {
      acc += seg
      idx++
      a = ring[idx % ring.length]
      b = ring[(idx + 1) % ring.length]
      seg = Math.hypot(b[0] - a[0], b[1] - a[1])
    }
    const t = seg > 0 ? (target - acc) / seg : 0
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
  }
  return out
}

export function pointInPolys([x, y], polys) {
  for (const poly of polys) {
    if (!pointInRingXY(x, y, poly[0])) continue
    let inHole = false
    for (let h = 1; h < poly.length; h++) if (pointInRingXY(x, y, poly[h])) inHole = true
    if (!inHole) return true
  }
  return false
}

function pointInRingXY(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function circleXY([cx, cy], r, n = 72) {
  const ring = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    ring.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r])
  }
  return ring
}

/** A thin strip polygon along a polyline (metre frame), `w` metres wide. */
export function stripXY(pts, w) {
  if (pts.length < 2) return circleXY(pts[0], w, 12)
  const left = []
  const right = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const tx = b[0] - a[0]
    const ty = b[1] - a[1]
    const L = Math.hypot(tx, ty) || 1
    const nx = ty / L
    const ny = -tx / L
    left.push([pts[i][0] + nx * w / 2, pts[i][1] + ny * w / 2])
    right.push([pts[i][0] - nx * w / 2, pts[i][1] - ny * w / 2])
  }
  return ccw([...left, ...right.reverse()])
}

// ---------------------------------------------------------------------------
// Ellipse wavelet
// ---------------------------------------------------------------------------

/** HB from LB (Anderson 1983 form quoted in CLAUDE.md §7). */
export function headToBack(lb) {
  const L = Math.max(1.0001, lb)
  const r = Math.sqrt(L * L - 1)
  return (L + r) / (L - r)
}

/**
 * Velocity (m/h) of the front point whose outward unit normal is `n`, for an elliptical wavelet
 * with head rate R toward unit heading `d` (Richards 1990): the wavelet point with that normal.
 * Its component along `n` is the wavelet's support function; the tangential part keeps the head
 * coherent, so the burned shape keeps the stated length-to-breadth ratio.
 */
function waveletVelocity(n, d, R, lb, flankScale) {
  const b = 1 / headToBack(lb)
  const a = (R * (1 + b)) / 2
  const e = (R * (1 - b)) / 2
  const c = (a / lb) * flankScale
  const p = [d[1], -d[0]] // perpendicular to the heading
  const nd = n[0] * d[0] + n[1] * d[1]
  const np = n[0] * p[0] + n[1] * p[1]
  const denom = Math.sqrt(a * a * nd * nd + c * c * np * np) || 1
  const along = e + (a * a * nd) / denom
  const across = (c * c * np) / denom
  return [d[0] * along + p[0] * across, d[1] * along + p[1] * across]
}

const bearingOf = ([x, y]) => ((Math.atan2(x, y) / RAD) + 360) % 360
const diff = (a, b) => {
  const d = Math.abs(((a - b) % 360 + 360) % 360)
  return d > 180 ? 360 - d : d
}
const inSector = (brg, from, to) => (from <= to ? brg >= from && brg <= to : brg >= from || brg <= to)

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

/**
 * @param {object} cfg
 *  - ignitions: [{ hour, ring }]   rings in metres (open)
 *  - segments: [{ fromHour, windFromDeg, headKmh, lb }]
 *  - startLocalHour: local clock hour at t = 0
 *  - rateScale, flankScale, lbScale: band and calibration multipliers
 *  - night: { from: 21, to: 7, factor: 0.3 } | null
 *  - dayFactors: per-day multipliers (index 0 = ignition day), optional
 *  - fingers: [{ bearing, halfWidth, factor, slope }]
 *  - slopes: [{ from, to, factor }]
 *  - spotting: { everyHours, minM, maxM, fromHour } | null
 *  - barriers: [{ id, polys (metre polygons), delayHours (null = hard) }]
 *  - islands: metre polygons that never burn
 *  - shifts: [{ hour, freeze, faceDeg, flankFraction: [f0, f1] }]
 *  - holdHour: spread stops after this hour
 *  - endHour: last hour to report
 *  - maxVertices: resampling cap per ring
 *  - rng: seeded stream for spotting jitter
 * @returns {{ hourly: Map<number, polys>, events: object[] }}
 */
export function simulate(cfg) {
  const {
    ignitions,
    segments,
    startLocalHour = 13,
    rateScale = 1,
    flankScale = 1,
    lbScale = 1,
    night = { from: 21, to: 7, factor: 0.3 },
    dayFactors = null,
    fingers = [],
    slopes = [],
    spotting = null,
    barriers = [],
    islands = [],
    shifts = [],
    holdHour = Infinity,
    endHour,
    maxVertices = 420,
    minSpacingM = 12,
    rng,
  } = cfg

  const islandPolys = islands.length ? unionPolys(islands, []) : []
  const barrierState = barriers.map((b) => ({ ...b, bbox: bboxOfPolys(b.polys), contactAt: null, open: false }))
  const shiftQueue = [...shifts].sort((a, b) => a.hour - b.hour)

  let active = []
  let frozen = []
  const pending = [...ignitions].sort((a, b) => a.hour - b.hour)
  const seeds = []
  const hourly = new Map()
  const log = []
  let nextSpot = spotting ? spotting.fromHour ?? spotting.everyHours : Infinity
  let t = 0

  const segmentAt = (hour) => {
    let s = segments[0]
    for (const seg of segments) if (hour >= seg.fromHour) s = seg
    return s
  }
  const clockFactor = (hour) => {
    let k = 1
    const local = (((startLocalHour + hour) % 24) + 24) % 24
    if (night && (local >= night.from || local < night.to)) k *= night.factor
    if (dayFactors) {
      const day = Math.floor((startLocalHour + hour - 7) / 24) // a burning day runs 07:00–07:00
      k *= dayFactors[Math.max(0, Math.min(dayFactors.length - 1, day))]
    }
    return k
  }
  const addIgnitionsUpTo = (hour) => {
    while (pending.length && pending[0].hour <= hour + 1e-9) {
      const ig = pending.shift()
      active = unionPolys(active, [[ccw(ig.ring)]])
    }
  }

  // A point guaranteed inside a polygon (not in a hole): probe along the widest horizontal chord.
  const representative = (poly) => {
    const { minY, maxY } = bboxOfPolys([poly])
    for (const f of [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9]) {
      const y = minY + (maxY - minY) * f
      const xs = []
      for (const ring of poly) {
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i]
          const [xj, yj] = ring[j]
          if (yi > y !== yj > y) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi))
        }
      }
      xs.sort((p, q) => p - q)
      let best = null
      for (let k = 0; k + 1 < xs.length; k += 2) if (!best || xs[k + 1] - xs[k] > best[1] - best[0]) best = [xs[k], xs[k + 1]]
      if (best && best[1] - best[0] > 1e-6) return [(best[0] + best[1]) / 2, y]
    }
    return poly[0][0]
  }

  const keepConnected = (candidate, previous) => {
    if (candidate.length <= 1 && !previous.length) return candidate
    const anchors = [...previous.map(representative), ...seeds.map((s) => s.point)]
    return candidate.filter((poly) => anchors.some((pt) => pointInPolys(pt, [poly])))
  }

  const recordHour = (hour) => {
    hourly.set(hour, unionPolys(frozen, active))
  }

  addIgnitionsUpTo(0)
  const lastHour = Math.min(endHour, holdHour)
  let nextRecord = 1
  recordHour(0)

  while (t < lastHour - 1e-9) {
    // Wind-shift events that freeze the current polygon and restart from the exposed flank.
    while (shiftQueue.length && shiftQueue[0].hour <= t + 1e-9) {
      const ev = shiftQueue.shift()
      if (ev.freeze) {
        const seg = segmentAt(ev.hour)
        const heading = (seg.windFromDeg + 180) % 360
        const strips = []
        for (const poly of active) {
          const ring = resampleRing(ccw(poly[0]), Math.max(72, Math.min(maxVertices, Math.round(ringPerimeter(poly[0]) / 60))))
          const exposed = []
          for (let i = 0; i < ring.length; i++) {
            const a = ring[(i - 1 + ring.length) % ring.length]
            const b = ring[(i + 1) % ring.length]
            const nrm = [b[1] - a[1], -(b[0] - a[0])]
            const face = diff(bearingOf(nrm), heading) <= (ev.faceDeg ?? 80)
            exposed.push(face)
          }
          // Contiguous runs of exposed vertices (wrapping).
          const runs = []
          let run = []
          const n = ring.length
          const startIdx = exposed.findIndex((e) => !e)
          for (let k = 0; k < n; k++) {
            const i = (startIdx + 1 + k + n) % n
            if (exposed[i]) run.push(ring[i])
            else if (run.length) {
              runs.push(run)
              run = []
            }
          }
          if (run.length) runs.push(run)
          for (let r of runs) {
            if (ev.flankFraction) {
              // Keep the middle part of the flank, measured along the old axis.
              const old = segmentAt(ev.hour - 0.01)
              const axis = [Math.sin(((old.windFromDeg + 180) % 360) * RAD), Math.cos(((old.windFromDeg + 180) % 360) * RAD)]
              const proj = r.map((p) => p[0] * axis[0] + p[1] * axis[1])
              const lo = Math.min(...proj)
              const hi = Math.max(...proj)
              const [f0, f1] = ev.flankFraction
              r = r.filter((_, i) => {
                const f = (proj[i] - lo) / (hi - lo || 1)
                return f >= f0 && f <= f1
              })
            }
            if (r.length >= 2) strips.push([stripXY(r, 40)])
          }
        }
        frozen = unionPolys(frozen, active)
        active = strips.length ? strips.reduce((acc, s) => unionPolys(acc, [s]), []) : []
        log.push({ hour: ev.hour, type: 'freeze', strips: strips.length })
      }
    }

    const seg = segmentAt(t)
    const heading = (seg.windFromDeg + 180) % 360
    const d = [Math.sin(heading * RAD), Math.cos(heading * RAD)]
    const R = seg.headKmh * 1000 * rateScale
    const lb = Math.max(1.05, seg.lb * lbScale)
    const clock = clockFactor(t)
    const maxBoost = Math.max(1, ...fingers.map((f) => f.factor * (f.slope ?? 1)), ...slopes.map((s) => s.factor))

    // Sub-step length: a vertex should not travel more than ~2.5 spacings per step.
    let perimeter = 0
    for (const poly of active) perimeter += ringPerimeter(poly[0])
    const spacing = Math.max(minSpacingM, perimeter / maxVertices)
    const vmax = Math.max(1, R * clock * maxBoost)
    let dt = Math.min(0.5, Math.max(1 / 120, (2.5 * spacing) / vmax))
    const nextEventTimes = [nextRecord, lastHour, shiftQueue[0]?.hour ?? Infinity, pending[0]?.hour ?? Infinity, nextSpot]
    for (const s of segments) if (s.fromHour > t + 1e-9) nextEventTimes.push(s.fromHour)
    const nextEvent = Math.min(...nextEventTimes.filter((x) => x > t + 1e-9))
    dt = Math.min(dt, nextEvent - t)

    // Move every vertex of every active outer ring.
    const moved = []
    for (const poly of active) {
      const ringIn = ccw(poly[0])
      const n = Math.max(72, Math.min(maxVertices, Math.round(ringPerimeter(ringIn) / spacing)))
      const ring = resampleRing(ringIn, n)
      const out = new Array(n)
      for (let i = 0; i < n; i++) {
        const a = ring[(i - 1 + n) % n]
        const b = ring[(i + 1) % n]
        let nx = b[1] - a[1]
        let ny = -(b[0] - a[0])
        const L = Math.hypot(nx, ny) || 1
        nx /= L
        ny /= L
        const vel = waveletVelocity([nx, ny], d, R, lb, flankScale)
        let k = clock
        const brg = bearingOf([nx, ny])
        for (const f of fingers) {
          if (f.origin) {
            // Anchored finger: the front inside a narrow corridor along the draw runs faster.
            const ax = Math.sin(f.bearing * RAD)
            const ay = Math.cos(f.bearing * RAD)
            const rx = ring[i][0] - f.origin[0]
            const ry = ring[i][1] - f.origin[1]
            const along = rx * ax + ry * ay
            const across = Math.abs(rx * ay - ry * ax)
            if (along > -f.corridorM && across <= f.corridorM && diff(brg, f.bearing) <= 70) k *= f.factor * (f.slope ?? 1) * (1 - 0.5 * (across / f.corridorM) ** 2)
          } else if (diff(brg, f.bearing) <= (f.halfWidth ?? 10)) k *= f.factor * (f.slope ?? 1)
        }
        for (const s of slopes) if (inSector(brg, s.from, s.to)) k *= s.factor
        out[i] = [ring[i][0] + vel[0] * k * dt, ring[i][1] + vel[1] * k * dt]
      }
      moved.push([ccw(out)])
    }

    const previous = active
    let next = unionPolys(active, moved)
    // Barriers: record first contact, subtract the ones still holding, open delayed ones.
    const nextBox = bboxOfPolys(next)
    for (const b of barrierState) {
      if (b.open || !bboxesTouch(nextBox, b.bbox)) continue
      if (b.contactAt === null) {
        const touching = intersectPolys(next, b.polys)
        if (touching.length && polysAreaM2(touching) > 1) {
          b.contactAt = t
          log.push({ hour: t, type: 'barrier-contact', id: b.id })
        }
      }
      if (b.delayHours != null && b.contactAt !== null && t + dt >= b.contactAt + b.delayHours) {
        b.open = true
        log.push({ hour: t + dt, type: 'barrier-crossed', id: b.id })
        continue
      }
      next = differencePolys(next, b.polys)
    }
    if (islandPolys.length) next = differencePolys(next, islandPolys)
    active = keepConnected(next, previous)
    t += dt

    addIgnitionsUpTo(t)

    // Spotting: a satellite ignition downwind of the head.
    if (spotting && t >= nextSpot - 1e-9 && (spotting.untilHour == null || t <= spotting.untilHour)) {
      nextSpot += spotting.everyHours
      let tip = null
      let best = -Infinity
      for (const poly of active) {
        for (const p of poly[0]) {
          const proj = p[0] * d[0] + p[1] * d[1]
          if (proj > best) {
            best = proj
            tip = p
          }
        }
      }
      if (tip && clock > 0.5) {
        const dist = rng.between(spotting.minM, spotting.maxM)
        const lateral = rng.between(-0.25, 0.25) * dist
        const pt = [tip[0] + d[0] * dist + d[1] * lateral, tip[1] + d[1] * dist - d[0] * lateral]
        const hard = barrierState.filter((b) => b.delayHours == null)
        let crossesHard = false
        for (let f = 0.05; f <= 1 && !crossesHard; f += 0.05) {
          const q = [tip[0] + (pt[0] - tip[0]) * f, tip[1] + (pt[1] - tip[1]) * f]
          crossesHard = hard.some((b) => q[0] >= b.bbox.minX && q[0] <= b.bbox.maxX && q[1] >= b.bbox.minY && q[1] <= b.bbox.maxY && pointInPolys(q, b.polys))
        }
        const blocked =
          crossesHard ||
          pointInPolys(pt, active) ||
          pointInPolys(pt, frozen) ||
          islands.some((isl) => pointInPolys(pt, [isl])) ||
          barrierState.some((b) => b.delayHours == null && b.polys.some((poly) => pointInPolys(pt, [poly])))
        if (!blocked) {
          const ring = circleXY(pt, 45, 24)
          seeds.push({ point: pt, hour: t })
          active = unionPolys(active, [[ccw(ring)]])
          log.push({ hour: t, type: 'spot', at: pt })
        }
      }
    }

    while (t >= nextRecord - 1e-9 && nextRecord <= lastHour) {
      recordHour(nextRecord)
      nextRecord++
    }
  }

  // Held: the perimeter stays where crews stopped it.
  const final = unionPolys(frozen, active)
  for (let h = Math.floor(lastHour) + 1; h <= endHour; h++) hourly.set(h, final)
  if (!hourly.has(endHour)) hourly.set(endHour, final)
  return { hourly, log, barrierState: barrierState.map((b) => ({ id: b.id, contactAt: b.contactAt, open: b.open })) }
}
