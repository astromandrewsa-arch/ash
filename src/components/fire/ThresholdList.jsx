import { CircleCheck, CircleDashed } from 'lucide-react'
import { dayMonth } from '../../lib/dates.js'

/** The sensor thresholds behind the date, with the day each was (or will be) crossed. */
export default function ThresholdList({ thresholds }) {
  const sorted = [...thresholds].sort((a, b) => a.crossedOn.localeCompare(b.crossedOn))
  return (
    <ul className="thresholds">
      {sorted.map((t) => (
        <li key={t.name} className={t.projected ? 'is-projected' : ''}>
          {t.projected ? <CircleDashed size={14} aria-hidden="true" /> : <CircleCheck size={14} aria-hidden="true" />}
          <span className="threshold-name">{t.name}</span>
          <span className="threshold-date">
            {t.projected ? 'projected ' : 'crossed '}
            {dayMonth(t.crossedOn)}
          </span>
        </li>
      ))}
    </ul>
  )
}
