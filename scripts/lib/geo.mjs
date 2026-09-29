// Geometry helpers for the generator. Data files use [lat, lng]; turf and GeoJSON use [lng, lat].
// Local work (spread, grids) happens in an equirectangular metre frame around an origin.

import * as turf from '@turf/turf'

export const M_PER_DEG_LAT = 111320
const RAD = Math.PI / 180

export const round = (n, dp = 0) => Math.round(n * 10 ** dp) / 10 ** dp
export const round5 = (n) => Math.round(n * 1e5) / 1e5
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
export const sum = (arr, fn = (x) => x) => arr.reduce((s, x) => s + fn(x), 0)

/** Equirectangular projection around `origin` ([lat, lng]) in metres (x east, y north). */
export function projector([lat0, lng0]) {
  const kx = M_PER_DEG_LAT * Math.cos(lat0 * RAD)
  return {
    origin: [lat0, lng0],
    toXY: ([lat, lng]) => [(lng - lng0) * kx, (lat - lat0) * M_PER_DEG_LAT],
    toLatLng: ([x, y]) => [lat0 + y / M_PER_DEG_LAT, lng0 + x / kx],
  }
}

export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const dLat = (lat2 - lat1) * RAD
  const dLng = (lng2 - lng1) * RAD
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

/** Compass bearing (0 = north, clockwise) from a to b. */
export function bearingDeg(a, b) {
  const p = projector(a)
  const [x, y] = p.toXY(b)
  return (Math.atan2(x, y) / RAD + 360) % 360
}

/** Point `distM` metres from p on compass bearing `deg`. */
export function destination(p, deg, distM) {
  const pr = projector(p)
  return pr.toLatLng([Math.sin(deg * RAD) * distM, Math.cos(deg * RAD) * distM])
}

export const unit = (deg) => [Math.sin(deg * RAD), Math.cos(deg * RAD)] // x east, y north
export const normDeg = (d) => ((d % 360) + 360) % 360
export const angleDiff = (a, b) => {
  const d = Math.abs(normDeg(a) - normDeg(b))
  return d > 180 ? 360 - d : d
}

// ---------------------------------------------------------------------------
// Conversions
// ---------------------------------------------------------------------------

export const toGJ = (ring) => ring.map(([lat, lng]) => [lng, lat])
export const fromGJ = (ring) => ring.map(([lng, lat]) => [lat, lng])
export const closeRing = (ring) => {
  const [a, b] = [ring[0], ring[ring.length - 1]]
  return a[0] === b[0] && a[1] === b[1] ? ring : [...ring, a]
}
export const openRing = (ring) => {
  const [a, b] = [ring[0], ring[ring.length - 1]]
  return a[0] === b[0] && a[1] === b[1] ? ring.slice(0, -1) : ring
}

/** [lat,lng] ring → turf Polygon feature. */
export const polyFeature = (ring, props = {}) => turf.polygon([closeRing(toGJ(ring))], props)
export const lineFeature = (pts, props = {}) => turf.lineString(toGJ(pts), props)

export const roundRing = (ring) => ring.map(([a, b]) => [round5(a), round5(b)])

/** Polygon area in hectares from a [lat,lng] ring. */
export function areaHa(ring) {
  return turf.area(polyFeature(ring)) / 10000
}

/** Area in hectares of any turf (Multi)Polygon feature or geometry. */
export const featureAreaHa = (f) => (f ? turf.area(f) / 10000 : 0)

