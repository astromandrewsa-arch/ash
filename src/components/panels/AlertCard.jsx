import { TriangleAlert } from 'lucide-react'
import alertSummary from '../../data/alertSummary.json'
import { fireTotals, presetById, visibleFires } from '../../lib/data.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import AnimatedValue from '../common/AnimatedValue.jsx'

export default function AlertCard() {
  const { daysUntilFire, preset } = useApp()
  const totals = fireTotals(visibleFires(daysUntilFire))

  const rows = [
    { label: 'Premium at risk', value: totals.premiumAtRisk, format: formatUSDCompact },
    { label: 'Dated fires', value: totals.datedFires, format: formatNumber },
    { label: 'Homes in path', value: totals.homesInPath, format: formatNumber },
    { label: 'Preventable if intervened', value: totals.preventable, format: formatUSDCompact, tone: 'saving' },
  ]

  return (
    <aside className="card alert-card" aria-label={alertSummary.title} aria-live="polite">
      <header className="alert-card-head">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>{alertSummary.title}</span>
        <span className="alert-card-preset">{presetById[preset].label}</span>
      </header>
      <div className="alert-card-hero">
        <span className="alert-card-hero-label">Total insured value that will burn</span>
        <span className="alert-card-hero-value">
          <AnimatedValue value={totals.tivInPath} format={formatUSDCompact} />
        </span>
      </div>
      <dl className="alert-card-rows">
        {rows.map((row) => (
          <div key={row.label} className={`alert-card-row${row.tone ? ` tone-${row.tone}` : ''}`}>
            <dt>{row.label}</dt>
            <dd>
              <AnimatedValue value={row.value} format={row.format} />
            </dd>
          </div>
        ))}
      </dl>
      {totals.datedFires === 0 && <p className="alert-card-empty">Drag “Days until fire” to reveal dated fires.</p>}
    </aside>
  )
}
