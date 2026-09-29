import { useEffect } from 'react'
import { store } from '../../lib/store.js'
import useApp from '../../state/useApp.js'
import Section from '../common/Section.jsx'
import VerdictPill from './VerdictPill.jsx'
import ActionList from './ActionList.jsx'
import PayerSplitBar from './PayerSplitBar.jsx'
import WarningsLedger from './WarningsLedger.jsx'
import CostVsLoss from './CostVsLoss.jsx'
import PassToAgent from './PassToAgent.jsx'

/**
 * Plan tab (§10, §11): verdict, the arithmetic of cost against loss avoided, actions with owner,
 * payer, cost and dates, who pays, the scope rule, warnings and the mitigation credit. Viewing it
 * turns on the protected and warned rings on the map.
 */
export default function PlanTab({ fire, inPanel = false }) {
  const { markPlanViewed, setMoreInfo } = useApp()
  const plan = store.planByFire.get(fire.id)
  useEffect(() => markPlanViewed(fire.id), [fire.id, markPlanViewed])
  if (!plan) return null
  return (
    <>
      <Section title="Verdict">
        <p className="plan-verdict">
          <VerdictPill verdict={plan.verdict} />
          <span>{plan.summary}</span>
        </p>
        {plan.statePlan && <p className="callout">{plan.statePlanNote}</p>}
      </Section>
      <Section title="Cost against loss avoided">
        <CostVsLoss plan={plan} fire={fire} />
      </Section>
      {plan.actions.length > 0 && (
        <Section title={`Actions · ${plan.actions.length}`}>
          <ActionList actions={plan.actions} />
        </Section>
      )}
      {plan.cost > 0 && (
        <Section title="Who pays">
          <PayerSplitBar split={plan.payerSplit} total={plan.cost} />
        </Section>
      )}
      {plan.scopeRule && (
        <Section title="Scope rule">
          <p className="card-text">{plan.scopeRule}</p>
          {(plan.protectedHomeIds.length > 0 || plan.warnedHomeIds.length > 0) && (
            <p className="ring-key">
              <span><i className="ring ring-green" /> Protected</span>
              <span><i className="ring ring-amber" /> Warned</span>
            </p>
          )}
        </Section>
      )}
      <Section title="Warnings ledger">
        <WarningsLedger warnings={plan.warnings} />
      </Section>
      {plan.mitigationCredit && (
        <Section title="Mitigation credit">
          <p className="card-text">{plan.mitigationCredit}</p>
        </Section>
      )}
      <div className="drawer-cta">
        <PassToAgent fireId={fire.id} onOpen={inPanel ? () => setMoreInfo('negotiation') : undefined} />
      </div>
    </>
  )
}
