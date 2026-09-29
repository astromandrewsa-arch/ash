// Builds the ten dated fires (CLAUDE.md §7–8): ignition zone and prior, three spread bands,
// steps, homes and assets in path, calibrated losses, fuel state and the narrowing strip.

import * as turf from '@turf/turf'
import { makeRng } from './rng.mjs'
import {
  areaHa, blobPolygon, bufferLine, centroidOf, destination, haversineKm, pointInRing, polylineLengthKm, projector,
  round, round5, scaleRingToArea, sum,
} from './geo.mjs'
import { bufferLineXY, circleXY, intersectPolys, offsetPolys, pointInPolys, polysAreaM2, simulate, unionPolys } from './spread.mjs'
import { ASSET_DR, RANCH_DR, calibrate, grossOf, homeDamageRatio } from './loss.mjs'
import { addDays, daysBetween, dayMonth, windowLabel } from './text.mjs'
import { pointAtKm } from './world.mjs'
import { FIRES, ISSUE, LINES } from '../config/fires.mjs'

const BASE_STEPS = [1, 4, 8, 12, 24, 36, 48]
const BAND_KEYS = ['p90', 'p50', 'p25']

export function stepHours(windowDays) {
  const hours = [...BASE_STEPS]
  for (let d = 3; d <= Math.max(3, windowDays); d++) hours.push(d * 24)
  return hours
}
export const stepLabel = (h) => (h <= 48 ? `${h} h` : `Day ${h / 24}`)

// ---------------------------------------------------------------------------
// Geometry resolution
// ---------------------------------------------------------------------------

function routeSlice(route, fromKm, toKm) {
  const out = [pointAtKm(route, fromKm)]
  let acc = 0
  for (let i = 1; i < route.length; i++) {
    acc += haversineKm(route[i - 1], route[i])
    if (acc > fromKm && acc < toKm) out.push(route[i])
  }
  out.push(pointAtKm(route, toKm))
  return out
}

/** Nudge a point off open water: search outward rings until it lands on land. */
function onLand(pt, water) {
  const wet = (p) => water.some((f) => {
    const [w, s, e, n] = turf.bbox(f)
    return p[1] >= w && p[1] <= e && p[0] >= s && p[0] <= n && turf.booleanPointInPolygon(turf.point([p[1], p[0]]), f)
  })
  if (!wet(pt)) return pt
  for (let r = 60; r <= 3000; r += 60) {
    for (let a = 0; a < 360; a += 15) {
      const q = destination(pt, a, r)
      if (!wet(q)) return q
    }
  }
  return pt
}

function resolvePoint(at, assetsByKey) {
  if (Array.isArray(at)) return at
  return pointAtKm(assetsByKey[at.asset].geometry, at.km)
}

/** Buffer a polyline so the zone reaches `ha` hectares (bisection on the half-width). */
function corridorZone(line, ha) {
  const lenM = polylineLengthKm(line) * 1000
  let lo = 50
  let hi = (ha * 1e4) / lenM
  let ring = bufferLine(line, hi / 2, 6)
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2
    ring = bufferLine(line, mid, 6)
    if (areaHa(ring) > ha) hi = mid
    else lo = mid
  }
  return ring
}

function buildZone(def, rng, assetsByKey) {
  const z = def.zone
  if (z.corridor) {
    const line = routeSlice(assetsByKey[z.corridor.asset].geometry, z.corridor.fromKm, z.corridor.toKm)
    return { rings: [corridorZone(line, z.hectares)], priorLines: [line] }
  }
  if (z.strip) {
    const road = LINES[z.strip.ref].pts.slice(z.strip.fromIdx, z.strip.toIdx + 1)
    const shifted = road.map((p) => destination(p, z.strip.side === 'north' ? 0 : 180, z.strip.offsetM))
    return { rings: [corridorZone(shifted, z.hectares)], priorLines: [road] }
  }
  const each = z.hectares / z.blocks.length
  const rings = z.blocks.map((c) => {
    const r = Math.sqrt((each * 1e4) / Math.PI)
    return scaleRingToArea(blobPolygon(rng, c, r, { vertices: 36, roughness: 0.14, aspect: z.aspect ?? rng.between(1.1, 1.4), axisDeg: rng.between(0, 180) }), each)
  })
  // Ranch tracks and roads through the blocks carry the ignition prior.
  const priorLines = rings.map((ring) => {
    const c = centroidOf(ring)
    const brg = rng.between(0, 180)
    const r = Math.sqrt((each * 1e4) / Math.PI)
    return [destination(c, brg, r * 1.1), c, destination(c, brg + 180 + rng.between(-30, 30), r * 1.1)]
  })
  return { rings, priorLines }
}

/** Ignition-prior heat points inside the zone, hottest along lines, roads and ranch tracks. */
function heatPoints(rng, zone, n = 110) {
  const pts = []
  const all = zone.rings.flat()
  const lats = all.map((p) => p[0])
  const lngs = all.map((p) => p[1])
  const box = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
  const lineDist = (pt) => {
    let best = Infinity
    for (const line of zone.priorLines) {
      const d = turf.pointToLineDistance(turf.point([pt[1], pt[0]]), turf.lineString(line.map(([a, b]) => [b, a])), { units: 'meters' })
      best = Math.min(best, d)
    }
    return best
  }
  let guard = 0
  while (pts.length < n && guard++ < n * 60) {
    const pt = [rng.between(box[0], box[1]), rng.between(box[2], box[3])]
    if (!zone.rings.some((ring) => pointInRing(pt, ring))) continue
    const d = lineDist(pt)
    const w = 0.15 + 0.85 * Math.exp(-d / 320)
    if (rng.next() > w * 1.05) continue
    pts.push({ lat: round5(pt[0]), lng: round5(pt[1]), w: round(w, 2) })
  }
  return pts
}

