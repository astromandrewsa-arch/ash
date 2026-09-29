import { Check, GitBranch } from 'lucide-react'
import { dayMonth } from '../../lib/dates.js'
import { BRANCHES, MAIN_STAGES } from './stages.js'

/**
 * Stepper (§12): Identified → Agent engaged → Government in negotiation → Work agreed → Work
 * complete → Fire prevented, with Partial and State plan as branch states. `shown` is the index
 * reached so far (it animates on the first hand-off).
 */
export default function NegotiationStepper({ negotiation, shown }) {
  const branch = BRANCHES[negotiation.stage] ? negotiation.stage : null
  const branchFrom = branch ? MAIN_STAGES.indexOf(BRANCHES[branch]) : -1
  const current = Math.min(shown, MAIN_STAGES.length - 1)
  return (
    <ol className="stepper">
      {MAIN_STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        const blocked = branch && i > branchFrom
        return (
          <li key={s} className={`step is-${state}${blocked ? ' is-blocked' : ''}`}>
            <span className="step-dot" aria-hidden="true">
              {state === 'done' ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <span className="step-body">
              <span className="step-name">{s}</span>
              {state === 'current' && !branch && (
                <span className="step-detail">
                  {negotiation.counterparty} · decision due {dayMonth(negotiation.decisionDue)}
                </span>
              )}
            </span>
            {branch && i === branchFrom && shown >= branchFrom && (
              <span className="step-branch">
                <GitBranch size={13} aria-hidden="true" />
                {branch}
                <span className="step-detail">
                  {negotiation.counterparty} · decision due {dayMonth(negotiation.decisionDue)}
                </span>
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
