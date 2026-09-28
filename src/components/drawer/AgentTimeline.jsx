import { dayMonth } from '../../lib/dates.js'
import { formatDayOffset, formatUSDCompact } from '../../lib/format.js'

function amountsLine(amounts) {
  if (!amounts) return null
  if (amounts.realisedLoss !== undefined && amounts.cost === undefined) return `Realised loss ${formatUSDCompact(amounts.realisedLoss)}`
  return `Cost ${formatUSDCompact(amounts.cost)} · premium saving ${formatUSDCompact(amounts.premiumSaved5yr)} · loss avoided ${formatUSDCompact(amounts.lossAvoided)}`
}

export default function AgentTimeline({ entries }) {
  return (
    <section className="timeline-section">
      <h3 className="timeline-title">Timeline</h3>
      <ol className="timeline">
        {entries.map((e, i) => {
          const kind = e.refusal ? 'refusal' : e.planned ? 'planned' : e.live ? 'live' : e.type === 'burned' ? 'burned' : 'done'
          return (
            <li key={`${e.day}-${i}`} className={`timeline-entry is-${kind}`} style={{ '--i': i }}>
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-when">
                <strong>Day {formatDayOffset(e.day)}</strong>
                <span>{dayMonth(e.date)}</span>
                {e.planned && <em>Next</em>}
                {e.live && <em>Today</em>}
              </div>
              <p className="timeline-text">{e.text}</p>
              {e.amounts && <p className="timeline-amounts">{amountsLine(e.amounts)}</p>}
              <p className="timeline-meta">
                {e.actor}
                {e.counterpart && e.counterpart !== e.actor && <> → {e.counterpart}</>}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
