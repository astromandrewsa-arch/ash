import { Briefcase, ChevronDown } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { portfolios } from '../../lib/shellData.js'

export default function PortfolioSwitch() {
  const { portfolioId, setPortfolio } = useApp()
  return (
    <label className="select-wrap" title="Portfolio">
      <Briefcase size={15} className="select-icon" aria-hidden="true" />
      <select value={portfolioId} onChange={(e) => setPortfolio(e.target.value)} aria-label="Portfolio">
        {portfolios.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="select-caret" aria-hidden="true" />
    </label>
  )
}
