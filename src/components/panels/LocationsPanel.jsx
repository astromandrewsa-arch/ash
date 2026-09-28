import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { areas, portfolio } from '../../lib/data.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import CollapsibleCard from '../common/CollapsibleCard.jsx'

export default function LocationsPanel() {
  const [portfolioId, setPortfolioId] = useState(portfolio.options[0].id)

  const figures = [
    { label: 'TIV', value: formatUSDCompact(portfolio.tiv) },
    { label: 'Homes covered', value: formatNumber(portfolio.homesCovered) },
    { label: 'Hectares under forecast', value: formatNumber(portfolio.hectaresUnderForecast) },
  ]

  return (
    <CollapsibleCard title="Your Locations" icon={Building2} className="locations-panel">
      <label className="select-control portfolio-select">
        <select value={portfolioId} onChange={(e) => setPortfolioId(e.target.value)} aria-label="Portfolio">
          {portfolio.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select-control-caret" aria-hidden="true" />
      </label>

      <dl className="figure-grid">
        {figures.map((figure) => (
          <div key={figure.label} className="figure">
            <dt>{figure.label}</dt>
            <dd>{figure.value}</dd>
          </div>
        ))}
      </dl>
      <p className="panel-footnote">
        {areas.length} coverage areas · {formatUSDCompact(portfolio.annualPremium)} annual premium
      </p>
    </CollapsibleCard>
  )
}
