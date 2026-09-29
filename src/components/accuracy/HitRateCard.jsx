import HitRateChart from './HitRateChart.jsx'
import { palette } from '../../styles/palette.js'

const LEADS = [1, 3, 5, 7, 10, 14, 21, 30]

/** The hit-rate chart with its key: which models date a fire, how far ahead, and where each stops. */
export default function HitRateCard({ models }) {
  const c = palette()
  const primer = models.find((m) => m.family === 'primer')
  const short = models.filter((m) => m.family === 'short')
  const cat = models.filter((m) => m.family === 'cat')
  const lows = cat.map((m) => Math.round(m.longRunHitRate * 100))
  return (
    <section className="hit glass" aria-labelledby="hit-title">
      <header className="hit-head">
        <h2 id="hit-title" className="label">
          Hit rate by lead time
        </h2>
        <p>Share of fires that burned inside the called window, by how many days ahead the call was made.</p>
      </header>
      <HitRateChart models={models} leads={LEADS} />
      <ul className="hit-key">
        <li className="is-primer">
          <i style={{ background: c.orange }} />
          {primer.shortName} · {primer.horizonText}
        </li>
        {short.map((m) => (
          <li key={m.id}>
            <i className="is-ring" />
            {m.shortName} · horizon ends at {m.horizonDays} days
          </li>
        ))}
        <li className="is-cat">
          <i className="is-dash" />
          {cat.map((m) => m.shortName).join(', ')} · long-run {Math.min(...lows)}–{Math.max(...lows)}%, no lead time
        </li>
      </ul>
    </section>
  )
}
