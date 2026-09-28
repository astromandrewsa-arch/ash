import { Check, X } from 'lucide-react'
import { stages } from '../../lib/data.js'

/** Six-stage horizontal stepper. `shown` is the current stage index; earlier stages are ticked. */
export default function AgentStepper({ shown, fill = shown, fillMs, declined }) {
  const progress = (fill / (stages.length - 1)) * 100
  return (
    <div className="stepper">
      <span className="stepper-track" aria-hidden="true">
        <span className="stepper-fill" style={{ width: `${progress}%`, transitionDuration: fillMs ? `${fillMs}ms` : undefined }} />
      </span>
      <ol className="stepper-list" aria-label="Intervention status">
      {stages.map((stage, i) => {
        const state = i < shown ? 'done' : i === shown ? (declined ? 'declined' : 'current') : 'todo'
        return (
          <li key={stage.id} className={`stepper-step is-${state}`} aria-current={i === shown ? 'step' : undefined}>
            <span className="stepper-node">
              {state === 'done' && <Check size={13} strokeWidth={3} />}
              {state === 'declined' && <X size={13} strokeWidth={3} />}
              {(state === 'current' || state === 'todo') && i + 1}
            </span>
            <span className="stepper-label">{stage.label}</span>
          </li>
        )
      })}
      </ol>
    </div>
  )
}