// ---------------------------------------------------------------------------
// Barriers
// ---------------------------------------------------------------------------

function featuresNear(features, center, km) {
  const dLat = km / 111
  const dLng = km / (111 * Math.cos((center[0] * Math.PI) / 180))
  return features.filter((f) => {
    const [w, s, e, n] = turf.bbox(f)
    return !(e < center[1] - dLng || w > center[1] + dLng || n < center[0] - dLat || s > center[0] + dLat)
  })
}

const lineParts = (f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates)

function buildBarriers(def, pr, geo, rng, radiusKm) {
  const barriers = []
  const display = []
  const b = def.barriers || {}
  const clipKm = radiusKm
  const toXYring = (ring) => ring.map(([lng, lat]) => pr.toXY([lat, lng]))
  if (b.water) {
    const near = featuresNear(geo.water, pr.origin, clipKm)
    const polys = []
    const box = bboxAround(pr.origin, clipKm)
    for (const f0 of near) {
      const f = turf.bboxClip(f0, box)
      const list = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
      for (const poly of list) if (poly.length && poly[0].length > 3) polys.push(poly.map((r) => toXYring(r.slice(0, -1))))
    }
    if (polys.length) {
      barriers.push({ id: 'water', polys: unionPolys(polys, []), delayHours: null })
      for (const f of near) {
        if ((f.properties.sqkm || 0) < 0.4) continue
        const clipped = turf.bboxClip(f, bboxAround(pr.origin, Math.min(clipKm, 25)))
        const rings = clipped.geometry.type === 'Polygon' ? [clipped.geometry.coordinates[0]] : clipped.geometry.coordinates.map((p) => p[0])
        for (const r of rings) if (r && r.length > 3) display.push({ kind: 'lake', name: f.properties.name || 'Lake', effect: 'hard', geometry: simplifyLatLng(r.map(([lng, lat]) => [lat, lng]), 0.00015) })
      }
    }
  }
  for (const r of b.rivers || []) {
    const near = featuresNear(geo.rivers.filter((f) => f.properties.name === r.name), pr.origin, clipKm)
    const polys = []
    for (const f of near) {
      for (const part of lineParts(f)) {
        const pts = part.map(([lng, lat]) => pr.toXY([lat, lng]))
        polys.push(...bufferLineXY(pts, 60))
        display.push({ kind: 'river', name: r.label || r.name, effect: r.delayHours ? 'partial' : 'hard', geometry: simplifyLatLng(part.map(([lng, lat]) => [lat, lng]), 0.0002) })
      }
    }
    if (polys.length) barriers.push({ id: r.name, polys: unionPolys(polys, []), delayHours: r.delayHours ?? null })
  }
  for (const r of b.freeways || []) {
    const near = featuresNear(geo.freeways.filter((f) => f.properties.name === r.name), pr.origin, clipKm)
    const polys = []
    for (const f of near) {
      for (const part of lineParts(f)) {
        polys.push(...bufferLineXY(part.map(([lng, lat]) => pr.toXY([lat, lng])), 60))
        display.push({ kind: 'highway', name: r.name.replace(/^I/, 'I-').replace(/^U/, 'US-'), effect: '70%', geometry: simplifyLatLng(part.map(([lng, lat]) => [lat, lng]), 0.0002) })
      }
    }
    if (polys.length) barriers.push({ id: r.name, polys: unionPolys(polys, []), delayHours: r.delayHours ?? 2 })
  }
  for (const l of b.lines || []) {
    const line = LINES[l.ref]
    barriers.push({ id: l.ref, polys: bufferLineXY(line.pts.map(pr.toXY), line.kind === 'escarpment' ? 150 : 60), delayHours: l.delayHours ?? null })
    display.push({ kind: line.kind, name: line.name, effect: l.delayHours ? '70%' : 'hard', geometry: line.pts })
  }
  for (const f of b.fields || []) {
    barriers.push({ id: f.name, polys: [[f.ring.map(pr.toXY)]], delayHours: null })
    display.push({ kind: 'field', name: f.name, effect: 'hard', geometry: f.ring })
  }
  return { barriers, display }
}

function bboxAround([lat, lng], km) {
  const dLat = km / 111
  const dLng = km / (111 * Math.cos((lat * Math.PI) / 180))
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat]
}

function simplifyLatLng(pts, tol) {
  if (pts.length < 6) return pts.map(([a, b]) => [round5(a), round5(b)])
  const line = turf.simplify(turf.lineString(pts.map(([a, b]) => [b, a])), { tolerance: tol, highQuality: false })
  return line.geometry.coordinates.map(([lng, lat]) => [round5(lat), round5(lng)])
}

// ---------------------------------------------------------------------------
// Output polygons
// ---------------------------------------------------------------------------

