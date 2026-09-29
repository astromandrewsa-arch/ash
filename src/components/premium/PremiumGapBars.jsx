import { formatPctSigned, formatUSDCompact } from '../../lib/format.js'

/** Written premium against the technical premium, for the selected bundle and for all bundles. */
export default function PremiumGapBars({ rows }) {
  return (
    <div className="gap-bars">
      {rows.map((r) => {
        const max = Math.max(r.written, r.technical)
        const gap = r.technical - r.written
        const short = gap > 0
        return (
          <div key={r.id} className="gap-bars-group">
            <div className="gap-bars-head">
              <strong>{r.name}</strong>
              <span className={short ? 'is-under' : 'is-over'}>
                {formatUSDCompact(Math.abs(gap))} {short ? 'short' : 'over'} ({formatPctSigned(r.written / r.technical - 1)})
              </span>
            </div>
            {[
              ['Written premium', r.written, 'is-written'],
              ['Technical premium', r.technical, short ? 'is-tech-under' : 'is-tech-over'],
            ].map(([label, v, cls]) => (
              <div key={label} className="gap-bar-row">
                <span className="gap-bar-label">{label}</span>
                <span className="gap-bar-track">
                  <span className={`gap-bar-fill ${cls}`} style={{ width: `${(v / max) * 100}%` }} />
                </span>
                <span className="gap-bar-value">{formatUSDCompact(v)}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
