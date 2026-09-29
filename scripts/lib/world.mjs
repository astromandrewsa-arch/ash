// Builds the book's world: 100 areas, ~49,500 homes, utility assets and ranches (CLAUDE.md §5–6).

import * as turf from '@turf/turf'
import { makeRng } from './rng.mjs'
import {
  areaHa, blobPolygon, bufferLine, centroidOf, circleRing, destination, fromGJ, haversineKm, largestRing, lineFeature,
  meanderRoute, openRing, pointInRing, polyFeature, polylineLengthKm, projector, rectangle, resamplePolyline, round,
  round5, roundRing, scaleRingToArea, streetGrid, sum, toGJ,
} from './geo.mjs'
import { streetNamer } from './text.mjs'
import { BUNDLES, HOME_PLACES, RANCH_AREAS, UTILITY_AREAS } from '../config/places.mjs'

// Market rate per $1,000 TIV by bundle (§15); Austin North is not in the table, set just under Austin Lake.
export const MARKET_RATE = {
  'austin-lake': 6.1, 'austin-north': 5.9, 'hill-country-west': 6.7, 'lost-pines': 7.3, 'cross-timbers': 8.2,
  'panhandle-north': 8.9, 'permian-rolling-plains': 6.9, 'oklahoma-central': 7.5, 'osage-rangeland': 5.5,
}
// Commercial wildfire rates per $1,000 for assets (utilities are not in a homes bundle's premium).
const ASSET_RATE = { line: 1.6, pipeline: 0.9, refinery: 0.55, tankfarm: 0.6, wind: 0.8, substation: 1.1 }

const CONSTRUCTION = {
  austin: [['Masonry', 0.55], ['Frame', 0.35], ['Steel', 0.1]],
  town: [['Frame', 0.55], ['Masonry', 0.38], ['Steel', 0.07]],
  panhandle: [['Frame', 0.62], ['Masonry', 0.32], ['Steel', 0.06]],
  oklahoma: [['Frame', 0.6], ['Masonry', 0.33], ['Steel', 0.07]],
}

/** Water polygons (turf features) near a point, for clipping clusters to land. */
function waterNear(water, center, km) {
  return water.filter((f) => {
    const [w, s, e, n] = turf.bbox(f)
    const [lat, lng] = center
    const dLat = km / 111
    const dLng = km / (111 * Math.cos((lat * Math.PI) / 180))
    return !(e < lng - dLng || w > lng + dLng || n < lat - dLat || s > lat + dLat)
  })
}

function clipToLand(ring, water) {
  let f = polyFeature(ring)
  for (const w of water) {
    const d = turf.difference(turf.featureCollection([f, w]))
    if (!d) return null
    f = d
  }
  return largestRing(f)
}

/** Shoreline sample points (every ~60 m) of the given water features within `bbox` ± margin. */
function shorelinePoints(water, ring, marginM = 900) {
  const lats = ring.map((p) => p[0])
  const lngs = ring.map((p) => p[1])
  const dLat = marginM / 111320
  const dLng = marginM / (111320 * Math.cos((lats[0] * Math.PI) / 180))
  const box = { s: Math.min(...lats) - dLat, n: Math.max(...lats) + dLat, w: Math.min(...lngs) - dLng, e: Math.max(...lngs) + dLng }
  const pts = []
  for (const f of water) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const poly of polys) {
      for (const r of poly) {
        for (let i = 1; i < r.length; i++) {
          const [lng1, lat1] = r[i - 1]
          const [lng2, lat2] = r[i]
          if ((lat1 < box.s && lat2 < box.s) || (lat1 > box.n && lat2 > box.n) || (lng1 < box.w && lng2 < box.w) || (lng1 > box.e && lng2 > box.e)) continue
          const segM = haversineKm([lat1, lng1], [lat2, lng2]) * 1000
          const n = Math.max(1, Math.ceil(segM / 60))
          for (let k = 0; k < n; k++) pts.push([lat1 + ((lat2 - lat1) * k) / n, lng1 + ((lng2 - lng1) * k) / n])
        }
      }
    }
  }
  return pts
}