/** Metre polygons → [lat,lng] polygons, simplified relative to size and rounded to 5 dp. */
function toLatLngPolys(polys, pr, tolM) {
  return polys
    .map((poly) =>
      poly
        .map((ring) => simplifyRingXY(ring, tolM))
        .filter((ring) => ring.length >= 3)
        .map((ring) => ring.map((p) => {
          const [lat, lng] = pr.toLatLng(p)
          return [round5(lat), round5(lng)]
        })),
    )
    .filter((poly) => poly.length && poly[0].length >= 3)
}

function simplifyRingXY(ring, tol) {
  if (ring.length < 8) return ring
  const closed = [...ring, ring[0]]
  const keep = new Uint8Array(closed.length)
  keep[0] = keep[closed.length - 1] = 1
  const stack = [[0, closed.length - 1]]
  while (stack.length) {
    const [i, j] = stack.pop()
    let best = -1
    let idx = -1
    const [x1, y1] = closed[i]
    const [x2, y2] = closed[j]
    const L = Math.hypot(x2 - x1, y2 - y1) || 1
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs((y2 - y1) * closed[k][0] - (x2 - x1) * closed[k][1] + x2 * y1 - y2 * x1) / L
      if (d > best) {
        best = d
        idx = k
      }
    }
    if (best > tol && idx > 0) {
      keep[idx] = 1
      stack.push([i, idx], [idx, j])
    }
  }
  const out = closed.filter((_, i) => keep[i])
  out.pop()
  return out.length >= 3 ? out : ring
}

// ---------------------------------------------------------------------------
// Fuel state
// ---------------------------------------------------------------------------

function fuelState(def, rng) {
  const f = def.fuel
  const issue = ISSUE.date
  const series = []
  for (let d = -29; d <= 0; d++) {
    const t = d
    series.push({
      day: addDays(issue, d),
      liveFm: round(f.liveFm - f.liveTrendPtsPerDay * t * -1 + rng.between(-0.6, 0.6), 1),
      dead100h: round(f.dead100h + Math.max(0, -t) * 0.16 + rng.between(-0.25, 0.25) + (d < -22 ? 1.2 : 0), 1),
      curing: round(Math.min(98, f.curing - Math.max(0, -t) * 0.35 + rng.between(-0.4, 0.4)), 1),
    })
  }
  // Fix the drift so day 0 equals the stated state.
  series[series.length - 1] = { day: issue, liveFm: f.liveFm, dead100h: f.dead100h, curing: f.curing }
  const firstBelow = (key, value) => {
    for (const s of series) if (s[key] <= value) return s.day
    return null
  }
  const firstAbove = (key, value) => {
    for (const s of series) if (s[key] >= value) return s.day
    return null
  }
  // Projection to the window start: live fuel keeps falling at its trend.
  const lead = daysBetween(issue, def.window[0])
  const projection = []
  for (let d = 1; d <= lead; d++) projection.push({ day: addDays(issue, d), liveFm: round(f.liveFm + f.liveTrendPtsPerDay * d, 1), dead100h: round(Math.max(7.5, f.dead100h - 0.08 * d), 1) })
  const liveCross = f.liveFm <= 80 ? firstBelow('liveFm', 80) || issue : projection.find((p) => p.liveFm <= 80)?.day || def.window[0]
  const dead10Cross = addDays(issue, -Math.round(rng.between(4, 12)))
  const thresholds = [
    { name: 'Curing 80%', value: 80, crossedOn: firstAbove('curing', 80) || addDays(issue, -29) },
    { name: '10-h dead fuel 7%', value: 7, crossedOn: dead10Cross },
    { name: '100-h dead fuel 13%', value: 13, crossedOn: firstBelow('dead100h', 13) || addDays(issue, -24) },
    { name: 'Live fuel 80%', value: 80, crossedOn: liveCross, projected: liveCross > issue },
  ]
  return {
    liveFm: f.liveFm,
    liveTrendPtsPerDay: f.liveTrendPtsPerDay,
    curing: f.curing,
    dead1h: f.dead1h,
    dead10h: f.dead10h,
    dead100h: f.dead100h,
    dead1000h: f.dead1000h,
    erc: f.erc,
    ercPercentile: f.ercPercentile90,
    kbdi: f.kbdi,
    daysSinceRain: f.daysSinceRain,
    thresholds,
    series,
    projection,
  }
}

/** Successive issues narrowing the window down to today's call. */
function narrowing(def, rng) {
  const start = def.window[0]
  const end = def.window[1]
  const finalDays = daysBetween(start, end) + 1
  const out = []
  const issues = [-14, -10, -6, -3, 0]
  issues.forEach((off, i) => {
    const days = Math.max(finalDays, Math.round(14 - ((14 - finalDays) * i) / (issues.length - 1)))
    const shiftBack = Math.floor((days - finalDays) / 2)
    const ws = addDays(start, -shiftBack)
    const p = i === issues.length - 1 ? def.probabilityAtCall ?? def.probability : round(0.55 + (0.33 * i) / (issues.length - 1) + rng.between(-0.02, 0.02), 2)
    out.push({ issued: addDays(ISSUE.date, off), windowStart: ws, windowEnd: addDays(ws, days - 1), windowDays: days, probability: p })
  })
  return out
}

