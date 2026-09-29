import { dateRange } from '../../lib/dates.js'
import { formatPct, formatUSDCompact } from '../../lib/format.js'
import { stageRag } from '../../lib/selectors.js'
import PayerMiniBar from './PayerMiniBar.jsx'

/**
 * Intervention schedule (§14): per fire, the actions, dates, counterparty, cost, payer split,
 * P(prevent) and stage. Related figures share a cell so the table fits beside the arithmetic.
 */
export default function ScheduleTable({ rows, onOpen }) {
  return (
    <section className="sim-panel glass" aria-labelledby="sched-title">
      <h2 id="sched-title" className="label sim-panel-title">
        Intervention schedule
      </h2>
      <table className="sim-table sched">
        <thead>
          <tr>
            <th scope="col">Fire · actions</th>
            <th scope="col">Counterparty · dates</th>
            <th scope="col" className="num">
              Cost · payers
            </th>
            <th scope="col">P(prevent) · stage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ fire, plan, neg }) => {
            const acts = plan.actions
            const start = acts.length ? acts.reduce((m, a) => (a.start < m ? a.start : m), acts[0].start) : null
            const end = acts.length ? acts.reduce((m, a) => (a.end > m ? a.end : m), acts[0].end) : null
            return (
              <tr key={fire.id} onClick={() => onOpen(fire.id)} tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' ? onOpen(fire.id) : null)} aria-label={`Open ${fire.id} on the map`}>
                <td className="sched-fire">
                  <strong>
                    <em>{fire.id}</em> {fire.name}
                  </strong>
                  <span title={acts.map((a) => a.text).join('\n')}>
                    {acts.length ? `${acts.length === 1 ? '1 action' : `${acts.length} actions`} · ${acts[0].text}` : plan.verdict === 'No action' ? 'Plan withdrawn' : 'No actions'}
                  </span>
                </td>
                <td className="sched-cp">
                  <strong title={neg.counterparty}>{neg.counterparty}</strong>
                  <span>{start ? dateRange(start, end) : '—'}</span>
                </td>
                <td className="num sched-cost">
                  <strong>{plan.cost ? formatUSDCompact(plan.cost) : '—'}</strong>
                  <PayerMiniBar split={plan.payerSplit} total={plan.cost} />
                </td>
                <td className="sched-stage">
                  <strong>{plan.statePlan ? 'Cannot prevent' : plan.pPrevent == null ? 'No plan' : `P(prevent) ${formatPct(plan.pPrevent)}`}</strong>
                  <span className={`stage-pill rag-${stageRag(neg.stage)}`}>{neg.stage}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
