// Simulation (CLAUDE.md §14): the three 30-day outcomes per fire and for the book, computed from
// fires.json and plans.json. State agency plans reduce loss but cannot prevent the fire, so their
// "as negotiated" figure uses the loss with the plan in place; a failed plan leaves the dated
// probability in force (DECISIONS.md). The generator's checkData prints the same totals.
import { store } from './store.js'
import { bookFires, portfolioOf } from './selectors.js'
import { returnPeriod } from './ep.js'

export const OUTCOMES = [
  { id: 'none', label: 'No intervention' },
  { id: 'asNegotiated', label: 'As negotiated' },
  { id: 'fails', label: 'Every plan fails' },
]

export function fireOutcomes(fire, plan) {
  const pPrevent = plan.pPrevent ?? 0
  const none = fire.probability * fire.lossPoint
  const burnLoss = plan.statePlan ? plan.lossIfHolds : pPrevent * plan.lossIfHolds + (1 - pPrevent) * plan.lossIfFails
  const asNegotiated = plan.pFireAfterPlan * burnLoss + plan.cost
  const fails = fire.probability * plan.lossIfFails + plan.cost
  return { none, asNegotiated, fails, carrier: plan.payerSplit.carrier || 0 }
}

const AGREED = new Set(['Work agreed', 'Work complete', 'Fire prevented', 'Partial', 'State plan'])

export function bookSimulation(portfolioId) {
  const p = portfolioOf(portfolioId)
  const rows = bookFires(portfolioId).map((fire) => {
    const plan = store.planByFire.get(fire.id)
    const neg = store.negotiationByFire.get(fire.id)
    return { fire, plan, neg, agreed: AGREED.has(neg?.stage), ...fireOutcomes(fire, plan) }
  })
  const totals = { none: 0, asNegotiated: 0, fails: 0, carrier: 0, cost: 0 }
  for (const r of rows) {
    for (const k of ['none', 'asNegotiated', 'fails', 'carrier']) totals[k] += r[k]
    totals.cost += r.plan.cost
  }
  // Homeowners premium on every home inside any band of a dated fire.
  const seen = new Set()
  let premiumAtRisk = 0
  for (const r of rows) {
    for (const h of r.fire.homesInPath) {
      if (seen.has(h.homeId)) continue
      seen.add(h.homeId)
      premiumAtRisk += store.homeById.get(h.homeId)?.premium || 0
    }
  }
  const premium = p.totals.premium
  const ratio = (v) => v / premium
  const rp = (v) => returnPeriod(p.epCurve, v)
  return {
    rows,
    totals,
    premium,
    premiumAtRisk,
    lossRatio: { none: ratio(totals.none), asNegotiated: ratio(totals.asNegotiated), fails: ratio(totals.fails) },
    returnPeriods: { none: rp(totals.none), asNegotiated: rp(totals.asNegotiated), fails: rp(totals.fails) },
  }
}
