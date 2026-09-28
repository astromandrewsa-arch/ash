import { Pause, Play, RotateCcw, SkipForward, Wind } from 'lucide-react'
import useSpread from '../../state/useSpread.js'
import { dayMonth } from '../../lib/dates.js'
import { formatHa } from '../../lib/format.js'

/** Play / pause / step / reset for the selected fire's spread, with the step timeline. */
export default function SpreadControls() {
  const { fire, step, playing, lastStep, play, pause, stepForward, reset } = useSpread()
  if (!fire) return null

  const current = step >= 0 ? fire.spread.steps[step] : null
  const reached = fire.homesInPath.filter((h) => h.step <= step).length
  const { windKmH, windFrom } = fire.intensity

  return (
    <div className="card spread-controls" aria-label="Spread animation">
      <div className="spread-controls-row">
        <div className="spread-buttons">
          <button type="button" className="spread-btn is-primary" onClick={play} disabled={playing} aria-label="Play">
            <Play size={15} />
          </button>
          <button type="button" className="spread-btn" onClick={pause} disabled={!playing} aria-label="Pause">
            <Pause size={15} />
          </button>
          <button type="button" className="spread-btn" onClick={stepForward} disabled={step >= lastStep} aria-label="Step">
            <SkipForward size={15} />
          </button>
          <button type="button" className="spread-btn" onClick={reset} disabled={step < 0} aria-label="Reset">
            <RotateCcw size={15} />
          </button>
        </div>
        <div className="spread-status">
          <span className="spread-wind">
            <Wind size={14} aria-hidden="true" /> Under forecast wind {windKmH} km/h {windFrom}
          </span>
          <span className="spread-now">
            {current
              ? `${current.label} · ${dayMonth(current.date)} · ${formatHa(current.hectares)} · ${reached} of ${fire.homesInPath.length} homes reached`
              : `Ignition in block ${fire.block.id} · press play`}
          </span>
        </div>
      </div>
      <ol className="spread-steps" aria-hidden="true">
        {fire.spread.steps.map((s) => (
          <li key={s.index} className={s.index <= step ? (s.index === step ? 'is-current' : 'is-done') : ''}>
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  )
}

