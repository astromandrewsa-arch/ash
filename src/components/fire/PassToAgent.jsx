import { UserRoundCheck } from 'lucide-react'
import useApp from '../../state/useApp.js'

/**
 * "Pass to your dedicated Pyrome agent" (§10): opens the Negotiation tab (in the drawer, or in
 * More info when it sits there); the first time, the stepper animates.
 */
export default function PassToAgent({ fireId, onOpen }) {
  const { setDrawerTab, markHandedOff, handedOff } = useApp()
  const done = handedOff.has(fireId)
  return (
    <button
      type="button"
      className="btn btn-primary btn-block"
      onClick={() => {
        markHandedOff(fireId)
        if (onOpen) onOpen()
        else setDrawerTab('negotiation')
      }}
    >
      <UserRoundCheck size={16} aria-hidden="true" />
      {done ? 'With your Pyrome agent · open the negotiation' : 'Pass to your dedicated Pyrome agent'}
    </button>
  )
}
