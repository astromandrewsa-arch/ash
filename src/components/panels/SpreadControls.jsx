import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import useSpread from '../../state/useSpread.js'
import { formatHa } from '../../lib/format.js'
import { recipeEvents, stepOfHour } from '../../lib/recipe.js'
import WindEventStrip from './WindEventStrip.jsx'

const MAX_TICK_LABELS = 7

/** Label the first and last tick and every gap-th one between, so labels never collide. */
function labelledTicks(n) {
  const gap = Math.max(1, Math.ceil((n - 1) / (MAX_TICK_LABELS - 1)))
  const out = new Set([0, n - 1])
  let last = 0
  for (let i = 1; i < n - 1; i++) {
    if (i - last >= gap && n - 1 - i >= gap) {
      out.add(i)
      last = i
    }
  }
  return out
}

/** Play, pause, step and reset the selected fire's spread, with the wind and event strip (§10). */
export default function SpreadControls() {
  const { fire, step, stepInfo, playing, lastStep, lastActive, play, pause, stepForward, reset, setStep } = useSpread()
  if (!fire) return null
  const events = recipeEvents(fire)
  const eventSteps = new Map()
  for (const e of events) {
    const i = stepOfHour(fire, e.hour)
    const prev = eventSteps.get(i)
    eventSteps.set(i, prev ? { shift: prev.shift || e.shift, spot: prev.spot || e.spot } : { shift: e.shift, spot: e.spot })
  }
  const held = stepInfo?.held || (step > lastActive && step >= 0)
  const labelled = labelledTicks(fire.steps.length)
  const prevHour = step > 0 ? fire.steps[step - 1].hour : 0
  return (
    <div className="glass spread-bar" aria-label={`${fire.id} spread`}>
      <div className="spread-row">
        <div className="spread-buttons">
          {playing ? (
            <button type="button" className="icon-btn spread-main" onClick={pause} aria-label="Pause spread" title="Pause">
              <Pause size={16} />
            </button>
          ) : (
            <button type="button" className="icon-btn spread-main" onClick={play} aria-label="Play spread" title="Play">
              <Play size={16} />
            </button>
          )}
          <button type="button" className="icon-btn" onClick={stepForward} disabled={step >= lastStep} aria-label="Step spread" title="Step">
            <StepForward size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={reset} disabled={step < 0} aria-label="Reset spread" title="Reset">
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="spread-now">
          <span className="spread-step">
            {stepInfo ? stepInfo.label : 'Ignition'}
            {held && <span className="spread-held">held</span>}
          </span>
          <span className="spread-ha">{stepInfo ? `${formatHa(stepInfo.ha.p50)} in P50` : `${fire.ignitionZone.class} · ${formatHa(fire.ignitionZone.hectares)}`}</span>
        </div>
        <div className="spread-ticks" role="group" aria-label="Spread steps">
          {fire.steps.map((s, i) => {
            const ev = eventSteps.get(i)
            return (
              <button
                key={s.hour}
                type="button"
                className={`spread-tick${i <= step ? ' is-done' : ''}${i === step ? ' is-current' : ''}${i > lastActive ? ' is-held' : ''}`}
                onClick={() => setStep(i)}
                aria-label={s.label}
                title={`${s.label}${i > lastActive ? ' · held' : ''}`}
              >
                {ev && <i className={`tick-event${ev.shift ? ' is-shift' : ev.spot ? ' is-spot' : ''}`} aria-hidden="true" />}
                <span>{labelled.has(i) ? s.label.replace(' h', 'h').replace('Day ', 'D') : ' '}</span>
              </button>
            )
          })}
        </div>
      </div>
      <WindEventStrip fire={fire} stepInfo={stepInfo} prevHour={prevHour} />
    </div>
  )
}
