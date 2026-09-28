#!/usr/bin/env node
// Regenerates the Pyrome demo mock data in src/data.
// Run: node scripts/generateData.mjs
// Deterministic: every random draw comes from a seeded generator, so the output only
// changes when this file changes. Hand edits to generated files are overwritten.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = join(ROOT, 'src', 'data')

const SEED = 20260928
const ISSUE_DATE = '2026-09-28'
const PROBABILITY = 0.9 // PRIMER dates a hectare when accumulated probability reaches 90%
const SPREAD_CERTAINTY = 0.92
const DAMAGE_RATIO = [0.6, 0.8] // expected loss per engulfed home, ~70% of TIV on average
const REINSTATEMENT_RATE = 0.12 // reinsurance reinstatement premium avoided, share of loss avoided
const AAL_BASE_RATE = 0.0045 // baseline wildfire AAL as a share of book TIV
const AAL_RETURN_PERIOD_YEARS = 20 // a dated fire is priced into AAL over a 20-year view

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function hashString(str) {
  let h = 2166136261 ^ SEED
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function makeRng(label) {
  let a = hashString(label)
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const between = (lo, hi) => lo + (hi - lo) * next()
  return {
    next,
    between,
    int: (lo, hi) => Math.floor(between(lo, hi + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    weighted: (pairs) => {
      let r = next() * pairs.reduce((s, [, w]) => s + w, 0)
      for (const [value, w] of pairs) {
        if ((r -= w) <= 0) return value
      }
      return pairs[pairs.length - 1][0]
    },
    shuffle: (arr) => {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}

// ---------------------------------------------------------------------------
// Number, date and compass helpers
// ---------------------------------------------------------------------------

const round = (n, dp = 0) => Math.round(n * 10 ** dp) / 10 ** dp
const roundTo = (n, step) => Math.round(n / step) * step
const sum = (arr, fn = (x) => x) => arr.reduce((s, x) => s + fn(x), 0)

const DAY_MS = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parseDate = (iso) => new Date(`${iso}T00:00:00Z`)
const isoDate = (d) => d.toISOString().slice(0, 10)
const addDays = (iso, n) => isoDate(new Date(parseDate(iso).getTime() + n * DAY_MS))
const daysBetween = (from, to) => Math.round((parseDate(to) - parseDate(from)) / DAY_MS)
const dayMonth = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
function dateRange(start, end) {
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${Number(start.slice(8, 10))}–${Number(end.slice(8, 10))} ${MONTHS[Number(end.slice(5, 7)) - 1]}`
  }
  return `${dayMonth(start)}–${dayMonth(end)}`
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven']
const COMPASS16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const COMPASS8_WORDS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']
const normDeg = (d) => ((d % 360) + 360) % 360
const compass16 = (deg) => COMPASS16[Math.round(normDeg(deg) / 22.5) % 16]
const compass8Word = (deg) => COMPASS8_WORDS[Math.round(normDeg(deg) / 45) % 8]

// ---------------------------------------------------------------------------
// Geometry. Shapes are built in a local metric frame (x east, y north, metres)
// around an origin, then projected to [lat, lon].
// ---------------------------------------------------------------------------

const M_PER_DEG_LAT = 111320

function projector([lat0, lon0]) {
  const mPerDegLon = M_PER_DEG_LAT * Math.cos((lat0 * Math.PI) / 180)
  return {
    toXY: ([lat, lon]) => [(lon - lon0) * mPerDegLon, (lat - lat0) * M_PER_DEG_LAT],
    toLatLon: ([x, y], dp = 5) => [round(lat0 + y / M_PER_DEG_LAT, dp), round(lon0 + x / mPerDegLon, dp)],
    polygon: (pts, dp = 5) => pts.map(([x, y]) => [round(lat0 + y / M_PER_DEG_LAT, dp), round(lon0 + x / mPerDegLon, dp)]),
  }
}

const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const mul = (a, k) => [a[0] * k, a[1] * k]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
const len = (a) => Math.hypot(a[0], a[1])
const unitFromBearing = (deg) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)]
const rightOf = ([ux, uy]) => [uy, -ux]

function pointInPolygon([x, y], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function polygonAreaM2(poly) {
  let a = 0
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1]
  }
  return Math.abs(a) / 2
}

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const r = Math.PI / 180
  const dLat = (lat2 - lat1) * r
  const dLon = (lon2 - lon1) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

function boundsOf(latLonPolys) {
  const pts = latLonPolys.flat()
  const lats = pts.map((p) => p[0])
  const lons = pts.map((p) => p[1])
  return [
    [round(Math.min(...lats), 5), round(Math.min(...lons), 5)],
    [round(Math.max(...lats), 5), round(Math.max(...lons), 5)],
  ]
}

/**
 * Irregular blob of roughly 2 × radius across, centred on the origin, pushed out where
 * needed so every must-include point sits at least `margin` inside it.
 */
function blobPolygon(rng, radius, include = [], margin = 1000, vertices = 36) {
  const p = [rng.between(0, 6.28), rng.between(0, 6.28), rng.between(0, 6.28)]
  const pts = []
  for (let i = 0; i < vertices; i++) {
    const t = (i / vertices) * Math.PI * 2
    let r = radius * (1 + 0.1 * Math.sin(2 * t + p[0]) + 0.06 * Math.sin(3 * t + p[1]) + 0.03 * Math.sin(5 * t + p[2]))
    for (const q of include) {
      const bearing = Math.atan2(q[0], q[1])
      const gap = Math.abs(Math.atan2(Math.sin(t - bearing), Math.cos(t - bearing)))
      if (gap < 0.9) r = Math.max(r, (len(q) + margin) * (1 + 0.25 * gap))
    }
    pts.push([r * Math.sin(t), r * Math.cos(t)])
  }
  return pts
}

/**
 * Wind-driven fire perimeter: an ellipse with the ignition near its rear, roughened radially
 * around the ignition point. Every dimension scales with the head distance, so perimeters for
 * smaller head distances are nested inside larger ones.
 */
function firePerimeter(ignition, u, headM, shape, vertices = 72) {
  const back = shape.backRatio * headM
  const a = (headM + back) / 2
  const c = a / shape.lengthToBreadth
  const d = a - back // ignition sits d behind the ellipse centre
  const v = rightOf(u)
  const centre = add(ignition, mul(u, headM - a))
  const pts = []
  for (let i = 0; i < vertices; i++) {
    const t = (i / vertices) * Math.PI * 2
    const ex = a * Math.cos(t)
    const ey = c * Math.sin(t)
    const edge = add(centre, add(mul(u, ex), mul(v, ey)))
    const theta = Math.atan2(ey, ex + d)
    const f =
      1 +
      shape.amps[0] * Math.sin(3 * theta + shape.phases[0]) +
      shape.amps[1] * Math.sin(5 * theta + shape.phases[1]) +
      shape.amps[2] * Math.sin(2 * theta + shape.phases[2]) +
      shape.amps[3] * Math.sin(9 * theta + shape.phases[3]) +
      shape.amps[4] * Math.sin(14 * theta + shape.phases[4])
    pts.push(add(ignition, mul(sub(edge, ignition), f)))
  }
  return pts
}

function randomFireShape(rng, roughness = 1) {
  return {
    lengthToBreadth: rng.between(1.9, 2.4),
    backRatio: rng.between(0.07, 0.1),
    amps: [
      rng.between(0.05, 0.07) * roughness,
      rng.between(0.03, 0.045) * roughness,
      rng.between(0.02, 0.035) * roughness,
      rng.between(0.015, 0.025) * roughness,
      rng.between(0.008, 0.014) * roughness,
    ],
    phases: [0, 0, 0, 0, 0].map(() => rng.between(0, 6.28)),
  }
}

const scaleAbout = (poly, origin, k) => poly.map((p) => add(origin, mul(sub(p, origin), k)))

// ---------------------------------------------------------------------------
// Configuration: coverage areas, their dated fires and agent processes
// ---------------------------------------------------------------------------

const STREET_NAMES = [
  'Live Oak Dr', 'Mesquite Ln', 'Agarita Trl', 'Bluebonnet Way', 'Cedar Ridge Rd', 'Post Oak Dr',
  'Prickly Pear Ln', 'Sotol Ct', 'Juniper Bend', 'Pecan Hollow', 'Caliche Rd', 'Windmill Ln',
  'Longhorn Trl', 'Sage Hill Dr', 'Redbud Ln', 'Yaupon Way', 'Loblolly Ln', 'Shinnery Rd',
  'Buffalo Grass Dr', 'Lantana Ct', 'Hackberry Ln', 'Cypress Bend', 'Chalk Bluff Rd', 'Coyote Run',
  'Quail Hollow', 'Ranch Gate Rd', 'Turkey Creek Dr', 'Blackjack Oak Ln', 'Cottonwood Dr', 'Sandhill Rd',
  'Plum Creek Ln', 'Wagon Wheel Dr', 'Saddle Horn Trl', 'Bur Oak Ct', 'Mustang Ridge', 'Horseshoe Bend',
  'Arrowhead Trl', 'Red Rock Rd', 'Salt Grass Ln', 'Tumbleweed Ct', 'Prairie Wind Dr', 'Sycamore Ln',
]

const CONSTRUCTION = [
  ['Frame', 0.56, 0.0066],
  ['Masonry', 0.34, 0.0056],
  ['Steel', 0.1, 0.0052],
]

// Current dated fires: days out 6–29, windows 4–7 days, first called 30+ days ahead at a 14-day window.
const AREAS = [
  {
    id: 'hill-country', code: 'HC', name: 'Hill Country', nearTown: 'Fredericksburg', county: 'Gillespie County',
    center: [30.172, -98.968], radiusKm: 6.0, homes: 102,
    towns: [[30.183, -98.975], [30.1575, -98.9405], [30.14, -98.965]], tivMultiplier: 1.15,
    localities: ['Pedernales Bend', 'Live Oak Hills', 'Sunday Creek Ranch'],
    fire: {
      id: 'HC14', daysUntil: 14, windowDays: 4, leadDays: 33, windFromDeg: 225,
      fuel: 'cured grass', soil: 'sandy', creek: 'Live Oak Creek', costRange: [148000, 148000],
      // HC14 is the worked example in CLAUDE.md §5, so it carries those exact figures.
      fixed: {
        blockHa: 1200, seasonsUnburned: 2, roadDistanceM: 900, preventionProbability: 0.87,
        fuel: { live: 84, liveRate: 1.4, curing: 88, dead: 9, daysSinceRain: 41, liveGap: 3, deadGap: 2, curingGap: 4 },
        intensity: { kwm: 11400, flame: 4.2, ros: 3.1, wind: 32 },
      },
      action: ({ dir, blockId, humidity }) =>
        `Graze and cut 40 m firebreak on the ${dir} boundary` +
        (humidity ? `; prescribed burn of block ${blockId} in the ${humidity} humidity window` : ''),
    },
  },
  {
    id: 'panhandle', code: 'PH', name: 'Panhandle', nearTown: 'Amarillo', county: 'Randall County',
    center: [35.085, -102.09], radiusKm: 6.4, homes: 98,
    towns: [[35.085, -102.075], [35.12, -102.09], [35.048, -102.054]], tivMultiplier: 0.85,
    localities: ['Caprock Estates', 'Windmill Flats', 'Tierra Seca'],
    fire: {
      id: 'PH03', daysUntil: 6, windowDays: 5, leadDays: 31, windFromDeg: 255,
      fuel: 'cured shortgrass and wheat stubble', soil: 'clay loam', creek: 'Tierra Seca Draw', costRange: [90000, 140000],
      action: ({ dir }) => `Disc a 30 m mineral-soil break along the ${dir} fence line; mow and wet-line the county road verge`,
    },
  },
  {
    id: 'cross-timbers', code: 'CT', name: 'Cross Timbers', nearTown: 'Possum Kingdom Lake', county: 'Young County',
    center: [33.095, -98.47], radiusKm: 5.6, homes: 97,
    towns: [[33.1, -98.47], [33.11, -98.43], [33.085, -98.515]], tivMultiplier: 0.95,
    localities: ['Brazos Bluff', 'Post Oak Ridge', 'Blackjack Hollow'],
    fire: {
      id: 'CT22', daysUntil: 19, windowDays: 6, leadDays: 34, windFromDeg: 190,
      fuel: 'cured grass under post oak', soil: 'sandy loam', creek: 'Rock Hollow Creek', costRange: [180000, 260000],
      action: ({ dir }) => `Mechanically thin a 60 m post oak strip on the ${dir} edge; mow a 20 m break along the county road`,
    },
  },
  {
    id: 'bastrop', code: 'QD', name: 'Bastrop', nearTown: 'Bastrop', county: 'Bastrop County',
    center: [30.1, -97.23], radiusKm: 5.8, homes: 104,
    towns: [[30.108, -97.242], [30.097, -97.208], [30.075, -97.215]], tivMultiplier: 1.0,
    localities: ['Loblolly Ridge', 'Piney Creek Village', 'Colorado Bend'],
    fire: {
      id: 'QD71', daysUntil: 26, windowDays: 5, leadDays: 33, windFromDeg: 20,
      fuel: 'loblolly pine litter and yaupon', soil: 'deep sand', creek: 'Piney Creek', costRange: [280000, 400000],
      action: ({ dir }) => `Clear pine litter and yaupon from a 50 m shaded fuel break on the ${dir} boundary; chip slash on site`,
    },
  },
  {
    id: 'palo-pinto', code: 'PP', name: 'Palo Pinto', nearTown: 'Mineral Wells', county: 'Palo Pinto County',
    center: [32.885, -98.195], radiusKm: 5.4, homes: 99,
    towns: [[32.885, -98.19], [32.874, -98.154], [32.896, -98.226]], tivMultiplier: 0.9,
    localities: ['Ironwood Mesa', 'Brushy Knob', 'Grindstone Valley'],
    fire: {
      id: 'PP08', daysUntil: 9, windowDays: 4, leadDays: 32, windFromDeg: 200,
      fuel: 'mesquite and cured grass', soil: 'rocky clay', creek: 'Grindstone Creek', costRange: [110000, 170000],
      action: ({ dir }) => `Graze and shred a 40 m mesquite break on the ${dir} boundary; pre-position a TAMFS strike team for the window`,
    },
  },
  {
    id: 'wichita-falls', code: 'WF', name: 'Wichita Falls', nearTown: 'Wichita Falls', county: 'Wichita County',
    center: [34.005, -98.645], radiusKm: 6.0, homes: 101,
    towns: [[34.01, -98.63], [34.035, -98.67], [33.985, -98.6]], tivMultiplier: 0.85,
    localities: ['Red Bluff Ranch', 'Wichita Prairie', 'Mesquite Flats'],
    fire: {
      id: 'WF15', daysUntil: 29, windowDays: 7, leadDays: 30, windFromDeg: 245,
      fuel: 'cured grass and mesquite', soil: 'red clay loam', creek: 'Beaver Creek', costRange: [150000, 240000],
      action: ({ dir, blockId, humidity }) =>
        `Cut 40 m firebreak on the ${dir} boundary` +
        (humidity ? `; prescribed burn of block ${blockId} in the ${humidity} humidity window` : ''),
    },
  },
]

const STAGES = [
  { id: 'identified', label: 'Identified' },
  { id: 'engaged', label: 'Agent engaged' },
  { id: 'negotiation', label: 'Government in negotiation' },
  { id: 'agreed', label: 'Work agreed' },
  { id: 'complete', label: 'Work complete' },
  { id: 'prevented', label: 'Fire prevented' },
]
const RAG = { identified: 'red', engaged: 'amber', negotiation: 'amber', agreed: 'green', complete: 'green', prevented: 'green', declined: 'red' }
const FEED_GROUP = { identified: 'identified', engaged: 'negotiation', negotiation: 'negotiation', agreed: 'agreed', complete: 'agreed', prevented: 'prevented', declined: 'declined' }

const TAMFS = 'Texas A&M Forest Service'

// Agent processes. Day numbers are relative to the predicted fire date (Day 0).
// Entries on or before the forecast issue date are done; `planned` entries are the next action.
const PROCESSES = [
  {
    fireId: 'HC14', agent: 'Maria Delgado', region: 'Central Texas', landowner: 'R. Hollis', stage: 'agreed',
    primaryCounterpart: 'county',
    events: [
      [-33, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-31, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-28, 'negotiation', (c) => `${c.county} in negotiation to clear a woodland strip on the exact parcel; landowner contacted.`],
      [-26, 'declined', (c) => `${c.county} declined — budget.`],
      [-25, 'escalated', () => `${TAMFS} agreed to co-fund from its hazardous-fuels programme; county back at the table.`],
      [-22, 'agreed', () => 'Firebreak and burn window agreed.'],
      [-19, 'scheduled', () => 'Crew scheduled: TAMFS engine crew and county volunteer fire department.'],
      [-15, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [(c) => c.humidityStartDay, 'planned', (c) => `Prescribed burn of block ${c.blockId} (${c.humidity}).`],
    ],
  },
  {
    fireId: 'PH03', agent: 'Tom Whitaker', region: 'Panhandle', landowner: 'D. Brandt', stage: 'complete',
    primaryCounterpart: 'county',
    events: [
      [-31, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-30, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-27, 'negotiation', (c) => `${c.county} in negotiation to disc a mineral-soil break on the exact parcel; landowner contacted.`],
      [-23, 'agreed', () => 'Disced break and road-verge mowing agreed.'],
      [-20, 'scheduled', () => 'County road crew and landowner equipment scheduled.'],
      [-15, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-11, 'complete', () => '30 m break disced and county road verge mowed; TAMFS sign-off received.'],
      [(c) => c.windowEndDay + 1, 'planned', (c) => `Post-window verification of block ${c.blockId}.`],
    ],
  },
  {
    fireId: 'CT22', agent: 'Luis Ortega', region: 'North Texas', landowner: 'J. McAllister', stage: 'negotiation',
    primaryCounterpart: 'county',
    events: [
      [-34, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-32, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-29, 'negotiation', (c) => `${c.county} in negotiation to thin a post oak strip on the exact parcel; landowner contacted.`],
      [-24, 'declined', () => 'Landowner declined a prescribed burn — cattle on the lease; open to mechanical thinning.'],
      [-21, 'negotiation', (c) => `Revised plan (thinning, no burn) sent to ${c.county} commissioners.`],
      [-19, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-17, 'planned', (c) => `${c.county} commissioners vote on the thinning contract.`],
    ],
  },
  {
    fireId: 'QD71', agent: 'Hannah Brooks', region: 'Central Texas', landowner: 'K. Voss', stage: 'negotiation',
    primaryCounterpart: 'county',
    events: [
      [-33, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-28, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${c.county} and ${TAMFS}.`],
      [-27, 'negotiation', (c) => `${c.county} in negotiation to clear pine litter and yaupon on the exact parcel; landowner contacted.`],
      [-26, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-24, 'planned', (c) => `Site walk with the ${c.county} fire marshal and landowner.`],
    ],
  },
  {
    fireId: 'PP08', agent: 'Luis Ortega', region: 'North Texas', landowner: 'S. Pruitt', stage: 'declined',
    primaryCounterpart: 'tamfs',
    events: [
      [-32, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-30, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-27, 'negotiation', (c) => `${c.county} in negotiation to shred a mesquite break on the exact parcel; landowner contacted.`],
      [-22, 'declined', (c) => `${c.county} declined — budget.`],
      [-18, 'declined', () => 'Landowner declined — grazing lease runs to December.'],
      [-15, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-10, 'escalated', () => `Escalated to the ${TAMFS} regional office for a state-funded break.`],
      [-7, 'planned', () => 'TAMFS regional office decision due.'],
    ],
  },
  {
    fireId: 'WF15', agent: 'Priya Raman', region: 'North Texas', landowner: 'L. Harlan', stage: 'identified',
    primaryCounterpart: 'county',
    events: [
      [-30, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-29, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-28, 'planned', (c) => `Brief ${c.county} emergency management and ${TAMFS}.`],
    ],
  },
  // Two fires from last month, also listed in historicalFires.json.
  {
    fireId: 'HC09', agent: 'Maria Delgado', region: 'Central Texas', landowner: 'E. Keller', stage: 'prevented',
    primaryCounterpart: 'county',
    events: [
      [-29, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-27, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-24, 'negotiation', (c) => `${c.county} in negotiation to cut a firebreak on the exact parcel; landowner contacted.`],
      [-20, 'agreed', () => 'Firebreak and burn window agreed.'],
      [-17, 'scheduled', () => 'Crew scheduled: TAMFS engine crew and county volunteer fire department.'],
      [-15, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [-11, 'complete', (c) => `Firebreak cut and block ${c.blockId} burned in the ${c.humidity} humidity window.`],
      [(c) => c.windowEndDay + 1, 'prevented', () => 'Window closed with no ignition in the treated block. Fire prevented.'],
    ],
  },
  {
    fireId: 'WF11', agent: 'Priya Raman', region: 'North Texas', landowner: 'B. Delacroix', stage: 'declined',
    primaryCounterpart: 'county',
    events: [
      [-28, 'forecast', (c) => `${c.id} dated by PRIMER at 90%, 14-day window (${c.wide}).`],
      [-26, 'engaged', (c) => `Pyrome agent ${c.agent} engaged ${TAMFS} and ${c.county}.`],
      [-23, 'negotiation', (c) => `${c.county} in negotiation to cut a firebreak on the exact parcel; landowner contacted.`],
      [-19, 'declined', (c) => `${c.county} declined — budget.`],
      [-16, 'declined', () => 'Landowner declined — hay contract on the block.'],
      [-15, 'forecast', (c) => `Window narrowed from 14 to ${c.windowDays} days (${c.window}).`],
      [0, 'burned', (c) => `Fire ignited on ${dayMonth(c.predictedDate)}, inside the predicted window; ${c.homesLost} insured homes lost.`],
    ],
  },
]

// 2025–26 season. Outcomes: prevented (a), declined then burned (b), back-test (c).
const HISTORICAL = [
  { id: 'LL31', place: 'Llano', county: 'Llano County', date: '2025-11-18', outcome: 'prevented', leadDays: 14, windowDays: 5 },
  { id: 'CL19', place: 'Coleman', county: 'Coleman County', date: '2025-12-15', outcome: 'backtest', leadDays: 19, windowDays: 6 },
  { id: 'BR27', place: 'Borger', county: 'Hutchinson County', date: '2026-02-11', outcome: 'declined', leadDays: 22, windowDays: 4, featured: true },
  { id: 'CN12', place: 'Canadian', county: 'Hemphill County', date: '2026-02-24', outcome: 'prevented', leadDays: 21, windowDays: 4 },
  { id: 'EA22', place: 'Eastland', county: 'Eastland County', date: '2026-03-02', outcome: 'backtest', leadDays: 26, windowDays: 5 },
  { id: 'GR05', place: 'Graham', county: 'Young County', date: '2026-03-09', outcome: 'prevented', leadDays: 17, windowDays: 5 },
  { id: 'ST40', place: 'Stephenville', county: 'Erath County', date: '2026-03-22', outcome: 'declined', leadDays: 16, windowDays: 4 },
  { id: 'MS08', place: 'Mason', county: 'Mason County', date: '2026-04-14', outcome: 'backtest', leadDays: 23, windowDays: 6 },
  { id: 'BN33', place: 'Burnet', county: 'Burnet County', date: '2026-06-30', outcome: 'declined', leadDays: 19, windowDays: 5 },
  { id: 'SS18', place: 'San Saba', county: 'San Saba County', date: '2026-07-21', outcome: 'prevented', leadDays: 24, windowDays: 4 },
  { id: 'WF11', place: 'Wichita Falls', county: 'Wichita County', date: '2026-08-19', outcome: 'declined', leadDays: 28, windowDays: 4, areaId: 'wichita-falls' },
  { id: 'HC09', place: 'Fredericksburg', county: 'Gillespie County', date: '2026-08-27', outcome: 'prevented', leadDays: 29, windowDays: 5, areaId: 'hill-country' },
]

const FEATURED_SCAR = { center: [35.585, -101.335], windFromDeg: 235, headM: 8000 }

const MODELS = [
  {
    id: 'primer', name: 'PRIMER', owner: 'Pyrome', isPrimer: true,
    description: 'Fuel-state date model: dates hectares whose accumulated fire probability reaches 90% inside a set window.',
    hitRate: { 7: 0.94, 14: 0.9, 21: 0.84, 30: 0.78 }, brierScore: 0.061,
  },
  {
    id: 'pof', name: 'PoF Grid', owner: 'Comparison model', kind: 'an ECMWF-style probability-of-fire grid',
    description: 'ECMWF-style probability-of-fire grid driven by forecast weather and fuel indices.',
    hitRate: { 7: 0.71, 14: 0.52, 21: 0.34, 30: 0.21 }, brierScore: 0.148,
  },
  {
    id: 'fwi', name: 'FWI', owner: 'Comparison model', kind: 'a fire-weather index',
    description: 'Fire-weather index from temperature, humidity, wind and rainfall.',
    hitRate: { 7: 0.63, 14: 0.41, 21: 0.24, 30: 0.12 }, brierScore: 0.176,
  },
  {
    id: 'sat', name: 'SatRisk', owner: 'Comparison model', kind: 'a satellite risk score',
    description: 'Satellite risk score from vegetation greenness and land-surface temperature.',
    hitRate: { 7: 0.58, 14: 0.36, 21: 0.19, 30: 0.09 }, brierScore: 0.193,
  },
]
const COMPARISON_CATCH = { pof: [0.35, 4, 8], fwi: [0.25, 2, 5], sat: [0.15, 1, 4] } // chance, lead range at short lead
const SCORED_FORECASTS = 214 // PRIMER forecasts scored against observed fires across Texas last season

// ---------------------------------------------------------------------------
// Homes
// ---------------------------------------------------------------------------

function buildCluster(rng, { centre, count, polygon, streets, locality, occupied }) {
  const angle = (rng.between(-25, 25) * Math.PI) / 180
  const along = [Math.cos(angle), Math.sin(angle)]
  const across = [-Math.sin(angle), Math.cos(angle)]
  const streetSpacing = rng.between(130, 160)
  const lotSpacing = rng.between(55, 72)
  const setback = rng.between(24, 32)

  const candidates = []
  for (let s = -4; s <= 4; s++) {
    const street = streets[s + 4]
    const baseNumber = rng.int(1, 29) * 100
    for (let j = -9; j <= 9; j++) {
      for (const side of [-1, 1]) {
        const jitter = [rng.between(-5, 5), rng.between(-5, 5)]
        const pos = add(centre, add(mul(across, s * streetSpacing + side * setback), add(mul(along, j * lotSpacing), jitter)))
        if (!pointInPolygon(pos, polygon)) continue
        if (occupied.some((q) => len(sub(q, pos)) < 30)) continue
        candidates.push({
          pos,
          score: len(sub(pos, centre)) + rng.between(0, 110),
          keep: rng.chance(0.86),
          number: baseNumber + (j + 10) * 6 + (side > 0 ? 1 : 0),
          street,
          rotation: angle + (rng.between(-7, 7) * Math.PI) / 180,
        })
      }
    }
  }
  const chosen = candidates
    .filter((c) => c.keep)
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
  if (chosen.length < count) throw new Error(`${locality}: only ${chosen.length} of ${count} lots fit`)
  return chosen.map((c) => ({ ...c, locality }))
}

function footprint(rng, pos, rotation) {
  const w = rng.between(12, 20)
  const d = rng.between(12, 20)
  const ax = [Math.cos(rotation), Math.sin(rotation)]
  const ay = [-Math.sin(rotation), Math.cos(rotation)]
  return [
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [w / 2, d / 2],
    [-w / 2, d / 2],
  ].map(([x, y]) => add(pos, add(mul(ax, x), mul(ay, y))))
}

// ---------------------------------------------------------------------------
// Areas, homes and fires (built together: the fire corridor shapes where towns go)
// ---------------------------------------------------------------------------

function buildArea(area, areaIndex) {
  const rng = makeRng(`area:${area.id}`)
  const streetPool = rng.shuffle(STREET_NAMES)
  const cfg = area.fire
  const proj = projector(area.center)
  const radius = area.radiusKm * 1000

  // Towns are hand-placed on open rural land (checked against the Esri imagery); the
  // primary town is first and the fire runs into it. The coverage area wraps all three.
  const centres = area.towns.map(proj.toXY)
  const polygon = blobPolygon(rng, radius, centres, 1000)

  // Fire corridor: wind blows from windFromDeg, so the fire runs downwind (u).
  const u = unitFromBearing(cfg.windFromDeg + 180)
  const v = rightOf(u)
  const distanceToTown = rng.between(5800, 6600)
  const roadDistance = cfg.fixed?.roadDistanceM ?? roundTo(rng.between(850, 1400), 50)
  const primaryCentre = centres[0]
  const ignition = add(sub(primaryCentre, mul(u, distanceToTown)), mul(v, rng.between(-250, 250)))

  // Secondary towns must stay clear of the fire corridor and the ignition block.
  for (const p of centres.slice(1)) {
    const rel = sub(p, ignition)
    const lateral = Math.abs(dot(rel, v))
    const alongAxis = dot(rel, u)
    const clear = lateral > 3100 || alongAxis > distanceToTown + 1400 || alongAxis < -(roadDistance + 600)
    if (!clear) throw new Error(`${area.id}: a secondary town sits in the fire corridor`)
  }

  // Homes, split across the towns; the primary town is the largest.
  const primaryCount = Math.round(area.homes * rng.between(0.42, 0.56))
  const secondCount = Math.round((area.homes - primaryCount) * rng.between(0.5, 0.62))
  const counts = [primaryCount, secondCount, area.homes - primaryCount - secondCount]
  const occupied = []
  const lots = []
  centres.forEach((centre, i) => {
    const streets = streetPool.splice(0, 9)
    const cluster = buildCluster(rng, { centre, count: counts[i], polygon, streets, locality: area.localities[i], occupied })
    cluster.forEach((c) => occupied.push(c.pos))
    lots.push(...cluster)
  })

  const homes = lots.map((lot, i) => {
    const construction = rng.weighted(CONSTRUCTION.map(([name, weight]) => [name, weight]))
    const rate = CONSTRUCTION.find(([name]) => name === construction)[2]
    const tivRaw = (180000 + 1220000 * rng.next() ** 2.1) * area.tivMultiplier
    const tiv = Math.min(1400000, Math.max(180000, roundTo(tivRaw, 1000)))
    return {
      id: `${area.code}-${String(i + 1).padStart(3, '0')}`,
      areaId: area.id,
      locality: lot.locality,
      address: `${lot.number} ${lot.street}`,
      policyNumber: `DCX-HO-${(areaIndex + 2) * 100000 + 1000 + i * 97 + rng.int(0, 90)}`,
      tiv,
      construction,
      annualPremium: Math.round(tiv * rate * rng.between(0.92, 1.08)),
      xy: lot.pos,
      centroid: proj.toLatLon(lot.pos, 6),
      footprint: proj.polygon(footprint(rng, lot.pos, lot.rotation), 6),
    }
  })

  const fire = buildFire(rng, { area, proj, u, v, ignition, roadDistance, distanceToTown, homes, primaryCount })

  const localities = area.localities.map((name, i) => {
    const members = homes.filter((h) => h.locality === name)
    return { name, center: proj.toLatLon(centres[i]), homes: members.length }
  })

  const areaRecord = {
    id: area.id,
    code: area.code,
    name: area.name,
    nearTown: area.nearTown,
    county: area.county,
    center: area.center,
    hectares: roundTo(polygonAreaM2(polygon) / 10000, 10),
    homesCount: homes.length,
    tiv: sum(homes, (h) => h.tiv),
    annualPremium: sum(homes, (h) => h.annualPremium),
    fireId: cfg.id,
    localities,
    polygon: proj.polygon(polygon),
  }
  const fuelGrid = buildFuelGrid(area, proj, polygon, ignition)
  const sensors = buildSensors(area, proj, polygon, homes)
  return { areaRecord, homes, fire, fuelGrid, sensors }
}

// ---------------------------------------------------------------------------
// Fuel-state grid and sensor sites (own seeds, so they never shift the data above)
// ---------------------------------------------------------------------------

const FUEL_CELL_M = 200
const FUEL_MAX_DAYS = 35

/**
 * Days until the fuel crosses its threshold, on a 200 m grid clipped to the coverage area.
 * Lowest (reddest) around the fire's ignition point, rising with distance, with some texture.
 * Rows run north to south; -1 marks cells outside the coverage area.
 */
function buildFuelGrid(area, proj, polygon, ignition) {
  const rng = makeRng(`fuel:${area.id}`)
  const xs = polygon.map((p) => p[0])
  const ys = polygon.map((p) => p[1])
  const minX = Math.floor(Math.min(...xs) / FUEL_CELL_M) * FUEL_CELL_M
  const maxX = Math.ceil(Math.max(...xs) / FUEL_CELL_M) * FUEL_CELL_M
  const minY = Math.floor(Math.min(...ys) / FUEL_CELL_M) * FUEL_CELL_M
  const maxY = Math.ceil(Math.max(...ys) / FUEL_CELL_M) * FUEL_CELL_M
  const cols = (maxX - minX) / FUEL_CELL_M
  const rows = (maxY - minY) / FUEL_CELL_M
  const ph = [0, 0, 0].map(() => rng.between(0, 6.28))
  const values = []
  for (let r = 0; r < rows; r++) {
    const y = maxY - (r + 0.5) * FUEL_CELL_M
    const row = []
    for (let c = 0; c < cols; c++) {
      const x = minX + (c + 0.5) * FUEL_CELL_M
      if (!pointInPolygon([x, y], polygon)) {
        row.push(-1)
        continue
      }
      const km = len(sub([x, y], ignition)) / 1000
      const base = 1 + 27 * (1 - Math.exp(-km / 3.2))
      const texture =
        2.4 * Math.sin(x / 900 + ph[0]) * Math.cos(y / 1100 + ph[1]) + 1.6 * Math.sin((x + y) / 650 + ph[2]) + rng.between(-1.2, 1.2)
      row.push(Math.max(0, Math.min(FUEL_MAX_DAYS, Math.round(base + texture))))
    }
    values.push(row)
  }
  const [north, west] = proj.toLatLon([minX, maxY])
  const [south, east] = proj.toLatLon([maxX, minY])
  return { areaId: area.id, cols, rows, bounds: [[south, west], [north, east]], values }
}

const SENSOR_TYPES = [
  ['Fuel moisture probe', 0.5],
  ['Weather mast', 0.3],
  ['Smoke camera', 0.2],
]

function buildSensors(area, proj, polygon, homes) {
  const rng = makeRng(`sensors:${area.id}`)
  const count = rng.int(6, 10)
  const xs = polygon.map((p) => p[0])
  const ys = polygon.map((p) => p[1])
  const pts = []
  for (let tries = 0; pts.length < count; tries++) {
    if (tries > 5000) throw new Error(`${area.id}: could not place sensors`)
    const p = [rng.between(Math.min(...xs), Math.max(...xs)), rng.between(Math.min(...ys), Math.max(...ys))]
    if (!pointInPolygon(p, polygon)) continue
    if (pts.some((q) => len(sub(q, p)) < 1500)) continue
    if (homes.some((h) => len(sub(h.xy, p)) < 250)) continue
    pts.push(p)
  }
  return pts.map((p, i) => ({
    id: `${area.code}-S${i + 1}`,
    areaId: area.id,
    type: rng.weighted(SENSOR_TYPES),
    position: proj.toLatLon(p),
    installed: `${rng.int(2024, 2026)}`,
  }))
}

function buildFire(rng, { area, proj, u, v, ignition, roadDistance, distanceToTown, homes, primaryCount }) {
  const cfg = area.fire
  const shape = randomFireShape(rng)

  // Grow the head distance until the final perimeter engulfs the target number of homes.
  const target = rng.int(22, Math.min(primaryCount - 3, 60))
  let headM = 1500
  let finalPoly
  let inside = []
  for (; headM <= 14000; headM += 50) {
    finalPoly = firePerimeter(ignition, u, headM, shape)
    inside = homes.filter((h) => pointInPolygon(h.xy, finalPoly))
    if (inside.length >= target) break
  }
  if (inside.length < 20 || inside.length > 80) throw new Error(`${cfg.id}: ${inside.length} homes in path`)

  // Timeline: ignition on the first day of the window, perimeters at 1 h, 8 h, 24 h, then daily.
  const daysUntil = cfg.daysUntil
  const predictedDate = addDays(ISSUE_DATE, daysUntil)
  const windowStart = addDays(predictedDate, -(cfg.windowDays >= 6 ? 2 : 1))
  const windowEnd = addDays(windowStart, cfg.windowDays - 1)
  const wideStart = addDays(windowStart, -rng.int(3, 6))
  const wideEnd = addDays(wideStart, 13)
  const calledOn = addDays(predictedDate, -cfg.leadDays)

  const stepDefs = [
    { label: '1 h', hours: 1, day: 1, scale: 0.1 },
    { label: '8 h', hours: 8, day: 1, scale: 0.42 },
    { label: '24 h', hours: 24, day: 1, scale: 0.7 },
  ]
  for (let day = 2; day <= cfg.windowDays; day++) {
    const t = (day - 1) / (cfg.windowDays - 1)
    stepDefs.push({ label: `Day ${day}`, hours: day * 24, day, scale: 0.7 + 0.3 * (1 - (1 - t) ** 1.6) })
  }
  const steps = stepDefs.map((s, index) => {
    const poly = scaleAbout(finalPoly, ignition, s.scale)
    return { ...s, index, poly }
  })

  const homesInPath = inside
    .map((h) => {
      const step = steps.find((s) => pointInPolygon(h.xy, s.poly))
      const damageRatio = rng.between(...DAMAGE_RATIO)
      return {
        homeId: h.id,
        step: step.index,
        day: step.day,
        date: addDays(windowStart, step.day - 1),
        tiv: h.tiv,
        expectedLoss: roundTo(h.tiv * damageRatio, 100),
        dist: len(sub(h.xy, ignition)),
      }
    })
    .sort((a, b) => a.step - b.step || a.dist - b.dist)
    .map(({ dist, tiv, ...rest }) => rest)

  // Barriers the perimeter stops against: FM road behind, creek on one flank, county road ahead.
  const alongOf = (p) => dot(sub(p, ignition), u)
  const lateralOf = (p) => dot(sub(p, ignition), v)
  const maxAlong = Math.max(...finalPoly.map(alongOf))
  const minAlong = Math.min(...finalPoly.map(alongOf))
  const side = rng.chance(0.5) ? 1 : -1
  const flankExtent = Math.max(...finalPoly.map((p) => side * lateralOf(p)))
  const halfWidth = Math.max(...finalPoly.map((p) => Math.abs(lateralOf(p))))
  if (-minAlong > roadDistance - 100) throw new Error(`${cfg.id}: fire backs over the FM road`)

  const at = (alongM, lateralM) => add(ignition, add(mul(u, alongM), mul(v, lateralM)))
  const fmSpan = halfWidth + 2500
  const creek = []
  for (let a = -roadDistance * 0.8; a <= maxAlong + 1500; a += 150) {
    creek.push(at(a, side * (flankExtent + 140 + 50 * Math.sin(a / 260))))
  }
  const barriers = [
    { type: 'road', name: `FM ${rng.int(1100, 3400)}`, line: proj.polygon([at(-roadDistance, -fmSpan), at(-roadDistance + 40, 0), at(-roadDistance, fmSpan)]) },
    { type: 'river', name: cfg.creek, line: proj.polygon(creek) },
    { type: 'road', name: `CR ${rng.int(110, 480)}`, line: proj.polygon([at(maxAlong + 70, -halfWidth * 1.4), at(maxAlong + 70, halfWidth * 1.4)]) },
  ]

  // Ignition block: the parcel of cured fuel PRIMER dated, kept clear of homes.
  const blockId = `${area.code}-${cfg.id.slice(2)}`
  const targetHa = cfg.fixed?.blockHa ?? roundTo(rng.between(650, 1400), 10)
  const eUp = roadDistance - 150
  let eDown = Math.min(distanceToTown - 900, rng.between(1800, 2600))
  let halfW = (targetHa * 10000) / (2 * (eUp + eDown))
  let block
  for (let tries = 0; ; tries++) {
    block = [at(-eUp, -halfW), at(eDown, -halfW), at(eDown, halfW), at(-eUp, halfW)]
    if (!homes.some((h) => pointInPolygon(h.xy, block))) break
    if (tries > 60) throw new Error(`${cfg.id}: block overlaps homes`)
    halfW *= 0.92
    eDown *= 0.97
  }
  const blockHa = roundTo(polygonAreaM2(block) / 10000, 10)
  const seasonsUnburned = cfg.fixed?.seasonsUnburned ?? rng.int(2, 5)
  const dir = compass8Word(cfg.windFromDeg + 180)

  // Fuel state that produced the date (see CLAUDE.md §5).
  const fx = cfg.fixed?.fuel ?? {
    live: round(rng.between(81.5, 87), 0),
    liveRate: round(rng.between(1.1, 1.8), 1),
    curing: round(rng.between(84, 92), 0),
    dead: round(rng.between(8.2, 9.6), 1),
    daysSinceRain: rng.int(33, 52),
    liveGap: rng.int(2, 4),
    deadGap: rng.int(1, 3),
    curingGap: rng.int(3, 5),
  }
  const liveCross = addDays(windowStart, -fx.liveGap)
  const asOf = addDays(liveCross, -Math.round((fx.live - 80) / fx.liveRate))
  const deadCross = addDays(asOf, -fx.deadGap)
  const curingCross = addDays(deadCross, -fx.curingGap)
  const deadRate = (10 - fx.dead) / daysBetween(deadCross, asOf)
  const curingRate = (fx.curing - 80) / daysBetween(curingCross, asOf)
  const probSpread = 2.2
  const probMid = -probSpread * Math.log(9) // days from predicted date where p = 0.5
  const trajectory = []
  for (let d = calledOn; d <= windowEnd; d = addDays(d, 1)) {
    const t = daysBetween(asOf, d)
    const tp = daysBetween(predictedDate, d)
    trajectory.push({
      date: d,
      live: round(Math.min(160, Math.max(55, fx.live - fx.liveRate * t + rng.between(-0.4, 0.4))), 1),
      dead: round(Math.min(22, Math.max(4, fx.dead - deadRate * t)), 1),
      curing: round(Math.min(100, Math.max(40, fx.curing + curingRate * t)), 1),
      probability: round(1 / (1 + Math.exp(-(tp - probMid) / probSpread)), 3),
    })
  }

  // Intensity, varied around the CLAUDE.md example (11,400 kW/m, 4.2 m, 3.1 km/h, 32 km/h).
  const ix = cfg.fixed?.intensity ?? (() => {
    const kwm = roundTo(11400 * rng.between(0.74, 1.24), 100)
    return {
      kwm,
      flame: round(4.2 * (kwm / 11400) ** 0.46, 1),
      ros: round(3.1 * rng.between(0.7, 1.3), 1),
      wind: Math.round(32 * rng.between(0.8, 1.3)),
    }
  })()

  // Exposure and the Intervention Plan.
  const engulfed = homesInPath.map((p) => homes.find((h) => h.id === p.homeId))
  const tivInPath = sum(engulfed, (h) => h.tiv)
  const premiumInPath = sum(engulfed, (h) => h.annualPremium)
  const expectedLoss = sum(homesInPath, (p) => p.expectedLoss)
  const aalUplift = roundTo((PROBABILITY * expectedLoss) / AAL_RETURN_PERIOD_YEARS, 1000)

  const humidityStart = addDays(windowStart, -12) > addDays(ISSUE_DATE, 3) ? addDays(windowStart, -12) : addDays(ISSUE_DATE, 3)
  const humidityEnd = addDays(humidityStart, 2)
  const humidityFits = daysBetween(humidityEnd, windowStart) >= 3
  const humidity = humidityFits ? dateRange(humidityStart, humidityEnd) : null

  const cost = cfg.costRange[0] === cfg.costRange[1] ? cfg.costRange[0] : roundTo(rng.between(...cfg.costRange), 1000)
  const preventionProbability = cfg.fixed?.preventionProbability ?? round(rng.between(0.78, 0.91), 2)
  const lossAvoided = roundTo(expectedLoss * preventionProbability, 1000)
  const retainedPremium5yr = roundTo(premiumInPath * 5, 1000)
  const reinstatementAvoided = roundTo(lossAvoided * REINSTATEMENT_RATE, 1000)
  const premiumSaved5yr = retainedPremium5yr + reinstatementAvoided

  const finalLL = proj.polygon(finalPoly)
  const blockLL = proj.polygon(block)

  return {
    record: {
      id: cfg.id,
      areaId: area.id,
      place: area.nearTown,
      county: area.county,
      ignition: proj.toLatLon(ignition),
      block: {
        id: blockId,
        label: `Block ${blockId}, ${blockHa.toLocaleString('en-US')} ha ${cfg.fuel}, ${cfg.soil} soil, unburned ${NUMBER_WORDS[seasonsUnburned]} seasons, ${roadDistance.toLocaleString('en-US')} m from FM road`,
        hectares: blockHa,
        fuel: cfg.fuel,
        soil: cfg.soil,
        seasonsUnburned,
        roadDistanceM: roadDistance,
        polygon: blockLL,
      },
      predictedDate,
      daysUntilFire: daysUntil,
      window: { start: windowStart, end: windowEnd, days: cfg.windowDays },
      wideWindow: { start: wideStart, end: wideEnd, days: 14 },
      calledOn,
      leadTimeDays: cfg.leadDays,
      calls: [
        { preset: '14d', windowDays: 14, calledOn, leadDays: cfg.leadDays, made: true },
        { preset: '7d', windowDays: 7, calledOn: addDays(predictedDate, -15), leadDays: 15, made: daysUntil <= 15 },
      ],
      probability: PROBABILITY,
      spreadCertainty: SPREAD_CERTAINTY,
      fuelState: {
        asOf,
        liveMoisturePct: fx.live,
        liveTrendPtsPerDay: -fx.liveRate,
        curingPct: fx.curing,
        deadMoistureAfternoonPct: fx.dead,
        daysSinceRain: fx.daysSinceRain,
        thresholds: [
          { fuel: 'Curing', threshold: 80, unit: '%', crossedOn: curingCross },
          { fuel: 'Dead fuel moisture', threshold: 10, unit: '%', crossedOn: deadCross },
          { fuel: 'Live fuel moisture', threshold: 80, unit: '%', crossedOn: liveCross },
        ],
        probabilityCrosses90On: predictedDate,
        trajectory,
      },
      intensity: {
        class: ix.kwm >= 10000 ? 'Extreme' : 'Very high',
        firelineIntensityKwM: ix.kwm,
        flameLengthM: ix.flame,
        rateOfSpreadKmH: ix.ros,
        windKmH: ix.wind,
        windFrom: compass16(cfg.windFromDeg),
        windFromDeg: cfg.windFromDeg,
      },
      spread: {
        note: 'Perimeters under forecast wind; ignition on the first day of the window.',
        finalHectares: roundTo(polygonAreaM2(finalPoly) / 10000, 10),
        bounds: boundsOf([finalLL, blockLL]),
        barriers,
        steps: steps.map((s) => ({
          index: s.index,
          label: s.label,
          hoursFromIgnition: s.hours,
          day: s.day,
          date: addDays(windowStart, s.day - 1),
          hectares: roundTo(polygonAreaM2(s.poly) / 10000, 10),
          polygon: proj.polygon(s.poly),
        })),
      },
      homesInPath,
      exposure: {
        homesEngulfed: homesInPath.length,
        tiv: tivInPath,
        expectedLoss,
        annualPremium: premiumInPath,
        aalUplift,
      },
      intervention: {
        action: cfg.action({ dir, blockId, humidity }),
        humidityWindow: humidityFits ? { start: humidityStart, end: humidityEnd } : null,
        costBearer: `${TAMFS}, ${area.county} and landowner`,
        cost,
        preventionProbability,
        lossAvoided,
        premiumSaved5yr,
        premiumSavedBreakdown: { retainedPremium5yr, reinstatementAvoided },
        netBenefit: lossAvoided + premiumSaved5yr - cost,
      },
    },
    context: { blockId, humidity, humidityStart, windowStart, windowEnd, wideStart, wideEnd, predictedDate },
  }
}

// ---------------------------------------------------------------------------
// Historical season and the before/after fire
// ---------------------------------------------------------------------------

function buildHistorical() {
  const rng = makeRng('historical')
  return HISTORICAL.map((h) => {
    const windowStart = addDays(h.date, -1)
    const windowEnd = addDays(windowStart, h.windowDays - 1)
    const comparison = {}
    for (const [id, [p, lo, hi]] of Object.entries(COMPARISON_CATCH)) {
      const caught = h.outcome !== 'backtest' && rng.chance(p)
      comparison[id] = { caught, leadDays: caught ? rng.int(lo, hi) : null }
    }
    const base = {
      id: h.id,
      place: h.place,
      county: h.county,
      areaId: h.areaId ?? null,
      outcome: h.outcome,
      predictedDate: h.date,
      window: { start: windowStart, end: windowEnd, days: h.windowDays },
      calledOn: addDays(h.date, -h.leadDays),
      leadTimeDays: h.leadDays,
      probability: PROBABILITY,
      primerCaught: true,
      comparison,
    }
    const avgTiv = rng.between(420000, 640000)
    if (h.outcome === 'prevented') {
      const homes = rng.int(18, 64)
      const tiv = roundTo(homes * avgTiv, 1000)
      const expectedLoss = roundTo(tiv * 0.7, 1000)
      const retained = roundTo(tiv * 0.006 * 5, 1000)
      return {
        ...base,
        datedHectares: roundTo(rng.between(900, 3200), 10),
        homesThreatened: homes,
        tivThreatened: tiv,
        cost: roundTo(rng.between(90000, 400000), 1000),
        lossAvoided: expectedLoss,
        premiumSaved5yr: retained + roundTo(expectedLoss * REINSTATEMENT_RATE, 1000),
        realisedLoss: 0,
      }
    }
    if (h.outcome === 'declined') {
      const homesLost = rng.int(9, 38)
      const tivLost = roundTo(homesLost * avgTiv, 1000)
      return {
        ...base,
        datedHectares: roundTo(rng.between(900, 3200), 10),
        hectaresBurned: roundTo(rng.between(1200, 6500), 10),
        burnedOn: h.date,
        homesLost,
        tivLost,
        proposedCost: roundTo(rng.between(90000, 300000), 1000),
        realisedLoss: roundTo(tivLost * rng.between(0.72, 0.9), 1000),
      }
    }
    return {
      ...base,
      backTest: true,
      hectaresBurned: roundTo(rng.between(2000, 9000), 10),
      burnedOn: h.date,
      homesLost: rng.int(0, 25),
    }
  })
}

function buildBeforeAfter(fire) {
  const rng = makeRng('before-after')
  const proj = projector(FEATURED_SCAR.center)
  const u = unitFromBearing(FEATURED_SCAR.windFromDeg + 180)
  const ignition = mul(u, -FEATURED_SCAR.headM * 0.45)
  // The observed scar is ragged; PRIMER's predicted perimeter is the same run, smoother and slightly offset.
  const scarShape = randomFireShape(rng, 1.7)
  const scar = firePerimeter(ignition, u, FEATURED_SCAR.headM, scarShape, 160)
  const predShape = { ...scarShape, amps: scarShape.amps.map((a) => a * 0.55), phases: scarShape.phases.map((p) => p + rng.between(-0.2, 0.2)) }
  const uPred = unitFromBearing(FEATURED_SCAR.windFromDeg + 180 + rng.between(-2, 2))
  const predIgnition = add(ignition, [rng.between(-60, 60), rng.between(-60, 60)])
  const predicted = firePerimeter(predIgnition, uPred, FEATURED_SCAR.headM * rng.between(0.99, 1.03), predShape)

  // Overlap of predicted and observed perimeters (intersection over union), sampled on a 40 m grid.
  const all = [...scar, ...predicted]
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  let both = 0
  let either = 0
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 40) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += 40) {
      const a = pointInPolygon([x, y], scar)
      const b = pointInPolygon([x, y], predicted)
      if (a && b) both++
      if (a || b) either++
    }
  }
  const scarLL = proj.polygon(scar)
  const predLL = proj.polygon(predicted)
  return {
    fireId: fire.id,
    center: FEATURED_SCAR.center,
    zoom: 13,
    bounds: boundsOf([scarLL, predLL]),
    beforeDate: addDays(fire.predictedDate, -21),
    afterDate: addDays(fire.predictedDate, 12),
    ignition: proj.toLatLon(ignition),
    burnScar: scarLL,
    predictedPerimeter: predLL,
    burnScarHectares: roundTo(polygonAreaM2(scar) / 10000, 10),
    overlapPct: Math.round((both / either) * 100),
  }
}