function nearestM(pt, pts) {
  const kx = 111320 * Math.cos((pt[0] * Math.PI) / 180)
  let best = Infinity
  for (const q of pts) {
    const dx = (q[1] - pt[1]) * kx
    const dy = (q[0] - pt[0]) * 111320
    const d = dx * dx + dy * dy
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

// ---------------------------------------------------------------------------
// Homes areas
// ---------------------------------------------------------------------------

function clusterCentroids(rng, place) {
  const n = place.clusters.length
  const base = rng.between(0, 360)
  return place.clusters.map((c, i) => {
    if (c.at) return c.at
    if (place.key === 'PKL') return PK_CLUSTERS[i]
    const single = n === 1
    const dist = place.group === 'austin' ? (single ? rng.between(250, 650) : rng.between(1100, 1700)) : rng.between(2300, 3300)
    return destination(place.centroid, base + (i * 360) / n + rng.between(-25, 25), dist)
  })
}

// Possum Kingdom: lake-shore clusters on the peninsulas south of the dam reach (see DECISIONS.md).
const PK_CLUSTERS = [[32.8705, -98.4745], [32.8465, -98.4335], [32.8835, -98.4355]]

function makeHomesArea(place, i, center, water, others) {
  const cluster = place.clusters[i]
  const id = `${place.key}-${i + 1}`
  const rng = makeRng(`cluster:${id}`)
  let ha = cluster.homes / place.density
  const minHa = (Math.PI * 750 * 750) / 1e4
  const maxHa = (Math.PI * 2000 * 2000) / 1e4
  ha = Math.min(maxHa, Math.max(minHa, ha))
  const radius = Math.sqrt((ha * 1e4) / Math.PI)
  let ring = blobPolygon(rng, center, radius, { vertices: 44, roughness: 0.15, aspect: rng.between(1.05, 1.5), axisDeg: rng.between(0, 180) })
  ring = scaleRingToArea(ring, ha)
  const wet = waterNear(water, center, 6)
  if (wet.length) ring = clipToLand(ring, wet) || ring
  // Keep clusters from overlapping their neighbours.
  for (const other of others) {
    if (haversineKm(center, other.center) > 9) continue
    const d = turf.difference(turf.featureCollection([polyFeature(ring), polyFeature(other.ring)]))
    if (d) ring = largestRing(d)
  }
  return {
    id,
    placeKey: place.key,
    name: place.clusters.length > 1 ? `${place.name} ${i + 1}` : place.name,
    place: place.name,
    state: place.state || 'TX',
    type: 'homes',
    group: place.group,
    bundleId: place.bundle,
    county: place.county,
    ring,
    anchor: center,
    homesTarget: cluster.homes,
    avgTiv: cluster.avgTiv,
    lakeBonus: place.lakeBonus || 0,
    realHook: place.hook,
    fireHistory: place.history,
    constructionMix: place.group === 'austin' ? 'austin' : place.group === 'oklahoma' ? 'oklahoma' : place.bundle === 'panhandle-north' ? 'panhandle' : 'town',
    water: wet,
  }
}

function buildHomesAreas(water, log) {
  const areas = []
  const taken = []
  for (const place of HOME_PLACES) {
    const rng = makeRng(`place:${place.key}`)
    const centers = clusterCentroids(rng, place)
    place.clusters.forEach((_, i) => {
      const area = makeHomesArea(place, i, centers[i], water, taken)
      taken.push({ center: centers[i], ring: area.ring })
      areas.push(area)
    })
  }
  log.push(`homes areas: ${areas.length}`)
  return areas
}

/** Homes on a street grid inside one cluster; ids continue from `startSeq`. */
function makeHomes(area, startSeq) {
  const homes = []
  let seq = startSeq
  const rng = makeRng(`homes:${area.id}`)
  const haNow = areaHa(area.ring)
  const density = area.homesTarget / haNow
  let lot = Math.sqrt(20000 / (1.35 * density * 2.1))
  let placements = null
  const rotDeg = rng.between(0, 180)
  for (let k = 0; k < 14 && !placements; k++) {
    placements = streetGrid(rng, area.ring, area.homesTarget, { lotSpacingM: lot, streetSpacingM: lot * 2.1, rotDeg, curve: 0.22 })
    lot *= 0.92
  }
  if (!placements) throw new Error(`could not place ${area.homesTarget} homes in ${area.id}`)
  const name = streetNamer(rng)
  const mix = CONSTRUCTION[area.constructionMix]
  const shore = area.lakeBonus && area.water.length ? shorelinePoints(area.water, area.ring) : []
  const raw = placements.map((p) => {
    const waterM = shore.length ? nearestM(p.pos, shore) : Infinity
    const lake = area.lakeBonus && waterM < 700 ? 1 + area.lakeBonus * (1 - waterM / 700) : 1
    return { p, value: rng.lognormal(1, 0.26) * lake }
  })
  const mean = sum(raw, (r) => r.value) / raw.length
  for (const { p, value } of raw) {
    seq++
    const w = rng.between(12, 20)
    const d = rng.between(10, 16)
    const rot = p.rotDeg + rng.between(-6, 6)
    const tiv = Math.round((area.avgTiv * value) / mean / 1000) * 1000
    const construction = rng.weighted(mix)
    const newer = area.group === 'austin' ? 1990 : 1965
    homes.push({
      id: `H${String(seq).padStart(5, '0')}`,
      areaId: area.id,
      footprint: roundRing(rectangle(p.pos, w, d, rot)),
      centroid: [round5(p.pos[0]), round5(p.pos[1])],
      address: `${100 + p.lot * 6 + (p.side > 0 ? 1 : 0)} ${name(p.street)}`,
      tiv,
      premium: 0,
      construction,
      yearBuilt: Math.round(rng.between(newer, 2024)),
      roofClass: rng.weighted([['A', 0.46], ['B', 0.34], ['C', 0.2]]),
      defensibleSpaceM: Math.round(rng.between(3, 42)),
      protectedState: null,
    })
  }
  return homes
}

function buildHomes(areas, log) {
  const homes = []
  for (const area of areas) homes.push(...makeHomes(area, homes.length))
  log.push(`homes: ${homes.length}`)
  return homes
}

/** Totals and premium for one homes area: premium is the bundle market rate on TIV, ±8% by policy. */
function finalizeHomesArea(area, list) {
  const rng = makeRng(`premium:${area.id}`)
  for (const h of list) h.premium = Math.round((h.tiv * MARKET_RATE[area.bundleId] * rng.between(0.92, 1.08)) / 1000)
  area.homes = list.length
  area.tiv = sum(list, (h) => h.tiv)
  area.premium = sum(list, (h) => h.premium)
  area.avgTiv = Math.round(area.tiv / list.length)
  area.hectares = Math.round(areaHa(area.ring))
  area.centroid = centroidOf(area.ring)
}

/**
 * Move one homes cluster to `center` and rebuild its polygon and homes in place (same ids).
 * Used to fit a dated fire's exposure to the §7 table after the spread has been simulated.
 */
export function relocateCluster(world, areaId, center) {
  const idx = world.areas.findIndex((a) => a.id === areaId)
  const old = world.areas[idx]
  const place = HOME_PLACES.find((p) => p.key === old.placeKey)
  const i = Number(areaId.split('-').pop()) - 1
  const others = world.areas.filter((a) => a.type === 'homes' && a.id !== areaId).map((a) => ({ center: a.centroid, ring: a.ring }))
  const area = makeHomesArea(place, i, center, world.water, others)
  const oldHomes = world.homesByArea.get(areaId)
  const startSeq = Number(oldHomes[0].id.slice(1)) - 1
  const list = makeHomes(area, startSeq)
  finalizeHomesArea(area, list)
  area.sensors = addSensors(area, world.assets)
  world.areas[idx] = area
  const firstIdx = world.homes.findIndex((h) => h.id === oldHomes[0].id)
  world.homes.splice(firstIdx, list.length, ...list)
  world.homesByArea.set(areaId, list)
  return area
}

// ---------------------------------------------------------------------------
// Utility assets
// ---------------------------------------------------------------------------

function selectTurbines(turbines, def) {
  // Real turbine positions (US Wind Turbine Database): the 627 nearest the stated Roscoe centroid,
  // and the Wildorado project's own 70.
  const pool = turbines.features.filter((f) => (def.key === 'ROS' ? f.properties.farm === 'roscoe' : f.properties.farm === 'wildorado' && /wildorado/i.test(f.properties.project)))
  const pts = pool.map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]])
  pts.sort((a, b) => haversineKm(a, def.center) - haversineKm(b, def.center))
  return pts.slice(0, def.turbines).map(([a, b]) => [round5(a), round5(b)])
}

