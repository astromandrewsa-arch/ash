import { Check, GitBranch, CircleSlash } from 'lucide-react'
import { dayMonth } from '../../lib/dates.js'
import { BRANCHES, MAIN_STAGES } from './stages.js'

/**
 * Stepper (§12): Identified → Agent engaged → Government in negotiation → Work agreed → Work
 * complete → Fire prevented, with Partial and State plan as branch end states. `shown` is the
 * index reached so far (it animates on the first hand-off). `endNote` closes the path early
 * (a withdrawn plan); steps that can no longer be reached are dimmed.
 */
export default function NegotiationStepper({ negotiation, shown, endNote = null }) {
  const branch = BRANCHES[negotiation.stage] ? negotiation.stage : null
  const branchFrom = branch ? MAIN_STAGES.indexOf(BRANCHES[branch]) : -1
  const current = Math.min(shown, MAIN_STAGES.length - 1)
  const closedAfter = branch ? branchFrom : endNote ? current : Infinity
  return (
    <ol className="stepper">
      {MAIN_STAGES.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        const blocked = i > closedAfter
        return (
          <li key={s} className={`step is-${state}${blocked ? ' is-blocked' : ''}`}>
            <span className="step-dot" aria-hidden="true">
              {state === 'done' ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <span className="step-body">
              <span className="step-name">{s}</span>
              {state === 'current' && !branch && !endNote && (
                <span className="step-detail">
                  {negotiation.counterparty} · decision due {dayMonth(negotiation.decisionDue)}
                </span>
              )}
            </span>
            {branch && i === branchFrom && shown >= branchFrom && (
              <span className="step-branch">
                <GitBranch size={13} aria-hidden="true" />
                {branch} · end state
                <span className="step-detail">
                  {negotiation.counterparty} · decision due {dayMonth(negotiation.decisionDue)}
                </span>
              </span>
            )}
            {endNote && i === current && (
              <span className="step-branch is-closed">
                <CircleSlash size={13} aria-hidden="true" />
                {endNote}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