// ---------------------------------------------------------------------------
// Agent processes
// ---------------------------------------------------------------------------

function buildProcesses(fireById, areaById, historicalById) {
  return PROCESSES.map((p) => {
    const current = fireById[p.fireId]
    let ctx
    let place
    let county
    let areaId
    let daysOut
    let amounts
    let docsBlockId
    if (current) {
      const f = current.record
      const c = current.context
      areaId = f.areaId
      place = f.place
      county = f.county
      daysOut = f.daysUntilFire
      docsBlockId = c.blockId
      amounts = { cost: f.intervention.cost, premiumSaved5yr: f.intervention.premiumSaved5yr, lossAvoided: f.intervention.lossAvoided }
      ctx = {
        id: f.id,
        predictedDate: f.predictedDate,
        windowDays: f.window.days,
        window: dateRange(f.window.start, f.window.end),
        wide: dateRange(f.wideWindow.start, f.wideWindow.end),
        windowEndDay: daysBetween(f.predictedDate, f.window.end),
        blockId: c.blockId,
        humidity: c.humidity,
        humidityStartDay: daysBetween(f.predictedDate, c.humidityStart),
      }
    } else {
      const h = historicalById[p.fireId]
      const area = areaById[h.areaId]
      areaId = h.areaId
      place = h.place
      county = h.county
      daysOut = daysBetween(ISSUE_DATE, h.predictedDate)
      docsBlockId = `${area.code}-${p.fireId.slice(2)}`
      amounts =
        h.outcome === 'prevented'
          ? { cost: h.cost, premiumSaved5yr: h.premiumSaved5yr, lossAvoided: h.lossAvoided }
          : { proposedCost: h.proposedCost, realisedLoss: h.realisedLoss }
      const wideStart = addDays(h.window.start, -4)
      const humidityStart = addDays(h.window.start, -12)
      ctx = {
        id: h.id,
        predictedDate: h.predictedDate,
        windowDays: h.window.days,
        window: dateRange(h.window.start, h.window.end),
        wide: dateRange(wideStart, addDays(wideStart, 13)),
        windowEndDay: daysBetween(h.predictedDate, h.window.end),
        blockId: docsBlockId,
        humidity: dateRange(humidityStart, addDays(humidityStart, 2)),
        homesLost: h.homesLost,
      }
    }
    ctx.agent = p.agent
    ctx.county = county

    const issueDay = -daysBetween(ISSUE_DATE, ctx.predictedDate)
    const landownerLabel = `${p.landowner} (landowner)`
    // Who the agent was dealing with for each entry, for the timeline meta line.
    const counterpartFor = (type, text) => {
      if (type === 'forecast') return 'PRIMER'
      if (/landowner declined|landowner contacted/i.test(text) && type !== 'negotiation') return landownerLabel
      if (text.includes(TAMFS) && text.includes(county)) return `${TAMFS} and ${county}`
      if (text.includes(TAMFS) || text.startsWith('TAMFS')) return TAMFS
      if (text.includes(county)) return county
      return p.primaryCounterpart === 'tamfs' ? TAMFS : county
    }
    const entries = p.events.map(([dayOrFn, type, text]) => {
      const day = typeof dayOrFn === 'function' ? dayOrFn(ctx) : dayOrFn
      const body = text(ctx)
      const entry = {
        day,
        date: addDays(ctx.predictedDate, day),
        type,
        text: body,
        actor: type === 'forecast' ? 'PRIMER' : p.agent,
        counterpart: counterpartFor(type, body),
      }
      if (type === 'planned') entry.planned = true
      if (type === 'declined') entry.refusal = true
      if (type === 'agreed') entry.amounts = amounts
      if (type === 'burned') entry.amounts = { realisedLoss: amounts.realisedLoss }
      return entry
    })
    for (const e of entries) {
      if (e.planned && e.day <= issueDay) throw new Error(`${p.fireId}: planned entry is in the past`)
      if (!e.planned && e.day > issueDay) throw new Error(`${p.fireId}: done entry "${e.text}" is after the issue date`)
    }
    const done = entries.filter((e) => !e.planned)
    const next = entries.find((e) => e.planned) ?? null
    const engaged = entries.find((e) => e.type === 'engaged')

    const landowner = { body: p.landowner, role: `Landowner, block ${docsBlockId}` }
    const counterparts = [
      { key: 'tamfs', body: TAMFS, role: 'State forestry agency' },
      { key: 'county', body: county, role: 'County emergency management' },
      { key: 'landowner', ...landowner },
    ]

    const docRng = makeRng(`docs:${p.fireId}`)
    const doc = (slug) => ({ name: `${p.fireId}_${slug}.pdf`, sizeKb: docRng.int(90, 1800) })
    const documents = [doc('PRIMER_forecast_sheet')]
    if (['agreed', 'complete', 'prevented'].includes(p.stage)) {
      documents.push(doc('intervention_agreement'), doc(`work_plan_block_${docsBlockId}`), doc('landowner_consent'))
    }
    if (['complete', 'prevented'].includes(p.stage)) documents.push(doc('TAMFS_completion_signoff'))
    if (p.stage === 'prevented') documents.push(doc('post_window_verification'))
    if (p.stage === 'declined') documents.push(doc('refusal_correspondence'))

    return {
      fireId: p.fireId,
      areaId,
      place,
      county,
      current: Boolean(current),
      predictedDate: ctx.predictedDate,
      daysOut: current ? daysOut : null,
      stage: p.stage,
      stageLabel: p.stage === 'declined' ? 'Declined' : STAGES.find((s) => s.id === p.stage).label,
      rag: RAG[p.stage],
      feedGroup: FEED_GROUP[p.stage],
      agent: { name: p.agent, role: `Pyrome field agent, ${p.region}` },
      counterparts: counterparts.map(({ key, ...c }) => c),
      primaryCounterpart: counterparts.find((c) => c.key === p.primaryCounterpart).body,
      engagedOn: engaged?.date ?? null,
      lastAction: { date: done[done.length - 1].date, text: done[done.length - 1].text },
      nextAction: next ? { date: next.date, text: next.text } : null,
      entries,
      ledger: {
        ...amounts,
        status: p.stage === 'declined' ? 'Declined' : STAGES.find((s) => s.id === p.stage).label,
        documents,
      },
    }
  })
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const isPair = (v) => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number')

/** JSON with coordinates and short records kept on one line so the files stay hand-editable. */
function format(value, indent = '') {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  const inner = `${indent}  `
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((x) => format(x, inner))
    const coords = isPair(value) || value.every(isPair) || value.every((x) => typeof x === 'number')
    const line = `[${items.join(', ')}]`
    if (coords || (!line.includes('\n') && indent.length + line.length <= 110)) return line
    return `[\n${items.map((i) => inner + i).join(',\n')}\n${indent}]`
  }
  const entries = Object.entries(value).filter(([, x]) => x !== undefined)
  if (entries.length === 0) return '{}'
  const items = entries.map(([k, x]) => `${JSON.stringify(k)}: ${format(x, inner)}`)
  const line = `{ ${items.join(', ')} }`
  if (!line.includes('\n') && indent.length + line.length <= 110) return line
  return `{\n${items.map((i) => inner + i).join(',\n')}\n${indent}}`
}