// ---------------------------------------------------------------------------
// Exposure and loss
// ---------------------------------------------------------------------------

function exposure(def, ctx, sim, pr) {
  const { homes, homesByArea, areas, assets, ranches } = ctx
  const finalHour = Math.max(...sim.p50.hourly.keys())
  const finals = Object.fromEntries(BAND_KEYS.map((b) => [b, sim[b].hourly.get(Math.max(...sim[b].hourly.keys()))]))
  const box = bboxOfPolysLatLng(finals.p25, pr, 1500)
  const inBox = ([lat, lng]) => lat >= box.s && lat <= box.n && lng >= box.w && lng <= box.e

  const firstHour = (band, xy) => {
    const hours = [...sim[band].hourly.keys()].sort((a, b) => a - b)
    for (const h of hours) if (pointInPolys(xy, sim[band].hourly.get(h))) return h
    return null
  }
  const ringOf = (xy) => (pointInPolys(xy, finals.p90) ? 'p90' : pointInPolys(xy, finals.p50) ? 'p50' : pointInPolys(xy, finals.p25) ? 'p25' : null)
  const items = []

  // Homes
  const homesInPath = []
  for (const area of areas) {
    if (area.type !== 'homes' || !area.ring.some(inBox)) continue
    for (const h of homesByArea.get(area.id)) {
      if (!inBox(h.centroid)) continue
      const xy = pr.toXY(h.centroid)
      const band = ringOf(xy)
      if (!band) continue
      const hourReached = firstHour(band === 'p25' ? 'p25' : 'p50', xy) ?? firstHour(band, xy)
      homesInPath.push({ homeId: h.id, band, hourReached })
      items.push({ kind: 'home', ref: h.id, areaId: h.areaId, band, tiv: h.tiv, dr: homeDamageRatio(h), label: h.address })
    }
  }

  // Assets
  const assetsInPath = []
  for (const a of assets) {
    let hit = null
    if (a.kind === 'line' || a.kind === 'pipeline') {
      const samples = a.kind === 'line' ? a.poles : resampleEvery(a.geometry, 0.09)
      const perKm = a.tiv / a.km
      const byBand = { p90: 0, p50: 0, p25: 0 }
      let first = null
      for (const p of samples) {
        if (!inBox(p)) continue
        const xy = pr.toXY(p)
        const band = ringOf(xy)
        if (!band) continue
        byBand[band]++
        const h = firstHour(band === 'p25' ? 'p25' : 'p50', xy)
        if (h !== null && (first === null || h < first)) first = h
      }
      const n = byBand.p90 + byBand.p50 + byBand.p25
      if (n) {
        for (const band of BAND_KEYS) {
          if (!byBand[band]) continue
          const km = byBand[band] * 0.09
          // One location per km of line for gross limits.
          const locs = Math.max(1, Math.round(km))
          for (let i = 0; i < locs; i++) items.push({ kind: a.kind, ref: a.id, band, tiv: (km * perKm) / locs, dr: ASSET_DR[a.kind], label: a.name })
        }
        const bandOf = byBand.p90 ? 'p90' : byBand.p50 ? 'p50' : 'p25'
        hit = { assetId: a.id, band: bandOf, hourReached: first, poles: a.kind === 'line' ? n : 0, km: round(n * 0.09, 1) }
      }
      for (const st of a.stations || []) {
        if (!inBox(st.pos)) continue
        const xy = pr.toXY(st.pos)
        const band = ringOf(xy)
        if (!band) continue
        items.push({ kind: 'station', ref: a.id, band, tiv: 6e6, dr: ASSET_DR.station, label: st.name })
        hit = hit || { assetId: a.id, band, hourReached: firstHour(band === 'p25' ? 'p25' : 'p50', xy), poles: 0, km: 0 }
        hit.stations = (hit.stations || 0) + 1
      }
    } else if (a.kind === 'substation') {
      if (inBox(a.geometry)) {
        const xy = pr.toXY(a.geometry)
        const band = ringOf(xy)
        if (band) {
          items.push({ kind: 'substation', ref: a.id, band, tiv: a.tiv, dr: ASSET_DR.substation, label: a.name })
          hit = { assetId: a.id, band, hourReached: firstHour(band === 'p25' ? 'p25' : 'p50', xy) }
        }
      }
    } else if (a.kind === 'wind') {
      const perTurbine = a.tiv / a.turbines.length
      let count = 0
      let bandOf = null
      let first = null
      for (const t of a.turbines) {
        if (!inBox(t)) continue
        const xy = pr.toXY(t)
        const band = ringOf(xy)
        if (!band) continue
        count++
        bandOf = bandOf && BAND_KEYS.indexOf(bandOf) < BAND_KEYS.indexOf(band) ? bandOf : band
        items.push({ kind: 'turbine', ref: a.id, band, tiv: perTurbine, dr: ASSET_DR.turbine, label: `${a.name} turbine` })
        const h = firstHour(band === 'p25' ? 'p25' : 'p50', xy)
        if (h !== null && (first === null || h < first)) first = h
      }
      if (count) hit = { assetId: a.id, band: bandOf, hourReached: first, turbines: count }
    } else {
      // Refinery or tank farm: the share of the footprint inside each ring.
      const fp = [a.geometry.map(pr.toXY)]
      const total = polysAreaM2([fp])
      const shares = {}
      let prev = 0
      for (const band of BAND_KEYS) {
        const inside = polysAreaM2(intersectPolys([fp], finals[band]))
        shares[band] = Math.max(0, inside - prev) / total
        prev = Math.max(prev, inside)
      }
      const any = shares.p90 + shares.p50 + shares.p25
      if (any > 0.001) {
        for (const band of BAND_KEYS) if (shares[band] > 0) items.push({ kind: a.kind, ref: a.id, band, tiv: a.tiv * shares[band], dr: ASSET_DR[a.kind], label: a.name })
        hit = { assetId: a.id, band: shares.p90 ? 'p90' : shares.p50 ? 'p50' : 'p25', hourReached: null, share: round(any, 3) }
      }
    }
    if (hit) assetsInPath.push(hit)
  }

  // Ranches: forage by burned area, fencing by fence length, herds by position, structures.
  const ranchHits = []
  for (const r of ranches) {
    const area = areas.find((x) => x.id === r.areaId)
    if (!area.ring.some(inBox) && !r._fencePts.some(inBox)) continue
    const ringXY = [area.ring.map(pr.toXY)]
    const ranchHa = polysAreaM2([ringXY]) / 1e4
    const hit = { ranchId: r.id, burnedHa: {}, fenceKm: {}, livestock: {}, structures: {} }
    let prevHa = 0
    for (const band of BAND_KEYS) {
      const ha = polysAreaM2(intersectPolys([ringXY], finals[band])) / 1e4
      hit.burnedHa[band] = round(ha)
      const ringHa = Math.max(0, ha - prevHa)
      prevHa = Math.max(prevHa, ha)
      if (ringHa > 0) items.push({ kind: 'forage', ref: r.id, band, tiv: (r.components.forage * ringHa) / ranchHa, dr: RANCH_DR.forage, label: `${r.name} forage` })
    }
    const counted = { p90: 0, p50: 0, p25: 0 }
    for (const p of r._fencePts) {
      if (!inBox(p)) continue
      const band = ringOf(pr.toXY(p))
      if (band) counted[band]++
    }
    for (const band of BAND_KEYS) {
      if (!counted[band]) continue
      const km = counted[band] * 0.25
      const perKm = r.components.fencing / r.fenceKm
      const locs = Math.max(1, Math.round(km / 10))
      for (let i = 0; i < locs; i++) items.push({ kind: 'fencing', ref: r.id, band, tiv: (km * perKm) / locs, dr: RANCH_DR.fencing, label: `${r.name} fencing` })
    }
    hit.fenceKm = { p90: counted.p90 * 0.25, p50: (counted.p90 + counted.p50) * 0.25, p25: (counted.p90 + counted.p50 + counted.p25) * 0.25 }
    const heads = { p90: 0, p50: 0, p25: 0 }
    const valuePerHead = r.components.livestock / (r.cattle + r.bison)
    for (const herd of r._herds) {
      if (!inBox(herd.pos)) continue
      const band = ringOf(pr.toXY(herd.pos))
      if (!band) continue
      heads[band] += herd.head
      items.push({ kind: 'livestock', ref: r.id, band, tiv: herd.head * valuePerHead, dr: RANCH_DR.livestock, label: `${r.name} ${herd.kind}` })
    }
    hit.livestock = { p90: Math.round(heads.p90), p50: Math.round(heads.p90 + heads.p50), p25: Math.round(heads.p90 + heads.p50 + heads.p25) }
    const structs = { p90: 0, p50: 0, p25: 0 }
    for (const s of r.structures) {
      const band = ringOf(pr.toXY(s.pos))
      if (!band) continue
      structs[band]++
      items.push({ kind: 'structures', ref: r.id, band, tiv: s.tiv, dr: RANCH_DR.structures, label: s.name })
    }
    hit.structures = { p90: structs.p90, p50: structs.p90 + structs.p50, p25: structs.p90 + structs.p50 + structs.p25 }
    if (hit.burnedHa.p25 > 0 || hit.livestock.p25 > 0) ranchHits.push(hit)
  }

  return { items, homesInPath, assetsInPath, ranchHits, finals }
}