function buildAssets(turbines, log) {
  const assets = []
  const areas = []
  for (const def of UTILITY_AREAS) {
    const rng = makeRng(`asset:${def.key}`)
    const id = `U-${def.key}`
    const asset = { id: `A-${def.key}`, areaId: id, kind: def.kind, name: def.name, operator: def.operator, tiv: def.tiv, ignitionHistory: def.history, wmpStatus: def.wmp }
    let areaRing
    if (def.kind === 'line' || def.kind === 'pipeline') {
      let route = meanderRoute(rng, def.route, { stepM: 1200, amplitudeM: def.kind === 'line' ? 160 : 90 }).map(([a, b]) => [round5(a), round5(b)])
      if (def.segmentKm) route = truncateRoute(route, def.segmentKm)
      asset.geometry = route
      asset.km = round(polylineLengthKm(route), 1)
      asset.poles = def.kind === 'line' ? resamplePolyline(route, 90).map(([a, b]) => [round5(a), round5(b)]) : []
      if (def.stations) {
        const kmMarks = def.key === 'BASIN' ? [5, 17, 29, 41, 95, 150] : [20, 60, 100]
        asset.stations = kmMarks.slice(0, def.key === 'BASIN' ? 6 : def.stations).map((km, i) => ({ name: `${def.key === 'BASIN' ? 'Basin' : 'Permian Express'} pump station ${i + 1}`, pos: pointAtKm(route, km), km }))
      }
      areaRing = bufferLine(route, def.kind === 'line' ? 150 : 120, 3)
    } else if (def.kind === 'substation') {
      asset.geometry = [round5(def.center[0]), round5(def.center[1])]
      areaRing = circleRing(def.center, 320, 28)
    } else if (def.kind === 'wind') {
      const tur = selectTurbines(turbines, def)
      asset.turbines = tur
      const hull = turf.convex(turf.featureCollection(tur.map(([a, b]) => turf.point([b, a]))))
      const grown = turf.buffer(hull, 0.9, { units: 'kilometers', steps: 4 })
      areaRing = openRing(fromGJ(grown.geometry.coordinates[0]))
      asset.geometry = roundRing(areaRing)
      asset.turbineCount = tur.length
    } else {
      const ha = def.acres * 0.4047
      let ring = blobPolygon(rng, def.center, Math.sqrt((ha * 1e4) / Math.PI), { vertices: 28, roughness: 0.1, aspect: rng.between(1.2, 1.6), axisDeg: rng.between(0, 180) })
      ring = scaleRingToArea(ring, ha)
      asset.geometry = roundRing(ring)
      areaRing = ring
    }
    if (def.capacity) asset.capacity = def.capacity
    assets.push(asset)
    areas.push({
      id,
      placeKey: def.key,
      name: def.name,
      place: def.name,
      state: def.state,
      type: 'utility',
      group: def.state === 'OK' ? 'oklahoma' : 'utility',
      bundleId: def.bundle,
      county: def.county,
      ring: areaRing,
      tiv: def.tiv,
      premium: Math.round((def.tiv * ASSET_RATE[def.kind]) / 1000),
      realHook: def.hook,
      fireHistory: def.fireHistory,
      assetIds: [asset.id],
    })
  }
  log.push(`assets: ${assets.length} (${sum(assets, (a) => a.poles?.length || 0)} poles)`)
  return { assets, areas }
}

