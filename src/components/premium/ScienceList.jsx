import { Droplets, Flame, Gauge, Layers, Wind } from 'lucide-react'
import { dayMonth } from '../../lib/dates.js'
import { formatPctSigned } from '../../lib/format.js'

const pts = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)} pts`

/** The five measured shifts behind a bundle's technical rate (§15 science panel). */
export default function ScienceList({ science: s }) {
  const items = [
    { icon: Layers, label: 'Fuel load', value: formatPctSigned(s.fuelLoadVsMean), note: 'against the five-year mean, after the wet spring' },
    { icon: Droplets, label: 'Live fuel moisture', value: `${pts(s.liveFmTrend)} a day`, note: `crosses ${s.liveFmThreshold}% on ${dayMonth(s.liveFmCrossesOn)}` },
    { icon: Gauge, label: '100-h dead fuel', value: pts(s.deadFmVsLastYear), note: `against this date last year; 1000-h ${pts(s.dead1000hVsLastYear)}` },
    { icon: Wind, label: 'Rate of spread', value: formatPctSigned(s.rosVsLastSeason), note: 'against last season' },
    { icon: Flame, label: 'Intensity class', value: s.intensityClassShift, note: 'one class hotter than last season' },
  ]
  return (
    <ul className="sci-list">
      {items.map(({ icon: Icon, label, value, note }) => (
        <li key={label}>
          <span className="sci-icon" aria-hidden="true">
            <Icon size={15} />
          </span>
          <span className="sci-label">{label}</span>
          <strong className="sci-value">{value}</strong>
          <span className="sci-note">{note}</span>
        </li>
      ))}
    </ul>
  )
}