export function pointInRing([lat, lng], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function bboxOf(points) {
  let s = Infinity
  let w = Infinity
  let n = -Infinity
  let e = -Infinity
  for (const [lat, lng] of points) {
    if (lat < s) s = lat
    if (lat > n) n = lat
    if (lng < w) w = lng
    if (lng > e) e = lng
  }
  return { s, w, n, e }
}

export const centroidOf = (ring) => {
  const c = turf.centroid(polyFeature(ring)).geometry.coordinates
  return [round5(c[1]), round5(c[0])]
}

// ---------------------------------------------------------------------------
// Lines
// ---------------------------------------------------------------------------

export function polylineLengthKm(pts) {
  let km = 0
  for (let i = 1; i < pts.length; i++) km += haversineKm(pts[i - 1], pts[i])
  return km
}

/** Points every `stepM` metres along a polyline (first point included). */
export function resamplePolyline(pts, stepM) {
  const out = [pts[0]]
  let carry = 0
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const segM = haversineKm(a, b) * 1000
    let d = stepM - carry
    while (d <= segM) {
      const t = d / segM
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
      d += stepM
    }
    carry = (carry + segM) % stepM
  }
  return out
}

/** A route through waypoints with gentle seeded meanders, so lines do not look ruled. */
export function meanderRoute(rng, waypoints, { stepM = 1500, amplitudeM = 350 } = {}) {
  const out = []
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1]
    const b = waypoints[i]
    const segM = haversineKm(a, b) * 1000
    const n = Math.max(1, Math.round(segM / stepM))
    const brg = bearingDeg(a, b)
    const phase = rng.between(0, Math.PI * 2)
    for (let k = i === 1 ? 0 : 1; k <= n; k++) {
      const t = k / n
      const base = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
      const edge = k === 0 || k === n
      const off = edge ? 0 : Math.sin(phase + t * Math.PI * 2.3) * amplitudeM * (0.6 + 0.4 * rng.next())
      out.push(off === 0 ? base : destination(base, brg + 90, off))
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Irregular polygons
// ---------------------------------------------------------------------------

/**
 * Irregular blob around `center` with mean radius `radiusM`: a sum of low harmonics,
 * elongated by `aspect` along `axisDeg`. Returns a [lat,lng] ring (open).
 */
export function blobPolygon(rng, center, radiusM, { vertices = 48, roughness = 0.18, aspect = 1, axisDeg = 0 } = {}) {
  const p = projector(center)
  const harmonics = [2, 3, 4, 5, 7].map((k) => ({ k, amp: (roughness / Math.sqrt(k)) * rng.between(0.4, 1), phase: rng.between(0, Math.PI * 2) }))
  const ring = []
  const ax = axisDeg * RAD
  for (let i = 0; i < vertices; i++) {
    const t = (i / vertices) * Math.PI * 2
    let r = 1
    for (const h of harmonics) r += h.amp * Math.sin(h.k * t + h.phase)
    r *= radiusM * (1 + rng.between(-0.03, 0.03))
    // Ellipse stretch in a frame rotated by the axis bearing.
    const lx = Math.cos(t) * r * Math.sqrt(aspect)
    const ly = Math.sin(t) * r / Math.sqrt(aspect)
    const x = lx * Math.sin(ax) + ly * Math.cos(ax)
    const y = lx * Math.cos(ax) - ly * Math.sin(ax)
    ring.push(p.toLatLng([x, y]))
  }
  return ring
}

/** Scale a blob so its area is `targetHa` (about its own centroid). */
export function scaleRingToArea(ring, targetHa) {
  const k = Math.sqrt(targetHa / areaHa(ring))
  const c = centroidOf(ring)
  const p = projector(c)
  return ring.map((pt) => {
    const [x, y] = p.toXY(pt)
    return p.toLatLng([x * k, y * k])
  })
}

/** Rectangle (4 points) centred on `center`, `w` × `d` metres, rotated to bearing `rotDeg`. */
export function rectangle(center, w, d, rotDeg) {
  const p = projector(center)
  const a = rotDeg * RAD
  const ux = [Math.sin(a), Math.cos(a)] // along the street
  const uy = [Math.cos(a), -Math.sin(a)] // across the street
  const corners = [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ]
  return corners.map(([s, t]) => p.toLatLng([ux[0] * s + uy[0] * t, ux[1] * s + uy[1] * t]))
}

/** Circle ring of `n` vertices in [lat,lng]. */
export function circleRing(center, radiusM, n = 36) {
  const out = []
  for (let i = 0; i < n; i++) out.push(destination(center, (i / n) * 360, radiusM))
  return out
}

/**
 * Lots on a jittered, gently curving street grid inside `ring`.
 * Returns `count` placements { pos, rotDeg, street, lot } in street order.
 */
export function streetGrid(rng, ring, count, { lotSpacingM, streetSpacingM, rotDeg, curve = 0.25 } = {}) {
  const center = centroidOf(ring)
  const p = projector(center)
  const local = ring.map(p.toXY)
  const xs = local.map((q) => q[0])
  const ys = local.map((q) => q[1])
  const rmax = Math.max(...xs.map((x, i) => Math.hypot(x, ys[i]))) * 1.05
  const a = rotDeg * RAD
  const along = [Math.sin(a), Math.cos(a)]
  const across = [Math.cos(a), -Math.sin(a)]
  const inside = (pt) => pointInRing(pt, ring)
  const candidates = []
  const nStreets = Math.ceil((2 * rmax) / streetSpacingM)
  const nLots = Math.ceil((2 * rmax) / lotSpacingM)
  const wave = { amp: streetSpacingM * curve * rng.between(0.6, 1.2), len: rng.between(600, 1400), phase: rng.between(0, 6.28) }
  for (let s = 0; s <= nStreets; s++) {
    const v0 = -rmax + s * streetSpacingM
    // Lots sit on both sides of each street, a quarter-spacing off the centre line.
    for (const side of [-1, 1]) {
      for (let l = 0; l <= nLots; l++) {
        const u = -rmax + l * lotSpacingM + rng.between(-0.18, 0.18) * lotSpacingM
        const bend = wave.amp * Math.sin((u / wave.len) * Math.PI * 2 + wave.phase + s * 0.35)
        const v = v0 + bend + side * streetSpacingM * 0.24 + rng.between(-0.08, 0.08) * streetSpacingM
        const x = along[0] * u + across[0] * v
        const y = along[1] * u + across[1] * v
        const pos = p.toLatLng([x, y])
        if (!inside(pos)) continue
        // Street tangent: derivative of the bend gives the local rotation.
        const slope = (wave.amp * Math.cos((u / wave.len) * Math.PI * 2 + wave.phase + s * 0.35) * Math.PI * 2) / wave.len
        candidates.push({ pos, rotDeg: normDeg(rotDeg + (Math.atan(slope) / RAD) * -1), street: s * 2 + (side > 0 ? 1 : 0), lot: l, side })
      }
    }
  }
  if (candidates.length < count) return null
  // Thin evenly to the exact count, keeping street order for addresses.
  const keep = rng.shuffle(candidates.map((_, i) => i)).slice(0, count).sort((x, y) => x - y)
  return keep.map((i) => candidates[i])
}

// ---------------------------------------------------------------------------
// Turf wrappers
// ---------------------------------------------------------------------------

/** Buffer a [lat,lng] polyline by `m` metres → [lat,lng] outer ring of the result. */
export function bufferLine(pts, m, steps = 4) {
  const b = turf.buffer(lineFeature(pts), m / 1000, { units: 'kilometers', steps })
  const geom = b.geometry
  const ring = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates.sort((x, y) => y[0].length - x[0].length)[0][0]
  return openRing(fromGJ(ring))
}

export function bufferFeature(f, m, steps = 4) {
  return turf.buffer(f, m / 1000, { units: 'kilometers', steps })
}

/** Largest outer ring of a (Multi)Polygon feature as [lat,lng]. */
export function largestRing(f) {
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  let best = null
  let bestA = -1
  for (const poly of polys) {
    const a = turf.area(turf.polygon(poly))
    if (a > bestA) {
      bestA = a
      best = poly[0]
    }
  }
  return openRing(fromGJ(best))
}

/** Round every coordinate of a GeoJSON geometry's rings to 5 decimals and return [lat,lng] polygons. */
export function geometryToLatLngPolys(geom) {
  if (!geom) return []
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []
  return polys.map((poly) => poly.map((ring) => roundRing(openRing(fromGJ(ring)))))
}
