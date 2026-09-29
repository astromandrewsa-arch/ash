import { formatUSDCompact } from '../../lib/format.js'

/** LA 2025 (§16): the cat models' flash estimates against the ~$40B final, on one dollar scale. */
export default function LaFlashTile({ la }) {
  const max = Math.max(la.finalValue, ...la.estimates.map((e) => e.high)) * 1.12
  const pct = (v) => `${(v / max) * 100}%`
  return (
    <section className="la-tile glass" aria-labelledby="la-title">
      <h2 id="la-title" className="label">
        {la.title}
      </h2>
      <div className="la-scale">
        {la.estimates.map((e) => (
          <div key={e.model} className="la-row">
            <span className="la-model">{e.model}</span>
            <span className="la-track">
              <span className={`la-range${e.low === e.high ? ' is-point' : ''}`} style={{ left: pct(e.low), width: e.low === e.high ? undefined : `calc(${pct(e.high - e.low)})` }} />
              <span className="la-final" style={{ left: pct(la.finalValue) }} />
            </span>
            <span className="la-value">{e.value}</span>
          </div>
        ))}
        <div className="la-row is-final">
          <span className="la-model">Final</span>
          <span className="la-track">
            <span className="la-final-dot" style={{ left: pct(la.finalValue) }} />
          </span>
          <span className="la-value">{la.final}</span>
        </div>
      </div>
      <p className="la-note">{la.note}</p>
      <span className="la-axis">{formatUSDCompact(0)} to {formatUSDCompact(max, 0)} insured loss</span>
    </section>
  )
}
