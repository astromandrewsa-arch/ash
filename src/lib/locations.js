// Locations at Risk (CLAUDE.md §13): one ELT-style row per dated fire, filters and sorting.
import { store } from './store.js'
import { bookFires } from './selectors.js'

/** Rows for the fires in a book, with everything the table and the filters read. */
export function fireRows(portfolioId) {
  return bookFires(portfolioId).map((f) => {
    const plan = store.planByFire.get(f.id)
    const neg = store.negotiationByFire.get(f.id)
    const bundleIds = new Set(f.areaIds.map((id) => store.areaById.get(id)?.bundleId).filter(Boolean))
    return {
      id: f.id,
      fire: f,
      name: f.name,
      place: f.place,
      state: f.state,
      type: f.exposureType,
      types: f.exposureTypes,
      daysAway: f.daysUntilFire,
      window: f.windowLabel,
      windowStart: f.windowStart,
      probability: f.probability,
      severity: f.severity,
      homes: f.bands.p50.homes,
      assets: f.bands.p50.assets,
      tiv: f.bands.p50.tiv,
      lower: f.lossLower,
      point: f.lossPoint,
      upper: f.lossUpper,
      sd: f.sd,
      rp: f.returnPeriodYears,
      verdict: plan?.verdict ?? '—',
      stage: neg?.stage ?? '—',
      bundleIds,
    }
  })
}

export const FILTER_DEFAULTS = { type: 'all', state: 'all', bundle: 'all', severity: 'all', minProb: 0, maxDays: 99, verdict: 'all', stage: 'all' }

export const isFiltered = (f) => Object.keys(FILTER_DEFAULTS).some((k) => f[k] !== FILTER_DEFAULTS[k])

export function applyFilters(rows, f) {
  return rows.filter(
    (r) =>
      (f.type === 'all' || r.types.includes(f.type)) &&
      (f.state === 'all' || r.state === f.state) &&
      (f.bundle === 'all' || r.bundleIds.has(f.bundle)) &&
      (f.severity === 'all' || r.severity === f.severity) &&
      r.probability >= f.minProb &&
      r.daysAway <= f.maxDays &&
      (f.verdict === 'all' || r.verdict === f.verdict) &&
      (f.stage === 'all' || r.stage === f.stage),
  )
}

const TEXT_KEYS = new Set(['id', 'place', 'state', 'type', 'windowStart', 'severity', 'verdict', 'stage'])

export function sortRows(rows, key, dir) {
  const cmp = TEXT_KEYS.has(key) ? (a, b) => String(a[key]).localeCompare(String(b[key])) : (a, b) => a[key] - b[key]
  return [...rows].sort((a, b) => dir * cmp(a, b) || a.daysAway - b.daysAway)
}
