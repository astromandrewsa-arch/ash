import { formatUSDCompact } from '../../lib/format.js'
import { PAYERS } from './payers.js'

/** Who pays for the plan: a stacked bar with a legend of amounts. */
export default function PayerSplitBar({ split, total }) {
  const parts = PAYERS.map((p) => ({ ...p, value: split[p.key] || 0 })).filter((p) => p.value > 0)
  const sum = total || parts.reduce((s, p) => s + p.value, 0)
  if (!sum) return <p className="card-text muted">No payer yet: nothing agreed.</p>
  return (
    <div className="payer-split">
      <div className="payer-bar" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.key} style={{ width: `${(p.value / sum) * 100}%`, background: p.color }} title={`${p.label} ${formatUSDCompact(p.value)}`} />
        ))}
      </div>
      <ul className="payer-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <i style={{ background: p.color }} />
            <span>{p.label}</span>
            <strong>{formatUSDCompact(p.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