function resampleEvery(route, km) {
  const out = []
  const total = polylineLengthKm(route)
  for (let d = 0; d <= total; d += km) out.push(pointAtKm(route, d))
  return out
}

function bboxOfPolysLatLng(polys, pr, marginM) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const poly of polys) {
    for (const [x, y] of poly[0]) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  const [s, w] = pr.toLatLng([minX - marginM, minY - marginM])
  const [n, e] = pr.toLatLng([maxX + marginM, maxY + marginM])
  return { s, w, n, e }
}

// ---------------------------------------------------------------------------
// One fire
// ---------------------------------------------------------------------------

export function buildFire(def, ctx) {
  const rng = makeRng(`fire:${def.id}`)
  const { assetsByKey, geo } = ctx
  const zone = buildZone(def, rng, assetsByKey)
  const ignitionPts = def.ignitions.map((ig) => ({ ...ig, pt: onLand(resolvePoint(ig.at, assetsByKey), geo.water) }))
  const origin = ignitionPts[0].pt
  const pr = projector(origin)
  const windowDays = daysBetween(def.window[0], def.window[1]) + 1
  const endHour = windowDays * 24
  const radiusKm = def.id === 'PH-01' ? 320 : 60
  const { barriers, display } = buildBarriers(def, pr, geo, rng, radiusKm)

  // Islands: caliche pads along the ROW (PB-08) or last season's patch burns (OK-09).
  const islands = []
  const islandDisplay = []
  if (def.islands) {
    const route = assetsByKey.BASIN.geometry
    for (let i = 0; i < def.islands.count; i++) {
      const [k0, k1] = def.islands.alongKm ?? [4, 40]
      const [o0, o1] = def.islands.offsetM ?? [80, 2600]
      const along = pointAtKm(route, rng.between(k0, k1))
      const c = destination(along, rng.pick([rng.between(-20, 20) + 160, rng.between(-20, 20) + 340]), rng.between(o0, o1))
      const s = rng.between(def.islands.sizeM[0], def.islands.sizeM[1])
      const ring = rectRing(c, s, s * rng.between(0.8, 1.2), rng.between(0, 90))
      islands.push([ring.map(pr.toXY)])
      islandDisplay.push({ kind: 'island', name: 'Caliche pad', effect: 'hard', geometry: ring.map(([a, b]) => [round5(a), round5(b)]) })
    }
  }
  if (def.patches) {
    // [lat, lng, widthM, heightM, axisDeg?]: an irregular blob of last season's burn.
    def.patches.forEach(([lat, lng, w, h, axisDeg = 90], i) => {
      const ring = blobPolygon(makeRng(`patch:${def.id}:${i}`), [lat, lng], Math.sqrt((w * h) / Math.PI), { vertices: 18, roughness: 0.16, aspect: w / h, axisDeg })
      islands.push([ring.map(pr.toXY)])
      islandDisplay.push({ kind: 'patch', name: 'Last season’s patch burn', effect: 'hard', geometry: ring.map(([a, b]) => [round5(a), round5(b)]) })
    })
  }

  const segments = def.recipe.map((s) => ({ fromHour: s.fromHour, windFromDeg: s.windFromDeg, headKmh: s.headKmh, lb: s.lb, flankScale: s.flankScale }))
  const ignitions = ignitionPts.map((ig) => ({ hour: ig.hour, ring: circleXY(pr.toXY(ig.pt), 150, 72) }))
  const bandParams = {
    p90: { rate: 0.8, lb: 0.9, spotting: null },
    p50: { rate: 1, lb: 1, spotting: def.spotting?.all || null },
    p25: { rate: 1.25, lb: 1, spotting: def.spotting?.all || def.spotting?.p25 || null },
  }
  const sim = {}
  for (const band of BAND_KEYS) {
    const bp = bandParams[band]
    const t0 = Date.now()
    sim[band] = simulate({
      ignitions,
      segments,
      startLocalHour: def.startLocalHour,
      rateScale: (def.rateScale ?? 1) * bp.rate,
      flankScale: def.flankScale ?? 1,
      lbScale: bp.lb,
      dayFactors: def.dayFactors || null,
      fingers: (def.fingers || []).map((f) => (f.origin ? { ...f, origin: pr.toXY(f.origin) } : f)),
      slopes: def.slopes || [],
      spotting: bp.spotting,
      barriers,
      islands,
      // flankLng: keep only the exposed flank between two longitudes (the new head's start strip).
      shifts: (def.shifts || []).map((ev) => (ev.flankLng ? { ...ev, keepX: ev.flankLng.map((lng) => pr.toXY([pr.origin[0], lng])[0]) } : ev)),
      // The tail band can assume crews hold later than in the expected case.
      holdHour: band === 'p25' && def.p25HoldHour ? def.p25HoldHour : def.holdHour ?? endHour,
      endHour,
      rng: makeRng(`spot:${def.id}:${band}`),
    })
    sim[band].ms = Date.now() - t0
  }

  // Bands nest by definition: whatever burns in 90% of runs also burns in 50% and in 25%.
  for (const h of sim.p50.hourly.keys()) {
    const p90 = sim.p90.hourly.get(h)
    const p50 = unionPolys(sim.p50.hourly.get(h), p90 || [])
    sim.p50.hourly.set(h, p50)
    if (sim.p25.hourly.has(h)) sim.p25.hourly.set(h, unionPolys(sim.p25.hourly.get(h), p50))
  }

  // Steps: perimeters at the listed hours, simplified for the browser.
  const hours = stepHours(windowDays)
  const tolFor = (polys) => Math.max(10, Math.sqrt(polysAreaM2(polys)) * 0.0055)
  const steps = hours.map((h) => {
    const step = { hour: h, label: stepLabel(h) }
    for (const band of BAND_KEYS) {
      const polys = sim[band].hourly.get(h) || sim[band].hourly.get(Math.max(...sim[band].hourly.keys()))
      step[band] = toLatLngPolys(polys, pr, tolFor(polys))
      step[`${band}Ha`] = Math.round(polysAreaM2(polys) / 1e4)
    }
    return step
  })

  return { def, rng, zone, ignitionPts, pr, sim, steps, barriersDisplay: [...display, ...islandDisplay], windowDays }
}

