import { Eye } from 'lucide-react'
import { store } from '../../lib/store.js'

/** Shown on any card whose area PRIMER is watching below the dating threshold. */
export default function WatchNote({ areaId }) {
  const w = store.watchlist.find((x) => x.areaId === areaId)
  if (!w) return null
  return (
    <section className="card-section">
      <div className="watch-note">
        <Eye size={16} aria-hidden="true" />
        <div>
          <strong>
            On the watchlist: {w.probability}% inside a {w.windowDays}-day window
          </strong>
          <p>{w.note} It is dated once the probability inside a window of 14 days or less reaches 90%.</p>
        </div>
      </div>
    </section>
  )
}
