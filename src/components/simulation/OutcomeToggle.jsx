import { OUTCOMES } from '../../lib/simulation.js'

/** No intervention · As negotiated · Every plan fails (§14). */
export default function OutcomeToggle({ value, onChange }) {
  return (
    <div className="seg-toggle outcome-toggle" role="group" aria-label="Outcome">
      {OUTCOMES.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === value} className={o.id === value ? 'is-on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
