import { TriangleAlert } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { alertTotals, visibleFires } from '../../lib/selectors.js'
import { formatNumber, formatUSDCompact, formatUSDRange } from '../../lib/format.js'
import AnimatedValue from '../common/AnimatedValue.jsx'

/** Top-right "Next 30 days": sums over the fires visible at the current slider position. */
export default function AlertCard({ hidden }) {
  const { daysUntilFire, portfolioId, views } = useApp()
  const t = alertTotals(visibleFires({ slider: daysUntilFire, views, portfolioId }), portfolioId)

  const rows = [
    { label: 'Exposed TIV', value: t.exposedTiv, format: formatUSDCompact },
    { label: 'Dated fires', value: t.datedFires, format: formatNumber },
    { label: 'Watchlist', value: t.watchlist, format: formatNumber },
    { label: 'Homes in path', value: t.homesInPath, format: formatNumber },
    { label: 'Assets in path', value: t.assetsInPath, format: formatNumber },
    { label: 'Preventable at negotiated plans', value: t.preventable, format: formatUSDCompact, tone: 'green' },
    { label: 'Carrier cost to date', value: t.carrierCost, format: formatUSDCompact },
  ]

  return (
    <aside className={`glass alert30${hidden ? ' is-hidden' : ''}`} aria-label="Next 30 days" aria-live="polite">
      <header className="alert30-head">
        <TriangleAlert size={15} aria-hidden="true" />
        <span>Next 30 days</span>
        <span className="alert30-count">
          {t.datedFires} {t.datedFires === 1 ? 'fire' : 'fires'} in view
        </span>
      </header>
      <div className="alert30-hero">
        <span className="label">Expected loss</span>
        <span className="figure">
          <AnimatedValue value={t.expectedLoss} format={formatUSDCompact} />
        </span>
        <div className="alert30-band">
          {t.datedFires > 0 ? `Band ${formatUSDRange(t.lossLower, t.lossUpper)}` : 'Band $0'}
        </div>
      </div>
      <dl className="alert30-rows">
        {rows.map((row) => (
          <div key={row.label} className={`alert30-row${row.tone ? ` tone-${row.tone}` : ''}`}>
            <dt>{row.label}</dt>
            <dd>
              <AnimatedValue value={row.value} format={row.format} />
            </dd>
          </div>
        ))}
      </dl>
      {t.datedFires === 0 && <p className="alert30-empty">Drag “Days until fire” towards 0 to reveal the fires PRIMER has dated.</p>}
    </aside>
  )
}
