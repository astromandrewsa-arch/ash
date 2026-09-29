// Small client-side geometry helpers (the generator does the heavy lifting).
import L from 'leaflet'

export function boundsOfRing(ring) {
  return ring && ring.length ? L.latLngBounds(ring) : null
}

/** Bounds of a list of polygons, each a list of rings of [lat, lng]. */
export function boundsOfPolys(polys) {
  const pts = []
  for (const poly of polys || []) for (const p of poly[0] || []) pts.push(p)
  return pts.length ? L.latLngBounds(pts) : null
}

export function boundsOfAreas(areas) {
  const pts = []
  for (const a of areas) for (const p of a.polygon) pts.push(p)
  return pts.length ? L.latLngBounds(pts) : null
}

/** Where to look when a fire opens: its ignition zone, padded. */
export function fireFocusBounds(fire) {
  return L.latLngBounds(fire.ignitionZone.polygon.flat()).pad(0.35)
}

/** Centre of a fire's ignition zone (marker position). */
export function fireCenter(fire) {
  const ring = fire.ignitionZone.polygon[0]
  let lat = 0
  let lng = 0
  for (const [a, b] of ring) {
    lat += a
    lng += b
  }
  return [lat / ring.length, lng / ring.length]
}

export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = Math.PI / 180
  const dLat = (lat2 - lat1) * R
  const dLng = (lng2 - lng1) * R
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * R) * Math.cos(lat2 * R) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

export function pointInRing([lat, lng], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Distance in km from a point to the nearest vertex of a ring (good enough at map scale). */
export function distanceToRingKm(pt, ring) {
  if (pointInRing(pt, ring)) return 0
  let best = Infinity
  for (const v of ring) best = Math.min(best, haversineKm(pt, v))
  return best
}