/** Homes (all areas) inside each band's final perimeter. */
function countBandHomes(built, ctx) {
  const { sim, pr } = built
  const finals = Object.fromEntries(BAND_KEYS.map((b) => [b, sim[b].hourly.get(Math.max(...sim[b].hourly.keys()))]))
  const box = bboxOfPolysLatLng(finals.p25, pr, 200)
  const n = { p90: 0, p50: 0, p25: 0 }
  for (const h of ctx.homes) {
    const [lat, lng] = h.centroid
    if (lat < box.s || lat > box.n || lng < box.w || lng > box.e) continue
    const xy = pr.toXY(h.centroid)
    if (!pointInPolys(xy, finals.p25)) continue
    n.p25++
    if (pointInPolys(xy, finals.p50)) {
      n.p50++
      if (pointInPolys(xy, finals.p90)) n.p90++
    }
  }
  return n
}

/**
 * Slide the listed homes clusters along a bearing until the P50 path holds the §7 home count,
 * preferring positions where the P90 core holds about 80% of it and the P25 tail about 130%
 * (so the three band losses come from footprints, not from damage ratios alone).
 * The spread does not depend on homes, so this only rebuilds the moved cluster.
 */
export function fitClusters(built, ctx, relocate) {
  for (const fit of built.def.fit || []) {
    const area = ctx.areas.find((a) => a.id === fit.area)
    const base = fit.from || area.anchor
    const [lo, hi] = fit.range || [-3000, 3000]
    const steps = fit.steps || 48
    // Several bearings may be searched; the band-ratio terms can be weighted up where the
    // P90 core must hold most of the P50 homes for the band losses to be reachable.
    const bearings = fit.bearings || [fit.bearing]
    const w = fit.ratioWeight || 1
    let best = null
    for (const bearing of bearings) {
      for (let i = 0; i <= steps; i++) {
        const sM = lo + ((hi - lo) * i) / steps
        relocate(fit.area, destination(base, bearing, sM))
        const n = countBandHomes(built, ctx)
        const t = fit.homes
        const score = 4 * (Math.abs(n.p50 - t) / t) + w * (0.35 * Math.abs(n.p90 / Math.max(n.p50, 1) - 0.8) + 0.2 * Math.abs(n.p25 / Math.max(n.p50, 1) - 1.3))
        if (!best || score < best.score) best = { sM, n, score, bearing }
      }
    }
    relocate(fit.area, destination(base, best.bearing, best.sM))
    built.fitLog = [...(built.fitLog || []), `${fit.area}: ${best.n.p90}/${best.n.p50}/${best.n.p25} homes (P50 target ${fit.homes}) at ${Math.round(best.sM)} m on ${best.bearing}°`]
  }
}

