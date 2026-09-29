import { formatUSDCompact, returnPeriodText } from '../../lib/format.js'

/** Lower / point / upper on one bar, with the standard deviation and the return period (§8). */
export default function LossRange({ fire, gross }) {
  const lower = gross ? fire.bands.p90.gross : fire.lossLower
  const point = gross ? fire.bands.p50.gross : fire.lossPoint
  const upper = gross ? fire.bands.p25.gross : fire.lossUpper
  const sd = (upper - lower) / 2.56
  const max = upper * 1.08
  const pos = (v) => `${(v / max) * 100}%`
  return (
    <div className="loss-range">
      <div className="loss-range-figures">
        <div>
          <span className="label">Lower · P90</span>
          <strong>{formatUSDCompact(lower)}</strong>
        </div>
        <div className="is-point">
          <span className="label">Point · P50</span>
          <strong>{formatUSDCompact(point)}</strong>
        </div>
        <div>
          <span className="label">Upper · P25</span>
          <strong>{formatUSDCompact(upper)}</strong>
        </div>
      </div>
      <div className="loss-range-bar" aria-hidden="true">
        <span className="range" style={{ left: pos(lower), width: `calc(${pos(upper)} - ${pos(lower)})` }} />
        <span className="point" style={{ left: pos(point) }} />
      </div>
      <p className="loss-range-note">
        SD {formatUSDCompact(sd)} · point loss {returnPeriodText(fire.returnPeriodYears)}
      </p>
    </div>
  )
}
