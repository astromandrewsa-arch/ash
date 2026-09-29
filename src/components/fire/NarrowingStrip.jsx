import { dayMonth, daysBetween } from '../../lib/dates.js'

/**
 * Ensemble narrowing (§10): the burn window PRIMER gave on each successive issue date, shrinking
 * toward the dated window; probability rises as it narrows.
 */
export default function NarrowingStrip({ fire }) {
  const rows = fire.narrowing
  const start = rows.reduce((m, r) => (r.windowStart < m ? r.windowStart : m), rows[0].windowStart)
  const end = rows.reduce((m, r) => (r.windowEnd > m ? r.windowEnd : m), rows[0].windowEnd)
  const span = Math.max(1, daysBetween(start, end) + 1)
  const pct = (iso) => (daysBetween(start, iso) / span) * 100
  return (
    <div className="narrowing">
      {rows.map((r, i) => {
        const dated = i === rows.length - 1
        return (
          <div key={r.issued} className={`narrow-row${dated ? ' is-dated' : ''}`}>
            <span className="narrow-issued">{dayMonth(r.issued)}</span>
            <span className="narrow-track">
              <i style={{ left: `${pct(r.windowStart)}%`, width: `${((r.windowDays) / span) * 100}%` }} title={`${dayMonth(r.windowStart)}–${dayMonth(r.windowEnd)}`} />
            </span>
            <span className="narrow-days">{r.windowDays} d</span>
            <span className="narrow-prob">{Math.round(r.probability * 100)}%</span>
          </div>
        )
      })}
      <div className="narrow-axis">
        <span>{dayMonth(start)}</span>
        <span>{dayMonth(end)}</span>
      </div>
    </div>
  )
}
