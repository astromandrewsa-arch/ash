import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { bookSummary } from '../../lib/selectors.js'
import { formatHa, formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import AnimatedValue from '../common/AnimatedValue.jsx'

/** Top-left "Your book" panel: TIV, homes, assets, hectares, premium and data quality. */
export default function BookPanel() {
  const { portfolioId } = useApp()
  const [open, setOpen] = useState(true)
  const book = bookSummary(portfolioId)
  const dq = book.dataQuality

  return (
    <section className="glass panel book-panel" aria-label="Your book">
      <button type="button" className="panel-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <BookOpen size={15} className="muted" aria-hidden="true" />
        <span className="label panel-title">Your book</span>
        <span className="panel-meta">{book.short}</span>
        <ChevronDown size={16} className={`panel-caret${open ? '' : ' is-collapsed'}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="panel-body">
          <div className="book-hero">
            <span className="label">Total insured value</span>
            <span className="figure">
              <AnimatedValue value={book.tiv} format={formatUSDCompact} />
            </span>
          </div>
          <dl className="book-grid">
            <div>
              <dt>Homes covered</dt>
              <dd>
                <AnimatedValue value={book.homes} format={formatNumber} />
              </dd>
            </div>
            <div>
              <dt>Assets covered</dt>
              <dd>
                <AnimatedValue value={book.assets} format={formatNumber} />
              </dd>
            </div>
            <div>
              <dt>Under forecast</dt>
              <dd>
                <AnimatedValue value={book.hectaresUnderForecast} format={formatHa} />
              </dd>
            </div>
            <div>
              <dt>Premium in force</dt>
              <dd>
                <AnimatedValue value={book.premium} format={formatUSDCompact} />
              </dd>
            </div>
          </dl>
          <div className="book-quality">
            <div className="quality-item">
              <span className="quality-label" title="Share of homes geocoded to the building footprint">Building geocode</span>
              <span className="quality-value">
                <strong>{formatPct(dq.geocodeBuildingPct, 1)}</strong>
                <span className="quality-bar" aria-hidden="true">
                  <span style={{ width: formatPct(dq.geocodeBuildingPct, 1) }} />
                </span>
              </span>
            </div>
            <div className="quality-item">
              <span className="quality-label" title="Insurance to value: homes insured below rebuild value">ITV flags</span>
              {dq.itvFlagged > 0 ? (
                <span className="pill pill-amber" title={`${formatNumber(dq.itvFlagged)} homes insured below rebuild value`}>
                  {formatNumber(dq.itvFlagged)} under-insured
                </span>
              ) : (
                <span className="pill pill-green">No flags</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
