import { formatPct, formatUSDCompact } from '../../lib/format.js'

/**
 * Cost against the loss the plan avoids, and the green net (§10 Plan tab, §14 formulas):
 * E[none] = pFire × point loss; E[plan] = pFire after plan × (pPrevent × loss if it holds +
 * (1 − pPrevent) × loss if it fails) + cost. Both come from the data (plan.expected).
 */
export default function CostVsLoss({ plan, fire }) {
  const e = plan.expected
  const lossAfter = e.asNegotiated - plan.cost
  const net = e.none - e.asNegotiated
  if (plan.verdict === 'No action') {
    return (
      <p className="card-text">
        No plan: expected loss stays at {formatUSDCompact(e.none)} ({formatPct(fire.probability)} × {formatUSDCompact(fire.lossPoint)} point loss).
      </p>
    )
  }
  return (
    <div className="cost-loss">
      <div className="cost-loss-row">
        <span>Expected loss, no intervention</span>
        <strong>{formatUSDCompact(e.none)}</strong>
      </div>
      <div className="cost-loss-row">
        <span>Expected loss with the plan</span>
        <strong>{formatUSDCompact(lossAfter)}</strong>
      </div>
      <div className="cost-loss-row">
        <span>Plan cost</span>
        <strong>{formatUSDCompact(plan.cost)}</strong>
      </div>
      <div className={`cost-loss-row is-net${net > 0 ? '' : ' is-flat'}`}>
        <span>Net saving</span>
        <strong>{formatUSDCompact(net)}</strong>
      </div>
      <p className="cost-loss-note">
        P(prevent) {plan.pPrevent == null ? 'n/a' : formatPct(plan.pPrevent)} · P(fire after plan) {formatPct(plan.pFireAfterPlan)} · loss if the plan holds {formatUSDCompact(plan.lossIfHolds)}, if it fails {formatUSDCompact(plan.lossIfFails)} · dated at {formatPct(fire.probability)}
      </p>
    </div>
  )
}
