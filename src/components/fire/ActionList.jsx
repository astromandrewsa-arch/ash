import { dateRange } from '../../lib/dates.js'
import { formatUSDCompact } from '../../lib/format.js'
import { PAYERS } from './payers.js'

const payerLabel = (key) => PAYERS.find((p) => p.key === key)?.label ?? key

/** The plan's actions with owner, payer, cost and dates (§11). */
export default function ActionList({ actions }) {
  if (!actions.length) return <p className="card-text muted">No actions: the plan was withdrawn.</p>
  return (
    <ol className="actions">
      {actions.map((a) => (
        <li key={a.text}>
          <div className="action-main">
            <span className="action-text">{a.text}</span>
            <span className="action-cost">{formatUSDCompact(a.cost)}</span>
          </div>
          <div className="action-meta">
            <span>{a.owner}</span>
            <span>Paid by {payerLabel(a.payer).toLowerCase()}</span>
            <span>{dateRange(a.start, a.end)}</span>
            {a.unit && <span className="action-unit">{a.unit}</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}
