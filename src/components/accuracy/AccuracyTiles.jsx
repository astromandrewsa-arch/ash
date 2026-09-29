import { formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import KpiTile from '../common/KpiTile.jsx'

const FORMAT = {
  number: formatNumber,
  money: (v) => formatUSDCompact(v),
  decimal: (v) => v.toFixed(2),
  pct: (v) => formatPct(v),
}

/** §16 headline tiles for last season. */
export default function AccuracyTiles({ tiles }) {
  return (
    <div className="kpi-row">
      {tiles.map((t) => (
        <KpiTile key={t.id} label={t.label} value={FORMAT[t.format](t.value)} note={t.note} tone={t.tone} />
      ))}
    </div>
  )
}
