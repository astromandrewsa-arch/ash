import { useEffect, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { fireById, processByFireId, stages } from '../../lib/data.js'
import { reachedStageIndex, timelineEntries } from '../../lib/agent.js'
import { UI } from '../../config/ui.js'
import RagPill from '../common/RagPill.jsx'
import AgentStepper from './AgentStepper.jsx'
import AgentCard from './AgentCard.jsx'
import AgentTimeline from './AgentTimeline.jsx'
import AgentLedger from './AgentLedger.jsx'

/** CLAUDE.md §6: status stepper, dated timeline and ledger for the fire's agent process. */
export default function AgentView({ fireId }) {
  const { selection, setDrawerMode, closeDrawer, handedOff } = useApp()
  const process = processByFireId[fireId]
  const hasFire = Boolean(fireById[fireId])
  const passed = handedOff.has(fireId)
  const animate = Boolean(selection?.animate)

  // Once passed to the agent, an unengaged fire moves to "Agent engaged".
  const target = Math.max(reachedStageIndex(process), passed ? 1 : 0)
  // `fill` drives the connector bar, `shown` the stage nodes; the node changes as the bar arrives.
  const [fill, setFill] = useState(animate ? 0 : target)
  const [shown, setShown] = useState(animate ? 0 : target)
  const [fillMs, setFillMs] = useState(UI.handoffFirstStepMs)
  const [revealed, setRevealed] = useState(!animate)

  // First hand-off: Identified → Agent engaged over about a second, then on to the current stage.
  useEffect(() => {
    if (!animate) return undefined
    const timers = [setTimeout(() => setFill(1), 60), setTimeout(() => setShown(1), 60 + UI.handoffFirstStepMs)]
    let at = 60 + UI.handoffFirstStepMs
    for (let i = 2; i <= target; i++) {
      timers.push(
        setTimeout(() => {
          setFillMs(UI.handoffNextStepMs)
          setFill(i)
          setShown(i)
        }, at),
      )
      at += UI.handoffNextStepMs
    }
    timers.push(setTimeout(() => setRevealed(true), at))
    return () => timers.forEach(clearTimeout)
  }, [animate, target])

  const entries = timelineEntries(process, passed)
  const declined = process.stage === 'declined'
  const status = declined ? { rag: process.rag, label: process.stageLabel } : { rag: target >= 3 ? 'green' : target >= 1 ? 'amber' : 'red', label: stages[target].label }

  return (
    <>
      <header className="drawer-head agent-head">
        <div className="agent-head-top">
          {hasFire ? (
            <button type="button" className="back-link" onClick={() => setDrawerMode('detail')}>
              <ArrowLeft size={15} aria-hidden="true" /> Back to fire
            </button>
          ) : (
            <span className="back-link is-static">Last month</span>
          )}
          <button type="button" className="icon-button" onClick={closeDrawer} aria-label="Close and return to portfolio">
            <X size={18} />
          </button>
        </div>
        <h2>
          {process.fireId} · Pyrome agent
          <span>
            {process.place}, {process.county}
          </span>
        </h2>
        <div className="agent-head-status">
          <RagPill rag={status.rag} label={status.label} />
        </div>
        <AgentStepper shown={shown} fill={fill} fillMs={fillMs} declined={declined && shown === target} />
      </header>
      <div className={`drawer-body agent-body${revealed ? ' is-revealed' : ''}`}>
        <AgentCard process={process} />
        <AgentTimeline entries={entries} />
        <AgentLedger process={process} />
      </div>
    </>
  )
}
