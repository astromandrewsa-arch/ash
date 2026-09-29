import { Sigma } from 'lucide-react'
import { formatUSDCompact } from '../../lib/format.js'
import TechnicalFormula from './TechnicalFormula.jsx'
import PricingTerms from './PricingTerms.jsx'
import InfoButton from '../common/InfoButton.jsx'
import PremiumGapBars from './PremiumGapBars.jsx'

/** The technical premium formula (§15), its inputs, and what it gives for the selected bundle. */
export default function TechnicalPremium({ bundle: b, totals, pricing: p }) {
  const short = b.premiumGap > 0
  return (
    <section className="tech glass" aria-labelledby="tech-title">
      <div className="tech-head">
        <span className="tech-icon" aria-hidden="true">
          <Sigma size={16} />
        </span>
        <h2 id="tech-title" className="label">
          Technical premium
          <InfoButton topic="premium" label="Technical premium" />
        </h2>
      </div>
      <div className="tech-body">
        <TechnicalFormula />
        <div className="tech-text">
          <p className="tech-line">
            The premium that pays PRIMER’s expected loss and its adjustment cost, covers the fixed and variable expenses and earns the target return; per $1,000 of TIV it is the PRIMER technical rate.
          </p>
          <PricingTerms pricing={p} />
        </div>
      </div>
      <PremiumGapBars rows={[{ id: b.id, name: b.name, written: b.premium, technical: b.technicalPremium }, { id: 'book', name: 'All bundles', written: totals.premium, technical: totals.technicalPremium }]} />
      <p className="tech-bundle">
        <strong>{b.name}:</strong> ${b.primerRatePer1000.toFixed(1)} per $1,000 on {formatUSDCompact(b.tiv)} of TIV is a technical premium of{' '}
        <strong>{formatUSDCompact(b.technicalPremium)}</strong> against {formatUSDCompact(b.premium)} written,{' '}
        <strong className={short ? 'is-under' : 'is-over'}>
          {formatUSDCompact(Math.abs(b.premiumGap))} {short ? 'short' : 'over'}
        </strong>
        .
      </p>
    </section>
  )
}
