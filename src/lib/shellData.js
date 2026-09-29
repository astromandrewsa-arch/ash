// Figures for the shell panels (Your book, Next 30 days, slider).
// Pass 1: an adapter over the v1 data so the v2 shell runs before the v2 generator exists.
// Pass 3 rewrites this module against the v2 files; component imports stay the same.
import meta from '../data/meta.json'
import portfolioData from '../data/portfolio.json'
import v1Portfolio from '../data/v1/portfolio.json'
import { areas, fires, homes } from './data.js'

export { meta }
export const portfolios = portfolioData.portfolios
export const defaultPortfolioId = portfolioData.defaultId
export const portfolioById = Object.fromEntries(portfolios.map((p) => [p.id, p]))

const isSevere = (f) => ['Extreme', 'Very High'].includes(f.intensity.class)

/** Each dated fire's burn window as days after the issue date, for the slider's tick bands. */
export const sliderFires = fires.map((f) => ({
  id: f.id,
  name: f.place,
  severity: isSevere(f) ? 'Severe' : 'Non-severe',
  startDay: f.daysUntilFire,
  endDay: f.daysUntilFire + f.window.days - 1,
}))

/** A fire dated N days out appears when the slider reaches −N and stays. */
export function isVisibleAt(fireStartDay, sliderValue) {
  return sliderValue >= -fireStartDay
}

export function alertTotals(sliderValue) {
  const shown = fires.filter((f) => isVisibleAt(f.daysUntilFire, sliderValue))
  const sum = (fn) => shown.reduce((s, f) => s + fn(f), 0)
  return {
    datedFires: shown.length,
    expectedLoss: sum((f) => f.probability * f.exposure.expectedLoss),
    lossLower: sum((f) => f.probability * f.exposure.expectedLoss * f.spreadCertainty),
    lossUpper: sum((f) => f.probability * f.exposure.tiv),
    exposedTiv: sum((f) => f.exposure.tiv),
    watchlist: 0,
    homesInPath: sum((f) => f.exposure.homesEngulfed),
    assetsInPath: 0,
    preventable: sum((f) => f.intervention.lossAvoided),
    carrierCost: 0,
  }
}

export function bookSummary() {
  return {
    tiv: v1Portfolio.tiv,
    homes: v1Portfolio.homesCovered,
    assets: 0,
    hectares: v1Portfolio.hectaresUnderForecast,
    premium: v1Portfolio.annualPremium,
    areas: areas.length,
    geocodeBuildingPct: homes.filter((h) => h.footprint).length / homes.length,
    itvFlagged: 0,
  }
}

/** The map opens on Texas (CLAUDE.md §9) whichever book is selected first. */
export const initialView = portfolioData.initialView