export function computeExposure(built, ctx) {
  built.exp = exposure(built.def, ctx, built.sim, built.pr)
}

function rectRing(center, w, d, rot) {
  const pr = projector(center)
  const a = (rot * Math.PI) / 180
  const pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]
  return pts.map(([x, y]) => pr.toLatLng([x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]))
}

// ---------------------------------------------------------------------------
/** What sits in the P50 path, for the fire's exposure line (config templates read this). */
function exposureSummary(bands, exp, ranches, def) {
  const asset = (key) => exp.assetsInPath.find((a) => a.assetId === `A-${key}` && a.band !== 'p25')
  const r = (key) => ranches.find((x) => x.ranchId === `RN-${key}`)
  const p50 = (v) => (v && typeof v === 'object' ? v.p50 : v) || 0
  return {
    homes: bands.p50.homes,
    homesTiv: bands.p50.homesTiv,
    avgTiv: bands.p50.homes ? bands.p50.homesTiv / bands.p50.homes : 0,
    asset,
    ranch: r,
    livestock: ranches.reduce((s, x) => s + p50(x.livestock), 0),
    outbuildings: def.outbuildings?.p50 || 0,
    p50,
  }
}

// Assemble the fires.json record once losses are calibrated
// ---------------------------------------------------------------------------

