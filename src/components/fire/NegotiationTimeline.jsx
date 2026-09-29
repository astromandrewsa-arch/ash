import { dayMonth } from '../../lib/dates.js'

/** The agent's log, newest last; declined entries in red ("County declined — budget"). */
export default function NegotiationTimeline({ entries }) {
  return (
    <ul className="timeline">
      {entries.map((e, i) => (
        <li key={`${e.day}-${i}`} className={e.declined ? 'is-declined' : ''}>
          <span className="timeline-day">{dayMonth(e.day)}</span>
          <span className="timeline-body">
            <span className="timeline-text">{e.text}</span>
            <span className="timeline-by">{e.by}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
