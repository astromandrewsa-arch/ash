import { TriangleAlert } from 'lucide-react'
import alertSummary from '../data/alertSummary.json'
import { formatNumber, formatUSDCompact } from '../utils/format.js'

export default function AlertCard() {
  const rows = [
    { label: 'Premium at risk', value: formatUSDCompact(alertSummary.premiumAtRisk) },
    { label: 'Dated fires', value: formatNumber(alertSummary.datedFires) },
    { label: 'Homes in path', value: formatNumber(alertSummary.homesInPath) },
    {
      label: 'Preventable if intervened',
      value: formatUSDCompact(alertSummary.preventableIfIntervened),
      tone: 'saving',
    },
  ]

  return (
    <aside className="card alert-card" aria-label={alertSummary.title}>
      <header className="alert-card-head">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>{alertSummary.title}</span>
      </header>
      <div className="alert-card-hero">
        <span className="alert-card-hero-label">Total insured value that will burn</span>
        <span className="alert-card-hero-value">{formatUSDCompact(alertSummary.tivWillBurn)}</span>
      </div>
      <dl className="alert-card-rows">
        {rows.map((row) => (
          <div key={row.label} className={`alert-card-row${row.tone ? ` tone-${row.tone}` : ''}`}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