export function finishFire(built, ctx) {
  const { def, rng, zone, ignitionPts, steps, exp, barriersDisplay, windowDays } = built
  // Outbuildings (HC-05): rural structures inside the P50 and P25 rings.
  if (def.outbuildings) {
    for (let i = 0; i < def.outbuildings.p50; i++) exp.items.push({ kind: 'outbuilding', ref: `OB${i}`, band: i < def.outbuildings.p50 * 0.6 ? 'p90' : 'p50', tiv: def.outbuildings.tiv, dr: RANCH_DR.outbuilding, label: 'Outbuilding' })
    for (let i = 0; i < def.outbuildings.p25; i++) exp.items.push({ kind: 'outbuilding', ref: `OB${100 + i}`, band: 'p25', tiv: def.outbuildings.tiv, dr: RANCH_DR.outbuilding, label: 'Outbuilding' })
  }
  for (const it of exp.items) it.base = it.tiv * it.dr
  const inBand = (band) => exp.items.filter((i) => BAND_KEYS.indexOf(i.band) <= BAND_KEYS.indexOf(band))
  const factor = calibrate({ p90: inBand('p90'), p50: inBand('p50'), p25: inBand('p25') }, def.lossTarget)
  const bands = {}
  for (const band of BAND_KEYS) {
    const list = inBand(band).map((it) => {
      const drEff = Math.min(0.95, it.dr * factor[band])
      return { ...it, drEff, loss: it.tiv * drEff }
    })
    const homeItems = list.filter((i) => i.kind === 'home')
    const tiv = sum(list, (i) => i.tiv)
    const loss = sum(list, (i) => i.loss)
    bands[band] = {
      homes: homeItems.length,
      homesTiv: Math.round(sum(homeItems, (i) => i.tiv)),
      assets: new Set(list.filter((i) => ['line', 'pipeline', 'station', 'substation', 'turbine', 'refinery', 'tankfarm'].includes(i.kind)).map((i) => i.ref)).size,
      tiv: Math.round(tiv),
      damageRatio: round(loss / Math.max(tiv, 1), 3),
      loss: Math.round(loss),
      gross: Math.round(grossOf(list)),
      hectares: steps[steps.length - 1][`${band}Ha`],
      severityFactor: factor[band],
    }
    if (band === 'p50') exp.p50Items = list
  }
  const finalStep = steps[steps.length - 1]
  const ranchSummary = exp.ranchHits.map((h) => ({ ...h, burnedHa: h.burnedHa, fenceKm: mapRound(h.fenceKm), livestock: h.livestock, structures: h.structures }))
  const leadDays = daysBetween(ISSUE.date, def.window[0])
  const fuel = fuelState(def, rng)
  const exposureItems = exp.items
  return {
    record: {
      id: def.id,
      name: def.name,
      place: def.place,
      county: def.county,
      state: def.state,
      tour: !!def.tour,
      areaIds: [],
      ignitionZone: {
        class: def.zone.class,
        hectares: Math.round(sum(zone.rings, (r) => areaHa(r))),
        polygon: zone.rings.map((r) => r.map(([a, b]) => [round5(a), round5(b)])),
        heat: heatPoints(rng, zone),
        ignitions: ignitionPts.map((ig) => ({ hour: ig.hour, pos: [round5(ig.pt[0]), round5(ig.pt[1])] })),
      },
      called: ISSUE.date,
      windowStart: def.window[0],
      windowEnd: def.window[1],
      windowDays,
      windowLabel: windowLabel(def.window[0], def.window[1]),
      headerLine: `Called ${dayMonth(ISSUE.date)} · Burns ${windowLabel(def.window[0], def.window[1])} · ${Math.round(def.probability * 100)}%`,
      probability: def.probability,
      probabilityAtCall: def.probabilityAtCall ?? def.probability,
      windowNarrowedFrom: 14,
      leadDays,
      daysUntilFire: leadDays,
      severity: def.severity,
      intensity: def.intensity,
      fuel,
      narrowing: narrowing(def, rng),
      shape: {
        recipe: def.recipeText,
        segments: def.recipe,
        startLocalHour: def.startLocalHour,
        events: def.events,
        fingers: (def.fingers || []).map((f) => f.bearing),
        rateScale: def.rateScale ?? 1,
      },
      barriers: barriersDisplay,
      // Once crews hold the perimeter, later steps repeat it: they are written as `held` without polygons.
      steps: steps.map(({ hour, label, p90, p50, p25, p90Ha, p50Ha, p25Ha }, i) => {
        const prev = steps[i - 1]
        const held = i > 0 && JSON.stringify([p90, p50, p25]) === JSON.stringify([prev.p90, prev.p50, prev.p25])
        return held ? { hour, label, held: true, ha: { p90: p90Ha, p50: p50Ha, p25: p25Ha } } : { hour, label, p90, p50, p25, ha: { p90: p90Ha, p50: p50Ha, p25: p25Ha } }
      }),
      bands,
      calibration: { p90: factor.p90, p50: factor.p50, p25: factor.p25 },
      lossLower: bands.p90.loss,
      lossPoint: bands.p50.loss,
      lossUpper: bands.p25.loss,
      groundUpLoss: bands.p50.loss,
      grossLoss: bands.p50.gross,
      sd: Math.round((bands.p25.loss - bands.p90.loss) / 2.56),
      returnPeriodYears: null,
      analogue: def.analogue,
      inclusions: ['demand surge 18%', 'debris 5%', 'ALE'],
      exclusions: ['smoke', 'urban conflagration beyond band'],
      exposureText: typeof def.exposureText === 'function' ? def.exposureText(exposureSummary(bands, exp, ranchSummary, def)) : def.exposureText,
      // Short exposure for the map marker label (§9): homes in path, or the fire's main exposure.
      pathLabel: def.pathLabel ? def.pathLabel(exposureSummary(bands, exp, ranchSummary, def)) : `${Math.round(bands.p50.homes).toLocaleString('en-US')} ${bands.p50.homes === 1 ? 'home' : 'homes'}`,
      ranches: ranchSummary,
      homesInPath: exp.homesInPath,
      assetsInPath: [
        ...exp.assetsInPath,
        ...(def.watch || []).map((w) => ({ assetId: `A-${w.asset}`, band: 'watch', hourReached: w.hour, note: w.note })),
      ],
      finalHectares: finalStep.p50Ha,
      planId: `PL-${def.id}`,
      negotiationId: `NG-${def.id}`,
    },
    items: exposureItems,
    p50Items: exp.p50Items,
  }
}

const mapRound = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, round(v, 1)]))

export { FIRES }
