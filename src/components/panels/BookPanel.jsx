import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { bookSummary, portfolioById } from '../../lib/shellData.js'
import { formatHa, formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import AnimatedValue from '../common/AnimatedValue.jsx'

/** Top-left "Your book" panel: TIV, homes, assets, hectares, premium and data quality. */
export default function BookPanel() {
  const { portfolioId } = useApp()
  const [open, setOpen] = useState(true)
  const book = bookSummary(portfolioId)
  const portfolio = portfolioById[portfolioId]

  return (
    <section className="glass panel book-panel" aria-label="Your book">
      <button type="button" className="panel-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <BookOpen size={15} className="muted" aria-hidden="true" />
        <span className="label panel-title">Your book</span>
        <ChevronDown size={16} className={`panel-caret${open ? '' : ' is-collapsed'}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="panel-body">
          <p className="book-portfolio">{portfolio.name}</p>
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
                <AnimatedValue value={book.hectares} format={formatHa} />
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
            <div className="quality-row">
              <span>Geocode quality, building level</span>
              <strong>{formatPct(book.geocodeBuildingPct, 1)}</strong>
            </div>
            <div className="quality-bar" aria-hidden="true">
              <span style={{ width: formatPct(book.geocodeBuildingPct, 1) }} />
            </div>
            <div className="quality-row">
              <span>Insurance to value</span>
              {book.itvFlagged > 0 ? (
                <span className="pill pill-amber">{formatNumber(book.itvFlagged)} under-insured</span>
              ) : (
                <span className="pill pill-green">No ITV flags</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
