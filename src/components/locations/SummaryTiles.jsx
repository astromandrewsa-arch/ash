import { alertTotals } from '../../lib/selectors.js'
import { formatNumber, formatUSDCompact, formatUSDRange } from '../../lib/format.js'
import KpiTile from '../common/KpiTile.jsx'

/** §13 summary tiles over the book's dated fires. */
export default function SummaryTiles({ fires, portfolioId }) {
  const t = alertTotals(fires, portfolioId)
  return (
    <div className="kpi-row">
      <KpiTile label="Fires dated" value={formatNumber(t.datedFires)} note="next 30 days" />
      <KpiTile label="Watchlist" value={formatNumber(t.watchlist)} note="below the 90% call" />
      <KpiTile label="Homes in path" value={formatNumber(t.homesInPath)} note="P50" />
      <KpiTile label="Assets in path" value={formatNumber(t.assetsInPath)} note="P50" />
      <KpiTile label="Exposed TIV" value={formatUSDCompact(t.exposedTiv)} note="inside P50 paths" />
      <KpiTile label="Expected loss" value={formatUSDCompact(t.expectedLoss)} note={`Band ${formatUSDRange(t.lossLower, t.lossUpper)}`} tone="loss" />
      <KpiTile label="Preventable" value={formatUSDCompact(t.preventable)} note="at negotiated plans" tone="saving" />
    </div>
  )
}
