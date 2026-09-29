// Premium Intelligence (CLAUDE.md §15): the bundles in a book, sorting and the all-bundles row.
import { store } from './store.js'
import { inBook } from './selectors.js'

/** The bundles priced in the selected book. */
export function bundlesInBook(portfolioId) {
  return store.bundles.filter((b) => inBook(b.state, portfolioId))
}

const TEXT_KEYS = new Set(['name'])

/** Sort by one column; ties keep the §15 list order. */
export function sortBundles(rows, key, dir) {
  const order = new Map(store.bundles.map((b, i) => [b.id, i]))
  const cmp = TEXT_KEYS.has(key) ? (a, b) => a[key].localeCompare(b[key]) : (a, b) => a[key] - b[key]
  return [...rows].sort((a, b) => dir * cmp(a, b) || order.get(a.id) - order.get(b.id))
}

/** The all-bundles row: sums, and rates weighted by TIV. */
export function bundleTotals(rows) {
  const sum = (f) => rows.reduce((s, b) => s + f(b), 0)
  const tiv = sum((b) => b.tiv)
  const premium = sum((b) => b.premium)
  const technicalPremium = sum((b) => b.technicalPremium)
  const market = (premium / tiv) * 1000
  const primer = (technicalPremium / tiv) * 1000
  return {
    policies: sum((b) => b.policies),
    tiv,
    premium,
    technicalPremium,
    premiumGap: technicalPremium - premium,
    marketRatePer1000: market,
    primerRatePer1000: primer,
    adequacy: market / primer - 1,
    recommendation2027: sum((b) => b.recommendation2027 * b.premium) / premium,
    filed2027: sum((b) => b.filed2027 * b.premium) / premium,
  }
}

/** The 2027 gap the map shades in 2027 mode: the carrier's filed change less PRIMER's recommendation. */
export const filedGap = (b) => b.filed2027 - b.recommendation2027

/** The recommendation's headline figure and its note ("+31%", "corridor homes to a surcharge class"). */
export function splitRecommendation(text) {
  const i = text.indexOf(',')
  return i < 0 ? { figure: text, note: null } : { figure: text.slice(0, i), note: text.slice(i + 1).trim() }
}
