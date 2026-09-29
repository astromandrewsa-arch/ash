import { formatUSDCompact } from '../../lib/format.js'

/** Horizontal bars splitting a total into its parts. */
export default function ValueSplit({ total, parts }) {
  return (
    <div className="split-bars">
      {parts.map(([label, v]) => (
        <div key={label} className="split-row">
          <span>{label}</span>
          <span className="split-track" aria-hidden="true">
            <i style={{ width: `${(v / total) * 100}%` }} />
          </span>
          <strong>{formatUSDCompact(v)}</strong>
        </div>
      ))}
    </div>
  )
}
