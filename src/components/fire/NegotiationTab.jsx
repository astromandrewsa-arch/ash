import { store } from '../../lib/store.js'
import { dayMonth } from '../../lib/dates.js'
import useStepperReplay from '../../hooks/useStepperReplay.js'
import Section from '../common/Section.jsx'
import FactGrid from '../drawer/FactGrid.jsx'
import NegotiationStepper from './NegotiationStepper.jsx'
import NegotiationTimeline from './NegotiationTimeline.jsx'
import PayerSplitBar from './PayerSplitBar.jsx'
import LedgerCard from './LedgerCard.jsx'

/** Negotiation tab (§12): the stepper, counterparty and decision date, the split agreed so far, the log and the ledger. */
export default function NegotiationTab({ fire }) {
  const neg = store.negotiationByFire.get(fire.id)
  const shown = useStepperReplay(fire.id, neg)
  if (!neg) return null
  return (
    <>
      <Section title="Stage">
        <NegotiationStepper negotiation={neg} shown={shown} />
      </Section>
      <Section>
        <FactGrid
          items={[
            { label: 'Your Pyrome agent', value: neg.agent.name },
            { label: 'Counterparty', value: neg.counterparty },
            { label: 'Decision due', value: dayMonth(neg.decisionDue) },
            { label: 'Status', value: neg.ledger.status },
          ]}
        />
      </Section>
      <Section title="Payer split agreed so far">
        <PayerSplitBar split={neg.payerAgreed} />
      </Section>
      <Section title="Timeline">
        <NegotiationTimeline entries={neg.entries} />
      </Section>
      <Section title="Ledger and documents">
        <LedgerCard ledger={neg.ledger} />
      </Section>
    </>
  )
}
