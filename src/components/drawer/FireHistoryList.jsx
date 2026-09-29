import { formatNumber } from '../../lib/format.js'

/** Recorded fires in the area's region (public records; empty lists are not shown). */
export default function FireHistoryList({ history }) {
  if (!history?.length) return null
  return (
    <section className="card-section">
      <h3 className="label">Fire history in the region</h3>
      <ul className="history-list">
        {history.map((h) => (
          <li key={`${h.year}-${h.name}`}>
            <span className="history-year">{h.year}</span>
            <span className="history-body">
              <strong>{h.name}</strong>
              <span className="muted">
                {formatNumber(h.acres)} ac
                {h.homesLost ? ` · ${formatNumber(h.homesLost)} ${h.homesLost === 1 ? 'home' : 'homes'} lost` : h.structures ? ` · ${formatNumber(h.structures)} structures lost` : ''} · {h.cause}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
