import { formatPct } from '../../lib/format.js'

/** §16 model exhibit: PRIMER and the seven named models, what each produces and whether it dates a fire. */
export default function ModelExhibit({ models }) {
  return (
    <div className="exhibit-wrap glass">
      <table className="exhibit">
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Outputs</th>
            <th scope="col">Resolution</th>
            <th scope="col">Forecast horizon</th>
            <th scope="col">Fuel</th>
            <th scope="col" className="num">Hit rate · 14 days</th>
            <th scope="col" className="num">Brier</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => {
            const hit14 = m.hitRateByLead[14]
            return (
              <tr key={m.id} className={m.family === 'primer' ? 'is-primer' : undefined}>
                <th scope="row" className="exhibit-name">
                  <strong>{m.name}</strong>
                  <span>
                    {m.vendor} · {m.version}
                  </span>
                </th>
                <td>{m.outputs}</td>
                <td>{m.resolution}</td>
                <td className={m.horizonDays ? undefined : 'is-none'}>{m.horizonText}</td>
                <td>{m.fuelTreatment}</td>
                <td className={`num${hit14 == null ? ' is-none' : ''}`}>{hit14 == null ? (m.horizonDays ? 'beyond horizon' : 'no date') : formatPct(hit14)}</td>
                <td className={`num${m.brier == null ? ' is-none' : ''}`}>{m.brier == null ? 'n/a' : m.brier.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
