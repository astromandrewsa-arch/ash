import { formatUSDCompact, returnPeriodText } from '../../lib/format.js'

/** A round top for the scale: 1, 2, 2.5 or 5 × 10^k at or above the value. */
function niceMax(v) {
  const k = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 2.5, 5, 10]) if (m * k >= v) return m * k
  return 10 * k
}

/**
 * Lower / point / upper (§8) as figures and on one scale from $0 (the ground-up upper sets the
 * scale for both views, so the gross view visibly shrinks), with the SD and the return period.
 */
export default function LossRange({ fire, gross }) {
  const lower = gross ? fire.bands.p90.gross : fire.lossLower
  const point = gross ? fire.bands.p50.gross : fire.lossPoint
  const upper = gross ? fire.bands.p25.gross : fire.lossUpper
  const sd = (upper - lower) / 2.56
  const max = niceMax(fire.lossUpper * 1.02)
  const pos = (v) => `${(v / max) * 100}%`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const marks = [
    { key: 'p90', label: 'P90', v: lower },
    { key: 'p50', label: 'P50', v: point },
    { key: 'p25', label: 'P25', v: upper },
  ]
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
      <div className="loss-range-scale" aria-hidden="true">
        <div className="lr-marks">
          {marks.map((m) => (
            <span key={m.key} className={`lr-mark-label is-${m.key}`} style={{ left: pos(m.v) }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className="loss-range-bar">
          <span className="range" style={{ left: pos(lower), width: `calc(${pos(upper)} - ${pos(lower)})` }} />
          {marks.map((m) => (
            <span key={m.key} className={`mark is-${m.key}`} style={{ left: pos(m.v) }} />
          ))}
        </div>
        <div className="lr-ticks">
          {ticks.map((t, i) => (
            <span key={t} style={{ left: pos(t) }} className={i === 0 ? 'is-first' : i === ticks.length - 1 ? 'is-last' : undefined}>
              {t === 0 ? '$0' : formatUSDCompact(t, t >= 1e7 ? 0 : 1)}
            </span>
          ))}
        </div>
      </div>
      <p className="loss-range-note">
        SD {formatUSDCompact(sd)} · point loss {returnPeriodText(fire.returnPeriodYears)}
      </p>
    </div>
  )
}
