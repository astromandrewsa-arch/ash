import { formatUSDCompact } from '../../lib/format.js'
import { PAYERS } from '../fire/payers.js'

/** A compact stacked bar of who pays for a plan (the full legend lives in the drawer). */
export default function PayerMiniBar({ split, total }) {
  const parts = PAYERS.map((p) => ({ ...p, value: split[p.key] || 0 })).filter((p) => p.value > 0)
  if (!total) return <span className="muted">—</span>
  const title = parts.map((p) => `${p.label} ${formatUSDCompact(p.value)}`).join(' · ')
  return (
    <span className="payer-mini" title={title} aria-label={title}>
      {parts.map((p) => (
        <i key={p.key} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
      ))}
    </span>
  )
}
