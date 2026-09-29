// Loss arithmetic (CLAUDE.md §8, §11, §14): damage ratios, bands, gross vs ground-up, the book's
// EP curve and return periods, and the three Simulation outcomes.

import { clamp, round, sum } from './geo.mjs'

// Mean damage ratio by construction (§8); roof class and defensible space nudge it per home.
export const CONSTRUCTION_DR = { Frame: 0.72, Masonry: 0.55, Steel: 0.45 }
const ROOF = { A: 0.92, B: 1.0, C: 1.08 }
const spaceFactor = (m) => (m >= 30 ? 0.9 : m >= 10 ? 1.0 : 1.08)

export function homeDamageRatio(home) {
  return CONSTRUCTION_DR[home.construction] * ROOF[home.roofClass] * spaceFactor(home.defensibleSpaceM)
}

// Assets and rangeland (§8: utilities 0.15–0.35, rangeland components set per item).
export const ASSET_DR = { line: 0.35, pipeline: 0.15, station: 0.3, refinery: 0.2, tankfarm: 0.25, turbine: 0.3, substation: 0.3 }
export const RANCH_DR = { forage: 0.9, fencing: 0.8, livestock: 0.12, structures: 0.6, outbuilding: 0.6 }

// Gross: 2% deductible and a $1.2M per-location limit (§8).
export const DEDUCTIBLE = 0.02
export const LOCATION_LIMIT = 1.2e6

export function grossOf(items) {
  return sum(items, (it) => clamp(it.loss - DEDUCTIBLE * it.tiv, 0, LOCATION_LIMIT))
}

/**
 * Calibrate one fire's band severity factors. Each band is a whole footprint (P90 ⊆ P50 ⊆ P25)
 * burning under its own spread scenario (0.8R, R, 1.25R): intensity, and so damage, rises with
 * the rate of spread, so each band carries its own damage-ratio multiplier. The multipliers are
 * solved so each band's loss lands on its target, then rounded to 0.01.
 */
export function calibrate(bands, targets) {
  const factor = {}
  for (const key of ['p90', 'p50', 'p25']) {
    const base = sum(bands[key], (it) => it.base)
    factor[key] = round(clamp(targets[key] / Math.max(base, 1), 0.35, 1.6), 2)
  }
  return factor
}

// ---------------------------------------------------------------------------
// Book EP curve (occurrence exceedance, per year) and return periods
// ---------------------------------------------------------------------------

/** Return period (years) of a loss on an EP curve given as [{ rp, loss }] ascending in rp. */
export function returnPeriod(curve, loss) {
  if (loss <= curve[0].loss) return round(Math.max(1, curve[0].rp * (loss / curve[0].loss)), 1)
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1]
    const b = curve[i]
    if (loss <= b.loss) {
      // Interpolate in log-return-period space.
      const t = (loss - a.loss) / (b.loss - a.loss)
      return round(Math.exp(Math.log(a.rp) + t * (Math.log(b.rp) - Math.log(a.rp))), 1)
    }
  }
  return curve[curve.length - 1].rp
}

export function lossAt(curve, rp) {
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1]
    const b = curve[i]
    if (rp <= b.rp) {
      const t = (Math.log(rp) - Math.log(a.rp)) / (Math.log(b.rp) - Math.log(a.rp))
      return a.loss + t * (b.loss - a.loss)
    }
  }
  return curve[curve.length - 1].loss
}

/** TVaR at a return period: the mean loss beyond it, integrating the curve's tail. */
export function tvar(curve, rp) {
  const pts = []
  const start = 1 / rp
  for (let i = 0; i <= 200; i++) {
    const p = start * (1 - i / 200) + 1e-6
    pts.push(lossAt(curve, Math.min(curve[curve.length - 1].rp, 1 / p)))
  }
  return sum(pts) / pts.length
}

// ---------------------------------------------------------------------------
// Simulation outcomes (§14)
// ---------------------------------------------------------------------------

/**
 * E[none] = pFire × lossPoint
 * E[plan] = pFireAfterPlan × (pPrevent × lossIfHolds + (1 − pPrevent) × lossIfFails) + cost
 *           (a state agency plan cannot prevent the fire; its reduced loss applies whenever it burns)
 * E[fails] = pFire × lossIfFails + cost (a failed plan also loses the PSPS cut in fire probability)
 */
export function outcomes(fire, plan) {
  const pPrevent = plan.pPrevent ?? 0
  const none = fire.probability * fire.lossPoint
  const burnLoss = plan.statePlan ? plan.lossIfHolds : pPrevent * plan.lossIfHolds + (1 - pPrevent) * plan.lossIfFails
  const asNegotiated = plan.pFireAfterPlan * burnLoss + plan.cost
  const fails = fire.probability * plan.lossIfFails + plan.cost
  return { none, asNegotiated, fails, carrier: plan.payerSplit.carrier || 0 }
}
