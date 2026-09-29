import { dayMonth } from '../../lib/dates.js'

/** Warnings that go out ahead of the fire: county pre-notice, red flag, PSPS window, evacuation (§11). */
export default function WarningsLedger({ warnings }) {
  return (
    <ul className="ledger">
      {warnings.map((w) => (
        <li key={`${w.day}-${w.text}`}>
          <span className="ledger-day">{dayMonth(w.day)}</span>
          <span className="ledger-text">
            {w.text}
            <span className="muted"> · {w.by}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
