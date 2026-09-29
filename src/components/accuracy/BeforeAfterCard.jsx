import { formatHa, formatNumber } from '../../lib/format.js'
import BeforeAfter from './BeforeAfter.jsx'

/** The before/after card on HC-05's analogue, with its legend and the overlap figure. */
export default function BeforeAfterCard({ exhibit: e }) {
  return (
    <section className="ba2 glass" aria-labelledby="ba2-title">
      <header className="ba2-head">
        <h2 id="ba2-title" className="acc-h2">
          {e.name} {e.year}, the analogue for HC-05
        </h2>
        <p>
          {formatNumber(e.acres)} acres ({formatHa(e.hectares)}). PRIMER’s back-test perimeter covers {e.overlapPct}% of the scar. Drag the divider; pan either side.
        </p>
      </header>
      <BeforeAfter exhibit={e} />
      <div className="ba2-legend">
        <span>
          <i className="ba2-key is-predicted" aria-hidden="true" /> PRIMER predicted perimeter
        </span>
        <span>
          <i className="ba2-key is-scar" aria-hidden="true" /> Burn scar (illustrative)
        </span>
      </div>
    </section>
  )
}
