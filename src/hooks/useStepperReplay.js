import { useEffect, useState } from 'react'
import useApp from '../state/useApp.js'
import { stageIndex } from '../components/fire/stages.js'
import { UI } from '../config/ui.js'

// Fires whose first hand-off animation has already played in this session.
const played = new Set()

/**
 * The stage index the stepper shows. On the first hand-off of a fire it starts at Identified,
 * reaches Agent engaged over one second (§10), then walks on to the recorded stage.
 */
export default function useStepperReplay(fireId, negotiation) {
  const { handedOff } = useApp()
  // Once handed off, the agent is engaged at least.
  const target = Math.max(negotiation ? stageIndex(negotiation.stage) : 0, handedOff.has(fireId) ? 1 : 0)
  // Decided once per mount: the tab mounts right after the hand-off click.
  const [replay] = useState(() => handedOff.has(fireId) && !played.has(fireId))
  const [shown, setShown] = useState(replay ? 0 : target)
  useEffect(() => {
    if (!replay) return undefined
    played.add(fireId)
    setShown(0)
    const timers = [setTimeout(() => setShown(Math.min(1, target)), UI.handoffFirstStepMs)]
    for (let i = 2; i <= target; i++) timers.push(setTimeout(() => setShown(i), UI.handoffFirstStepMs + (i - 1) * UI.handoffNextStepMs))
    return () => timers.forEach(clearTimeout)
  }, [fireId, replay, target])
  return replay ? shown : target
}
