import { formatPct, formatUSDCompact } from '../../lib/format.js'

/** Long-run AAL against PRIMER's season expected loss, with the adequacy, loss and combined ratios. */
export default function SeasonCompare({ bundle: b }) {
  const season = b.primerSeasonExpectedLoss
  const max = Math.max(b.aal, season, 1)
  const bars = [
    { key: 'aal', label: 'Long-run AAL', note: 'the cat-model year the rate was filed on', value: b.aal },
    { key: 'season', label: 'PRIMER season expected loss', note: 'Σ probability × loss over the dated fires', value: season },
  ]
  const ratios = [
    { label: 'Adequacy ratio', value: `${b.adequacyRatio.toFixed(1)}×`, note: 'season ÷ long-run AAL' },
    { label: 'Loss ratio', value: formatPct(b.lossRatio), note: 'season loss ÷ premium' },
    { label: 'Combined ratio', value: formatPct(b.combinedRatio), note: `with ${formatPct(b.expenseRatio)} expenses` },
  ]
  return (
    <div className="season">
      <div className="season-bars">
        {bars.map((r) => (
          <div key={r.key} className={`season-bar is-${r.key}`}>
            <div className="season-bar-head">
              <span>{r.label}</span>
              <strong>{formatUSDCompact(r.value)}</strong>
            </div>
            <span className="season-track">
              <span className="season-fill" style={{ width: `${Math.max(r.value > 0 ? 1.5 : 0, (r.value / max) * 100)}%` }} />
            </span>
            <span className="season-note">{r.note}</span>
          </div>
        ))}
      </div>
      {season === 0 && <p className="season-none">No dated fire reaches this bundle’s policies this season; the combined ratio is expenses only.</p>}
      <dl className="season-ratios">
        {ratios.map((r) => (
          <div key={r.label} className="season-ratio">
            <dt>
              <span className="label">{r.label}</span>
              <span>{r.note}</span>
            </dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
