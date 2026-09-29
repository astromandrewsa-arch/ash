// Derived figures for the map and its panels, computed from the store and the current app state.
import { store } from './store.js'

export const portfolioOf = (id) => store.portfolio.portfolios.find((p) => p.id === id) || store.portfolio.portfolios[0]
export const inBook = (state, portfolioId) => portfolioOf(portfolioId).states.includes(state)
export const areaInBook = (areaId, portfolioId) => inBook(store.areaById.get(areaId)?.state, portfolioId)

/** Dated fires in the selected book, soonest window first. */
export function bookFires(portfolioId) {
  return store.fires.filter((f) => inBook(f.state, portfolioId)).sort((a, b) => a.daysUntilFire - b.daysUntilFire)
}

/** A fire dated N days out appears when the slider reaches −N and stays (§9). */
export const revealedAt = (fire, slider) => slider >= -fire.daysUntilFire

export function fireShown(fire, { slider, views, portfolioId }) {
  if (!views.dated || !inBook(fire.state, portfolioId) || !revealedAt(fire, slider)) return false
  return fire.severity === 'Severe' ? views.severe : views.nonSevere
}

export function visibleFires(state) {
  return store.fires.filter((f) => fireShown(f, state))
}

export function watchlistInBook(portfolioId) {
  return store.watchlist.filter((w) => areaInBook(w.areaId, portfolioId))
}

/** Each fire's burn window in days after the issue date, for the slider's tick bands. */
export function sliderBands(portfolioId) {
  return bookFires(portfolioId).map((f) => ({
    id: f.id,
    name: f.name,
    severity: f.severity,
    startDay: f.daysUntilFire,
    endDay: f.daysUntilFire + f.windowDays - 1,
  }))
}

/** "Next 30 days": sums over the fires visible at the current slider position (§4, §8). */
export function alertTotals(fires, portfolioId) {
  const t = { datedFires: fires.length, expectedLoss: 0, lossLower: 0, lossUpper: 0, exposedTiv: 0, homesInPath: 0, assetsInPath: 0, preventable: 0, carrierCost: 0, watchlist: 0 }
  for (const f of fires) {
    t.expectedLoss += f.probability * f.lossPoint
    t.lossLower += f.probability * f.lossLower
    t.lossUpper += f.probability * f.lossUpper
    t.exposedTiv += f.bands.p50.tiv
    t.homesInPath += f.bands.p50.homes
    t.assetsInPath += f.bands.p50.assets
    const neg = store.negotiationByFire.get(f.id)
    if (neg) {
      t.preventable += neg.ledger.saving
      t.carrierCost += neg.payerAgreed?.carrier ?? 0
    }
  }
  t.watchlist = watchlistInBook(portfolioId).length
  return t
}

/** "Your book" panel figures for a portfolio. */
export function bookSummary(portfolioId) {
  const p = portfolioOf(portfolioId)
  return { ...p.totals, name: p.name, short: p.short, areas: p.areas, dataQuality: p.dataQuality }
}

const AGREED = new Set(['Work agreed', 'Work complete', 'Fire prevented'])
const MOVING = new Set(['Agent engaged', 'Government in negotiation', 'Partial', 'State plan'])

/** Intervention status ring colour for a negotiation stage (§9 RAG ring). */
export function stageRag(stage) {
  if (AGREED.has(stage)) return 'green'
  if (MOVING.has(stage)) return 'amber'
  return 'red'
}
