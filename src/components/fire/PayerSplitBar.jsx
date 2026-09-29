import { formatUSDIn } from '../../lib/format.js'
import { PAYERS } from './payers.js'

/**
 * Who pays: a stacked bar with a legend of amounts, all in one unit. `pending` holds amounts agreed
 * in principle but not signed; they draw hatched and are listed as such.
 */
export default function PayerSplitBar({ split, pending = null, total }) {
  const parts = PAYERS.map((p) => ({ ...p, value: split?.[p.key] || 0, pending: pending?.[p.key] || 0 })).filter((p) => p.value > 0 || p.pending > 0)
  const sum = total || parts.reduce((s, p) => s + p.value + p.pending, 0)
  if (!sum) return <p className="card-text muted">No payer yet: nothing agreed.</p>
  const max = Math.max(...parts.map((p) => p.value + p.pending))
  return (
    <div className="payer-split">
      <div className="payer-bar" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.key} className={p.value ? undefined : 'is-pending'} style={{ width: `${((p.value + p.pending) / sum) * 100}%`, '--payer': p.color }} />
        ))}
      </div>
      <ul className="payer-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <i className={p.value ? undefined : 'is-pending'} style={{ '--payer': p.color }} />
            <span>
              {p.label}
              {!p.value && <em> · in principle</em>}
            </span>
            <strong>{formatUSDIn(p.value + p.pending, max)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