function truncateRoute(route, km) {
  const out = [route[0]]
  let acc = 0
  for (let i = 1; i < route.length; i++) {
    const seg = haversineKm(route[i - 1], route[i])
    if (acc + seg >= km) {
      out.push(pointAtKm(route, km))
      return out
    }
    acc += seg
    out.push(route[i])
  }
  return out
}

export function pointAtKm(route, km) {
  let acc = 0
  for (let i = 1; i < route.length; i++) {
    const seg = haversineKm(route[i - 1], route[i])
    if (acc + seg >= km) {
      const t = (km - acc) / seg
      return [round5(route[i - 1][0] + (route[i][0] - route[i - 1][0]) * t), round5(route[i - 1][1] + (route[i][1] - route[i - 1][1]) * t)]
    }
    acc += seg
  }
  return route[route.length - 1]
}

// ---------------------------------------------------------------------------
// Ranches
// ---------------------------------------------------------------------------

const FORAGE_PER_AC = { TX: 60, OK: 85 }

function randomInside(rng, ring, near = null, spreadM = 0) {
  const lats = ring.map((p) => p[0])
  const lngs = ring.map((p) => p[1])
  for (let k = 0; k < 400; k++) {
    const pt = near && spreadM
      ? destination(near, rng.between(0, 360), Math.abs(rng.normal()) * spreadM)
      : [rng.between(Math.min(...lats), Math.max(...lats)), rng.between(Math.min(...lngs), Math.max(...lngs))]
    if (pointInRing(pt, ring)) return pt
  }
  return centroidOf(ring)
}

