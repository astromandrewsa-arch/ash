import { dayMonth } from '../../lib/dates.js'
import DrawerSection from './DrawerSection.jsx'
import FuelSparkline from './FuelSparkline.jsx'

export default function FuelStateBlock({ fire }) {
  const f = fire.fuelState
  const figures = [
    { label: 'Live fuel moisture', value: `${f.liveMoisturePct}%`, note: `falling ${Math.abs(f.liveTrendPtsPerDay)} pts/day` },
    { label: 'Curing', value: `${f.curingPct}%` },
    { label: 'Afternoon dead moisture', value: `${f.deadMoistureAfternoonPct}%` },
    { label: 'Days since rain', value: f.daysSinceRain },
  ]

  return (
    <DrawerSection title="Fuel state that produced the date" aside={<span className="section-note">as of {dayMonth(f.asOf)}</span>}>
      <dl className="fuel-figures">
        {figures.map((x) => (
          <div key={x.label}>
            <dt>{x.label}</dt>
            <dd>
              {x.value}
              {x.note && <small>{x.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
      <FuelSparkline fire={fire} />
      <ul className="thresholds">
        {f.thresholds.map((t) => (
          <li key={t.fuel}>
            <span>
              {t.fuel} {t.threshold}
              {t.unit}
            </span>
            <span>crossed {dayMonth(t.crossedOn)}</span>
          </li>
        ))}
      </ul>
    </DrawerSection>
  )
}