function writeJson(name, value) {
  writeFileSync(join(DATA_DIR, name), `${format(value)}\n`)
}

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8'))
}

function main() {
  const built = AREAS.map((area, i) => buildArea(area, i))
  const areas = built.map((b) => b.areaRecord)
  const allHomes = built.flatMap((b) => b.homes)
  const fires = built.map((b) => b.fire)
  const fireRecords = fires.map((f) => f.record)

  // Every home knows its nearest dated fire (distance to the ignition point).
  const homes = allHomes.map(({ xy, ...h }) => {
    let nearest = null
    for (const f of fireRecords) {
      const km = haversineKm(h.centroid, f.ignition)
      if (!nearest || km < nearest.km) nearest = { fireId: f.id, km }
    }
    return { ...h, nearestFire: { fireId: nearest.fireId, km: round(nearest.km, 1) } }
  })

  const historical = buildHistorical()
  const featured = historical.find((h) => HISTORICAL.find((c) => c.id === h.id).featured)
  featured.beforeAfter = buildBeforeAfter(featured)
  featured.hectaresBurned = featured.beforeAfter.burnScarHectares

  const fireById = Object.fromEntries(fires.map((f) => [f.record.id, f]))
  const areaById = Object.fromEntries(AREAS.map((a) => [a.id, a]))
  const historicalById = Object.fromEntries(historical.map((h) => [h.id, h]))
  const processes = buildProcesses(fireById, areaById, historicalById)
  const bookTiv = sum(homes, (h) => h.tiv)
  const baselineAal = roundTo(bookTiv * AAL_BASE_RATE, 1000)
  for (const f of fireRecords) {
    const proc = processes.find((p) => p.fireId === f.id)
    f.intervention.stage = proc.stage
    f.intervention.rag = proc.rag
    f.exposure.aalUpliftPctOfBook = round((f.exposure.aalUplift / baselineAal) * 100, 1)
  }

  const prevented = historical.filter((h) => h.outcome === 'prevented')
  const declined = historical.filter((h) => h.outcome === 'declined')
  const backtests = historical.filter((h) => h.outcome === 'backtest')
  const seasonStats = {
    season: '2025–26',
    firesDated: prevented.length + declined.length,
    prevented: prevented.length,
    declined: declined.length,
    backTested: backtests.length,
    declinedBurnedInsideWindow: declined.length,
    hectaresDated: sum([...prevented, ...declined], (h) => h.datedHectares),
    interventionCost: sum(prevented, (h) => h.cost),
    lossAvoided: sum(prevented, (h) => h.lossAvoided),
    premiumSaved: sum(prevented, (h) => h.premiumSaved5yr),
    realisedLossOnDeclined: sum(declined, (h) => h.realisedLoss),
    scoredForecasts: SCORED_FORECASTS,
    hitRate14: Object.fromEntries(MODELS.map((m) => [m.id, m.hitRate[14]])),
    brierScore: Object.fromEntries(MODELS.map((m) => [m.id, m.brierScore])),
  }

  const models = {
    leadTimes: [7, 14, 21, 30],
    models: MODELS.map(({ brierScore, ...m }) => m),
  }

  writeJson('coverageAreas.json', areas)
  writeJson('homes.json', homes)
  writeJson('fires.json', fireRecords)
  writeJson('fuelGrid.json', { cellM: FUEL_CELL_M, maxDays: FUEL_MAX_DAYS, areas: built.map((b) => b.fuelGrid) })
  writeJson('sensors.json', built.flatMap((b) => b.sensors))
  writeJson('agentTimelines.json', { stages: STAGES, processes })
  writeJson('historicalFires.json', historical)
  writeJson('models.json', models)
  writeJson('seasonStats.json', seasonStats)

  // Keep the shell's summary figures in step with the generated book and fires.
  const portfolio = readJson('portfolio.json')
  writeJson('portfolio.json', {
    _note: 'Totals written by scripts/generateData.mjs from coverageAreas.json and homes.json.',
    options: portfolio.options,
    tiv: bookTiv,
    homesCovered: homes.length,
    hectaresUnderForecast: sum(areas, (a) => a.hectares),
    annualPremium: sum(homes, (h) => h.annualPremium),
    baselineAal,
  })
  const alert = readJson('alertSummary.json')
  writeJson('alertSummary.json', {
    _note: 'Totals for every dated fire in the next 30 days, written by scripts/generateData.mjs from fires.json.',
    title: alert.title,
    tivWillBurn: sum(fireRecords, (f) => f.exposure.tiv),
    premiumAtRisk: sum(fireRecords, (f) => f.intervention.premiumSaved5yr),
    datedFires: fireRecords.length,
    homesInPath: sum(fireRecords, (f) => f.exposure.homesEngulfed),
    preventableIfIntervened: sum(fireRecords, (f) => f.intervention.lossAvoided),
  })

  validate()
}