function buildRanches(water, log) {
  const ranches = []
  const areas = []
  const taken = []
  for (const def of RANCH_AREAS) {
    const rng = makeRng(`ranch:${def.key}`)
    const ha = def.acres * 0.4047
    const shapeCenter = def.shift ? destination(def.center, def.shift[0], def.shift[1]) : def.center
    let ring = blobPolygon(rng, shapeCenter, Math.sqrt((ha * 1e4) / Math.PI), { vertices: 40, roughness: 0.2, aspect: rng.between(1.1, 1.5), axisDeg: def.axisDeg ?? rng.between(0, 180) })
    ring = scaleRingToArea(ring, ha)
    for (const other of taken) {
      if (haversineKm(def.center, other.center) > 80) continue
      const d = turf.difference(turf.featureCollection([polyFeature(ring), polyFeature(other.ring)]))
      if (d) ring = largestRing(d)
    }
    const wet = waterNear(water, def.center, 40)
    if (wet.length) ring = clipToLand(ring, wet) || ring
    taken.push({ center: def.center, ring })

    // Pastures on a rough grid; fences are the grid lines inside the boundary plus the boundary.
    const k = Math.ceil(Math.sqrt(def.pastures))
    const c = centroidOf(ring)
    const pr = projector(c)
    const local = ring.map(pr.toXY)
    const minX = Math.min(...local.map((q) => q[0]))
    const maxX = Math.max(...local.map((q) => q[0]))
    const minY = Math.min(...local.map((q) => q[1]))
    const maxY = Math.max(...local.map((q) => q[1]))
    const fencePts = []
    const sample = (a, b) => {
      const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 250))
      for (let i = 0; i <= n; i++) {
        const pt = pr.toLatLng([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n])
        if (pointInRing(pt, ring)) fencePts.push(pt)
      }
    }
    for (let i = 1; i < k; i++) {
      const x = minX + ((maxX - minX) * i) / k + rng.between(-0.08, 0.08) * (maxX - minX) / k
      sample([x, minY], [x, maxY])
      const y = minY + ((maxY - minY) * i) / k + rng.between(-0.08, 0.08) * (maxY - minY) / k
      sample([minX, y], [maxX, y])
    }
    for (let i = 0; i < ring.length; i++) {
      const a = pr.toXY(ring[i])
      const b = pr.toXY(ring[(i + 1) % ring.length])
      const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 250))
      for (let j = 0; j < n; j++) fencePts.push(pr.toLatLng([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]))
    }
    const fenceKm = Math.round(fencePts.length * 0.25)

    const structures = []
    const hqCount = def.hqAt ? def.hqAt.length : def.hq
    for (let i = 0; i < hqCount; i++) {
      const pos = def.hqAt ? def.hqAt[i] : randomInside(rng, ring)
      structures.push({ name: i === 0 ? `${def.name} headquarters` : `${def.name} camp ${i}`, pos: pos.map(round5), tiv: i === 0 ? 3.4e6 : 1.3e6 })
    }
    // Herds: groups of about 40 head spread over the pastures; bison run as one concentrated herd.
    const herds = []
    const groups = Math.max(10, Math.round(def.cattle / 40))
    for (let i = 0; i < groups; i++) {
      // Fall grazing concentrates a share of the herd on the stated pastures.
      const near = def.herdCenter && i < groups * def.herdShare
      herds.push({ kind: 'cattle', head: def.cattle / groups, pos: near ? randomInside(rng, ring, def.herdCenter, def.herdSpreadM) : randomInside(rng, ring) })
    }
    if (def.bison) {
      // The preserve's bison graze the south unit where OK-09 is dated.
      const herdCenter = def.key === 'TGP' ? [36.816, -96.43] : randomInside(rng, ring)
      for (let i = 0; i < Math.round(def.bison / 25); i++) herds.push({ kind: 'bison', head: 25, pos: randomInside(rng, ring, herdCenter, def.key === 'TGP' ? 1100 : 1600) })
    }
    const acres = def.acres
    const components = {
      structures: sum(structures, (s) => s.tiv),
      fencing: fenceKm * 9500,
      livestock: def.cattle * 2200 + (def.bison || 0) * 3000,
      forage: acres * FORAGE_PER_AC[def.state],
    }
    const id = `R-${def.key}`
    ranches.push({
      id: `RN-${def.key}`,
      areaId: id,
      name: def.name,
      acres,
      pastures: def.pastures,
      lastBurnYear: def.lastBurnYear,
      cattle: def.cattle,
      bison: def.bison || 0,
      fenceKm,
      headquarters: structures[0].pos,
      structures,
      components,
      tiv: sum(Object.values(components)),
      notes: def.notes,
      _fencePts: fencePts,
      _herds: herds,
    })
    areas.push({
      id,
      placeKey: def.key,
      name: def.name,
      place: def.name,
      state: def.state,
      type: 'rangeland',
      group: def.state === 'OK' ? 'oklahoma' : 'ranch',
      bundleId: def.bundle,
      county: def.county,
      ring,
      realHook: def.hook,
      fireHistory: def.fireHistory,
      ranchId: `RN-${def.key}`,
      patchBurn: !!def.patchBurn,
    })
  }
  log.push(`ranches: ${ranches.length}`)
  return { ranches, areas }
}

