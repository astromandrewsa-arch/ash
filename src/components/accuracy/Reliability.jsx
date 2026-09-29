import { formatPct } from '../../lib/format.js'
import InfoButton from '../common/InfoButton.jsx'

const S = 92 // mini diagram size in px

/** Reliability (§16): "when PRIMER said 90%, 89% burned", a small calibration plot, and Brier by model. */
export default function Reliability({ stats, models }) {
  const bins = stats.reliability
  const top = bins[bins.length - 1]
  const x = (v) => 8 + ((v - 0.5) / 0.5) * (S - 16)
  const y = (v) => S - 8 - ((v - 0.5) / 0.5) * (S - 16)
  const scored = new Set(stats.brierByModel.map((b) => b.model))
  const unscored = models.filter((m) => m.brier == null && !scored.has(m.shortName))
  return (
    <section className="rel glass" aria-labelledby="rel-title">
      <div className="rel-top">
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="rel-plot" aria-hidden="true">
          <line x1={x(0.5)} y1={y(0.5)} x2={x(1)} y2={y(1)} className="rel-diag" />
          <polyline points={bins.map((b) => `${x(b.forecast)},${y(b.observed)}`).join(' ')} className="rel-line" />
          {bins.map((b) => (
            <circle key={b.forecast} cx={x(b.forecast)} cy={y(b.observed)} r={3} className="rel-dot" />
          ))}
        </svg>
        <div>
          <h2 id="rel-title" className="label">
            Reliability
            <InfoButton topic="glossary" label="Brier score and reliability" />
          </h2>
          <p className="rel-line-text">
            When PRIMER said {formatPct(top.forecast)}, {formatPct(top.observed)} burned.
          </p>
          <p className="rel-bins">{bins.map((b) => `${formatPct(b.forecast)} → ${formatPct(b.observed)}`).join(' · ')}</p>
        </div>
      </div>
      <div className="rel-brier">
        <span className="label">Brier score · lower is better</span>
        <ul>
          {stats.brierByModel.map((b) => (
            <li key={`${b.model}-${b.range}`} className={b.model === 'PRIMER' ? 'is-primer' : undefined}>
              <span>
                {b.model} <em>{b.range}</em>
              </span>
              <strong>{b.value.toFixed(2)}</strong>
            </li>
          ))}
          <li className="is-none">
            <span>{unscored.map((m) => m.shortName).join(', ')}</span>
            <strong>n/a</strong>
          </li>
        </ul>
      </div>
    </section>
  )
}
