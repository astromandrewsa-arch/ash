import { ShieldCheck } from 'lucide-react'
import { addDays, dayMonth, daysBetween } from '../../lib/dates.js'

const DAYS = 30

/**
 * Thirty days from the issue date (§14): each dated fire on its burn window in its severity
 * colour; state-plan fires carry a shield; windows that run past day 30 end in an arrow.
 */
export default function SimCalendar({ rows, issued }) {
  const days = Array.from({ length: DAYS }, (_, i) => addDays(issued, i))
  const col = (iso) => daysBetween(issued, iso)
  return (
    <section className="sim-cal glass" aria-label="Thirty-day calendar">
      <div className="cal-grid">
        <span className="cal-corner label">30 days from {dayMonth(issued)}</span>
        <div className="cal-days" aria-hidden="true">
          {days.map((d, i) => {
            const dom = Number(d.slice(8, 10))
            const month = i === 0 || dom === 1
            return (
              <span key={d} className={`cal-day${month ? ' is-month' : ''}${i % 7 === 0 ? ' is-week' : ''}`}>
                {month ? dayMonth(d) : dom}
              </span>
            )
          })}
        </div>
        {rows.map((r) => {
          const f = r.fire
          const start = Math.max(0, col(f.windowStart))
          const endRaw = col(f.windowEnd)
          const end = Math.min(DAYS - 1, endRaw)
          const beyond = endRaw > DAYS - 1
          return (
            <div className="cal-row" key={f.id}>
              <span className="cal-fire">
                <strong>{f.id}</strong>
                <span>{f.name}</span>
              </span>
              <div className="cal-track">
                <span
                  className={`cal-bar ${f.severity === 'Severe' ? 'is-severe' : 'is-nonsevere'}${beyond ? ' is-beyond' : ''}`}
                  style={{ gridColumn: `${start + 1} / ${end + 2}` }}
                  title={`${f.id} burns ${f.windowLabel}${r.plan.statePlan ? ' · state agency plan' : ''}`}
                >
                  {r.plan.statePlan && <ShieldCheck size={13} aria-label="State agency plan" />}
                  <span className="cal-bar-text">
                    {f.windowLabel}
                    {beyond ? ' →' : ''}
                  </span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="cal-key">
        <span>
          <i className="cal-swatch is-severe" /> Severe
        </span>
        <span>
          <i className="cal-swatch is-nonsevere" /> Non-severe
        </span>
        <span>
          <ShieldCheck size={13} aria-hidden="true" /> State agency plan
        </span>
      </p>
    </section>
  )
}