/** Scale ranch TIVs so Texas rangeland totals $0.6B (§6) and the Osage bundle $0.2B (§15). */
function scaleRanches(ranches) {
  const targets = [
    { match: (r) => !['RN-TGP', 'RN-OSB', 'RN-OSG'].includes(r.id), total: 0.6e9 },
    { match: (r) => ['RN-TGP', 'RN-OSB', 'RN-OSG'].includes(r.id), total: 0.2e9 },
  ]
  for (const t of targets) {
    const set = ranches.filter(t.match)
    const k = t.total / sum(set, (r) => r.tiv)
    for (const r of set) {
      r.valueScale = k
      for (const key of Object.keys(r.components)) r.components[key] = Math.round(r.components[key] * k)
      r.structures.forEach((s) => (s.tiv = Math.round(s.tiv * k)))
      r.tiv = sum(Object.values(r.components))
    }
  }
}

// ---------------------------------------------------------------------------
// Sensors (6–10 per area)
// ---------------------------------------------------------------------------

function addSensors(area, assets) {
  const rng = makeRng(`sensors:${area.id}`)
  const n = rng.int(6, 10)
  const types = [['fuel', 0.5], ['weather', 0.3], ['camera', 0.2]]
  const sensors = []
  const asset = area.assetIds ? assets.find((a) => a.id === area.assetIds[0]) : null
  for (let i = 0; i < n; i++) {
    let pos
    if (asset && Array.isArray(asset.geometry) && Array.isArray(asset.geometry[0]) && (asset.kind === 'line' || asset.kind === 'pipeline')) {
      const along = asset.geometry[Math.floor(((i + 0.5) / n) * asset.geometry.length)]
      pos = destination(along, rng.between(0, 360), rng.between(40, 130))
    } else {
      pos = randomInside(rng, area.ring)
    }
    sensors.push({ id: `${area.id}-S${i + 1}`, type: rng.weighted(types), pos: [round5(pos[0]), round5(pos[1])] })
  }
  return sensors
}

// ---------------------------------------------------------------------------

export function buildWorld({ water, turbines }) {
  const log = []
  const homesAreas = buildHomesAreas(water, log)
  const homes = buildHomes(homesAreas, log)
  const { assets, areas: utilityAreas } = buildAssets(turbines, log)
  const { ranches, areas: ranchAreas } = buildRanches(water, log)
  scaleRanches(ranches)

  // Homes-area totals and premium: premium is the bundle market rate on TIV, ±8% by policy.
  const homesByArea = new Map()
  for (const h of homes) {
    if (!homesByArea.has(h.areaId)) homesByArea.set(h.areaId, [])
    homesByArea.get(h.areaId).push(h)
  }
  for (const area of homesAreas) finalizeHomesArea(area, homesByArea.get(area.id))
  for (const area of ranchAreas) {
    const r = ranches.find((x) => x.id === area.ranchId)
    area.tiv = r.tiv
    area.premium = Math.round((r.tiv * MARKET_RATE[area.bundleId]) / 1000)
    area.homes = 0
  }
  for (const area of utilityAreas) area.homes = 0

  const areas = [...homesAreas, ...utilityAreas, ...ranchAreas]
  for (const area of areas) {
    area.hectares = Math.round(areaHa(area.ring))
    area.centroid = centroidOf(area.ring)
    area.sensors = addSensors(area, assets)
  }
  return { areas, homes, assets, ranches, homesByArea, log, bundles: BUNDLES, water }
}
