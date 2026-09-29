import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import useSpread from '../../state/useSpread.js'
import { formatHa } from '../../lib/format.js'

/** With many steps, label only the hour steps, every other day and the last day. */
function showTick(n, i, s) {
  if (n <= 11) return true
  if (i === n - 1) return true
  if (s.hour <= 48) return s.hour === 1 || s.hour === 12 || s.hour === 24 || s.hour === 48
  return Math.round(s.hour / 24) % 2 === 1 && i < n - 2
}

/** Play, pause, step and reset the selected fire's spread (§10). */
export default function SpreadControls() {
  const { fire, step, stepInfo, playing, lastStep, play, pause, stepForward, reset, setStep } = useSpread()
  if (!fire) return null
  return (
    <div className="glass spread-bar" aria-label={`${fire.id} spread`}>
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
        <span className="spread-step">{stepInfo ? stepInfo.label : 'Ignition'}</span>
        <span className="spread-ha">{stepInfo ? `${formatHa(stepInfo.ha.p50)} in P50` : `${fire.ignitionZone.class} · ${formatHa(fire.ignitionZone.hectares)}`}</span>
      </div>
      <div className="spread-ticks" role="group" aria-label="Spread steps">
        {fire.steps.map((s, i) => (
          <button key={s.hour} type="button" className={`spread-tick${i <= step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`} onClick={() => setStep(i)} aria-label={s.label} title={s.label}>
            <span>{showTick(fire.steps.length, i, s) ? s.label.replace(' h', 'h').replace('Day ', 'D') : '\u00a0'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