// ---------------------------------------------------------------------------
// Validation: re-read every file, check it parses and the figures sit inside the spec
// ---------------------------------------------------------------------------

function validate() {
  const files = [
    'coverageAreas.json', 'homes.json', 'fires.json', 'agentTimelines.json', 'historicalFires.json',
    'models.json', 'seasonStats.json', 'portfolio.json', 'alertSummary.json',
  ]
  const d = Object.fromEntries(files.map((f) => [f, readJson(f)]))
  const problems = []
  const check = (ok, msg) => ok || problems.push(msg)

  const areas = d['coverageAreas.json']
  const homes = d['homes.json']
  const fires = d['fires.json']
  check(areas.length === 6, 'six coverage areas')
  for (const a of areas) {
    const across = Math.sqrt((a.hectares * 10000) / Math.PI) * 2 / 1000
    check(across >= 8 && across <= 15, `${a.id} is ${across.toFixed(1)} km across`)
  }
  check(homes.length >= 570 && homes.length <= 630, 'about 600 homes')
  check(new Set(homes.map((h) => h.id)).size === homes.length, 'unique home ids')
  check(new Set(homes.map((h) => h.address + h.locality)).size === homes.length, 'unique addresses')
  for (const h of homes) {
    check(h.tiv >= 180000 && h.tiv <= 1400000, `${h.id} TIV ${h.tiv}`)
    const rate = h.annualPremium / h.tiv
    check(rate > 0.0045 && rate < 0.0075, `${h.id} premium rate ${rate}`)
  }
  check(fires.length === 6, 'six fires')
  for (const f of fires) {
    check(f.daysUntilFire >= 6 && f.daysUntilFire <= 29, `${f.id} days until fire`)
    check(f.window.days >= 4 && f.window.days <= 7, `${f.id} window`)
    check(f.homesInPath.length >= 20 && f.homesInPath.length <= 80, `${f.id} homes in path ${f.homesInPath.length}`)
    check(f.intervention.cost >= 90000 && f.intervention.cost <= 400000, `${f.id} cost`)
    check(f.intervention.preventionProbability >= 0.78 && f.intervention.preventionProbability <= 0.91, `${f.id} prevention`)
    const ratio = f.exposure.expectedLoss / f.exposure.tiv
    check(ratio > 0.65 && ratio < 0.75, `${f.id} expected loss ratio ${ratio.toFixed(2)}`)
    const ha = f.spread.steps.map((s) => s.hectares)
    check(ha.every((x, i) => i === 0 || x >= ha[i - 1]), `${f.id} perimeters grow`)
    check(f.spread.steps.length === 3 + f.window.days - 1, `${f.id} step count`)
    check(f.calledOn <= ISSUE_DATE, `${f.id} called before issue`)
  }
  const procs = d['agentTimelines.json'].processes
  check(procs.length === 8, 'eight agent processes')
  check(procs.some((p) => p.entries.some((e) => e.refusal)), 'declined entries present')
  const hist = d['historicalFires.json']
  check(hist.length === 12, 'twelve historical fires')
  for (const outcome of ['prevented', 'declined', 'backtest']) check(hist.some((h) => h.outcome === outcome), `outcome ${outcome}`)
  const m = d['models.json'].models
  const primer = m.find((x) => x.isPrimer)
  const gaps = d['models.json'].leadTimes.map((lt) => primer.hitRate[lt] - Math.max(...m.filter((x) => !x.isPrimer).map((x) => x.hitRate[lt])))
  check(gaps.every((g, i) => g > 0 && (i === 0 || g > gaps[i - 1])), 'PRIMER ahead with a widening gap')

  if (problems.length) {
    console.error('Validation failed:\n  ' + problems.join('\n  '))
    process.exit(1)
  }

  const fmtM = (n) => `$${(n / 1e6).toFixed(1)}M`
  console.log('Wrote src/data (all files parse and pass checks)\n')
  console.log(`coverageAreas.json   ${areas.length} areas, ${areas.reduce((s, a) => s + a.hectares, 0).toLocaleString('en-US')} ha`)
  for (const a of areas) {
    console.log(`  ${a.code} ${a.name.padEnd(14)} ${String(a.homesCount).padStart(3)} homes  ${fmtM(a.tiv).padStart(7)} TIV  ${a.hectares.toLocaleString('en-US').padStart(6)} ha`)
  }
  console.log(`homes.json           ${homes.length} homes, ${fmtM(homes.reduce((s, h) => s + h.tiv, 0))} TIV`)
  console.log(`fires.json           ${fires.length} fires`)
  for (const f of fires) {
    console.log(
      `  ${f.id}  ${String(f.daysUntilFire).padStart(2)} days out  ${f.window.days}-day window  ${String(f.homesInPath.length).padStart(2)} homes  ` +
        `${fmtM(f.exposure.tiv).padStart(6)} TIV  ${fmtM(f.exposure.expectedLoss).padStart(6)} EL  cost $${Math.round(f.intervention.cost / 1000)}k  ${f.intervention.stage}`,
    )
  }
  console.log(`agentTimelines.json  ${procs.length} processes, ${procs.reduce((s, p) => s + p.entries.length, 0)} entries, ${procs.reduce((s, p) => s + p.entries.filter((e) => e.refusal).length, 0)} refusals`)
  console.log(`historicalFires.json ${hist.length} fires (${['prevented', 'declined', 'backtest'].map((o) => `${hist.filter((h) => h.outcome === o).length} ${o}`).join(', ')})`)
  console.log(`models.json          ${m.length} models (${m.map((x) => x.name).join(', ')})`)
  const s = d['seasonStats.json']
  console.log(`seasonStats.json     ${s.firesDated} dated, ${s.prevented} prevented, ${fmtM(s.premiumSaved)} premium saved, ${fmtM(s.realisedLossOnDeclined)} realised loss on declined`)
  const al = d['alertSummary.json']
  console.log(`alertSummary.json    ${fmtM(al.tivWillBurn)} TIV will burn, ${fmtM(al.premiumAtRisk)} premium at risk, ${al.homesInPath} homes, ${fmtM(al.preventableIfIntervened)} preventable`)
  const pf = d['portfolio.json']
  console.log(`portfolio.json       ${fmtM(pf.tiv)} TIV, ${pf.homesCovered} homes, ${pf.hectaresUnderForecast.toLocaleString('en-US')} ha under forecast`)
}

main()
