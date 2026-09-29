import { ArrowRight } from 'lucide-react'
import { formatPctSigned } from '../../lib/format.js'
import { splitRecommendation } from '../../lib/premium.js'

/** Market rate against PRIMER's technical rate, and the 2027 change against the carrier's filing. */
export default function RateCompare({ bundle: b }) {
  const { figure, note } = splitRecommendation(b.recommendationText)
  return (
    <div className="rate-compare">
      <div className="rc-rates">
        <div>
          <span className="label">Market rate</span>
          <strong>${b.marketRatePer1000.toFixed(1)}</strong>
        </div>
        <ArrowRight size={18} className="rc-arrow" aria-hidden="true" />
        <div>
          <span className="label">PRIMER technical rate</span>
          <strong className={b.underPriced ? 'is-under' : 'is-over'}>${b.primerRatePer1000.toFixed(1)}</strong>
        </div>
        <span className="rc-unit">per $1,000 of TIV</span>
      </div>
      <div className="rc-2027">
        <span className="label">2027</span>
        <span>
          PRIMER recommends <strong className={b.recommendation2027 < 0 ? 'is-down' : 'is-up'}>{figure}</strong>
          {note ? ` (${note})` : ''}; the carrier filed <strong>{formatPctSigned(b.filed2027)}</strong>
        </span>
      </div>
    </div>
  )
}
