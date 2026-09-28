import { Check, X } from 'lucide-react'

/** One small badge per comparison model: ticked if it caught the fire, crossed if it missed. */
export default function ModelChecks({ fire, models }) {
  return (
    <ul className="model-checks" aria-label="Comparison models">
      {models.map((m) => {
        const r = fire.comparison[m.id]
        const title = r.caught ? `${m.name} caught it ${r.leadDays} days out` : `${m.name} missed it`
        return (
          <li key={m.id} className={r.caught ? 'is-caught' : 'is-missed'} title={title}>
            {r.caught ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <X size={12} strokeWidth={3} aria-hidden="true" />}
            <span>{m.name}</span>
            {r.caught && <small>{r.leadDays}d</small>}
            <span className="sr-only">{title}</span>
          </li>
        )
      })}
    </ul>
  )
}
