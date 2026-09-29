import { ShieldCheck } from 'lucide-react'
import { stageTone } from '../../lib/selectors.js'

/** A negotiation stage as a pill (§12): neutral, amber, green or red, with a shield on a state plan. */
export default function StagePill({ stage, declined = false, label }) {
  return (
    <span className={`stage-pill rag-${stageTone(stage, declined)}`}>
      {stage === 'State plan' && !declined && <ShieldCheck size={11} aria-hidden="true" />}
      {label ?? (declined ? 'Declined' : stage)}
    </span>
  )
}
