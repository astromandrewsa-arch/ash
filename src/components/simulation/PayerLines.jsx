import { formatUSDCompact } from '../../lib/format.js'
import { PAYERS } from '../fire/payers.js'

const payerName = (key) => PAYERS.find((p) => p.key === key)?.label ?? key

/** One line per fire on who is paying and whether they have agreed; state plans stated plainly (§14). */
export default function PayerLines({ rows }) {
  const statePlans = rows.filter((r) => r.plan.statePlan)
  return (
    <section className="sim-panel glass sim-payers" aria-labelledby="payers-title">
      <h2 id="payers-title" className="label sim-panel-title">
        Who is paying
      </h2>
      <ul className="payer-lines">
        {rows.map(({ fire, plan, neg, agreed }) => {
          const parts = Object.entries(plan.payerSplit)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `${payerName(k)} ${formatUSDCompact(v)}${neg.payerInPrinciple?.[k] ? ' (in principle)' : ''}`)
          const status = plan.verdict === 'No action' ? 'no plan: nothing to pay' : agreed ? 'agreed' : neg.payerInPrinciple ? 'agreed in principle, not signed' : 'not yet agreed'
          return (
            <li key={fire.id}>
              <strong>{fire.id}</strong>
              <span className="payer-line-text">{parts.length ? parts.join(' · ') : 'No cost'}</span>
              <span className={`payer-status ${agreed ? 'is-agreed' : plan.verdict === 'No action' ? 'is-none' : 'is-open'}`}>{status}</span>
            </li>
          )
        })}
      </ul>
      {statePlans.length > 0 && (
        <div className="state-plans">
          {statePlans.map(({ fire, plan }) => (
            <p key={fire.id} className="callout">
              <strong>
                {fire.id} {fire.name}.
              </strong>{' '}
              {plan.statePlanNote}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
