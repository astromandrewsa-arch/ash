import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatNumber, formatPctSigned, formatUSDCompact } from '../../lib/format.js'
import { formatBn, splitRecommendation } from '../../lib/premium.js'
import AdequacyBar from './AdequacyBar.jsx'

// §15 bundle table: under-priced rows tinted orange, over-priced rows blue.
const COLS = [
  { key: 'name', label: 'Bundle' },
  { key: 'policies', label: 'Policies', num: true },
  { key: 'tiv', label: 'TIV', num: true },
  { key: 'premium', label: 'Premium', num: true },
  { key: 'marketRatePer1000', label: 'Market rate', unit: 'per $1,000', num: true },
  { key: 'primerRatePer1000', label: 'PRIMER rate', unit: 'technical', num: true },
  { key: 'adequacy', label: 'Adequacy', unit: 'market vs PRIMER', num: true },
  { key: 'recommendation2027', label: '2027', unit: 'PRIMER · filed', num: true },
]

const rate = (v) => `$${v.toFixed(1)}`

// Places as "A · B +3" so a long list never breaks mid-word in the column.
const PLACE_CHARS = 26
function placeList(places) {
  let n = 1
  while (n < places.length && places.slice(0, n + 1).join(' · ').length <= PLACE_CHARS) n++
  const shown = places.slice(0, n).join(' · ')
  return n < places.length ? `${shown} +${places.length - n}` : shown
}

// The recommendation's note ("corridor homes to a surcharge class") shows on hover and in the science panel.
function RecCell({ value, label, filed, note }) {
  return (
    <td className="num rec-cell" title={note ? `${label}, ${note}` : undefined}>
      <strong className={value < 0 ? 'is-down' : 'is-up'}>
        {label ?? formatPctSigned(value)}
        {note && <sup aria-hidden="true">*</sup>}
      </strong>
      <span>filed {formatPctSigned(filed)}</span>
    </td>
  )
}

/** One row per bundle; select a row to open its science panel. */
export default function BundleTable({ rows, totals, sort, onSort, selectedId, onSelect }) {
  const max = Math.max(...rows.map((b) => Math.abs(b.adequacy)), 0.01)
  return (
    <div className="bundle-wrap glass">
      <table className="bundle-table">
        <thead>
          <tr>
            {COLS.map((c) => {
              const on = sort.key === c.key
              return (
                <th key={c.key} scope="col" className={c.num ? 'num' : undefined} aria-sort={on ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => onSort(c.key)}>
                    <span className="th-text">
                      {c.label}
                      {c.unit && <small>{c.unit}</small>}
                    </span>
                    {on && (sort.dir > 0 ? <ArrowUp size={11} aria-hidden="true" /> : <ArrowDown size={11} aria-hidden="true" />)}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const rec = splitRecommendation(b.recommendationText)
            return (
              <tr
                key={b.id}
                tabIndex={0}
                className={`${b.underPriced ? 'is-under' : 'is-over'}${b.id === selectedId ? ' is-selected' : ''}`}
                aria-selected={b.id === selectedId}
                onClick={() => onSelect(b.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(b.id)
                  }
                }}
              >
                <td className="bundle-name">
                  <strong>{b.name}</strong>
                  <span title={b.places.join(' · ')}>{placeList(b.places)}</span>
                </td>
                <td className="num">{formatNumber(b.policies)}</td>
                <td className="num">{formatBn(b.tiv)}</td>
                <td className="num">{formatUSDCompact(b.premium)}</td>
                <td className="num">{rate(b.marketRatePer1000)}</td>
                <td className="num strong">{rate(b.primerRatePer1000)}</td>
                <td className="num adq-cell" title={b.underPriced ? 'Under-priced' : 'Over-priced'}>
                  <span className={`adq-value ${b.underPriced ? 'is-under' : 'is-over'}`}>{formatPctSigned(b.adequacy)}</span>
                  <AdequacyBar value={b.adequacy} max={max} />
                </td>
                <RecCell value={b.recommendation2027} label={rec.figure} filed={b.filed2027} note={rec.note} />
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="bundle-name">
              <strong>All bundles</strong>
              <span>rates weighted by TIV</span>
            </th>
            <td className="num">{formatNumber(totals.policies)}</td>
            <td className="num">{formatBn(totals.tiv)}</td>
            <td className="num">{formatUSDCompact(totals.premium)}</td>
            <td className="num">{rate(totals.marketRatePer1000)}</td>
            <td className="num strong">{rate(totals.primerRatePer1000)}</td>
            <td className="num adq-cell">
              <span className={`adq-value ${totals.adequacy < 0 ? 'is-under' : 'is-over'}`}>{formatPctSigned(totals.adequacy)}</span>
              <span className="adq-kind">
                {formatUSDCompact(Math.abs(totals.premiumGap))} {totals.premiumGap > 0 ? 'short' : 'over'}
              </span>
            </td>
            <RecCell value={totals.recommendation2027} filed={totals.filed2027} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
