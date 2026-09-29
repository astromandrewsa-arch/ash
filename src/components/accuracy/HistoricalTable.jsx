import { FlaskConical, Flame, ShieldCheck } from 'lucide-react'
import { fullDate } from '../../lib/dates.js'

// §16: twelve fires of the 2025–26 season. What PRIMER said, what each named model said before the
// fire ("no date" where it gave none), and the outcome sentence by type.
const OUTCOMES = {
  prevented: { label: 'Prevented', icon: ShieldCheck, tone: 'green' },
  'declined-burned': { label: 'Declined, burned', icon: Flame, tone: 'red' },
  backtest: { label: 'Back-test', icon: FlaskConical, tone: 'blue' },
}

export default function HistoricalTable({ fires, models }) {
  const others = models.filter((m) => m.family !== 'primer')
  return (
    <div className="hist-wrap glass">
      <table className="hist-table">
        <thead>
          <tr>
            <th scope="col">Fire</th>
            <th scope="col" className="is-primer">PRIMER said</th>
            {others.map((m) => (
              <th key={m.id} scope="col">{m.shortName}</th>
            ))}
            <th scope="col">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {fires.map((f) => {
            const o = OUTCOMES[f.outcomeType]
            return (
              <tr key={f.id}>
                <th scope="row" className="hist-fire">
                  <strong>{f.name}</strong>
                  <span>{f.place}</span>
                  <span>{fullDate(f.date)}</span>
                </th>
                <td className="hist-primer">{f.primerSaid}</td>
                {others.map((m) => {
                  const said = f.others[m.id]
                  return (
                    <td key={m.id} className={/^no date$/i.test(said) ? 'is-none' : undefined}>
                      {said}
                    </td>
                  )
                })}
                <td className="hist-outcome">
                  <span className={`outcome-pill tone-${o.tone}`}>
                    <o.icon size={12} aria-hidden="true" />
                    {o.label}
                  </span>
                  <p>{f.sentence}</p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
