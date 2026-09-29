import { meta } from '../../lib/shellData.js'

/** "PRIMER forecast · issued 29 Sep 2026 06:00 CT" with a live dot. */
export default function ForecastStamp() {
  return (
    <div className="forecast-stamp" title={`${meta.model} forecast issued ${meta.issuedLabel}`}>
      <span className="live-dot" aria-hidden="true" />
      <span>
        <strong>{meta.model} forecast</strong>
        <span className="stamp-long"> · issued {meta.issuedLabel}</span>
      </span>
    </div>
  )
}
