import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import useSpread from '../../state/useSpread.js'
import useApp from '../../state/useApp.js'
import { formatHa } from '../../lib/format.js'
import { compass, recipeEvents, windAt } from '../../lib/recipe.js'
import Section from '../common/Section.jsx'
import BarrierList from './BarrierList.jsx'

/**
 * Spread tab (§10): play, pause, step and reset; the wind now; the event timeline with wind shifts
 * and spotting called out; the isochrone and burn-probability overlays; the barriers.
 */
export default function SpreadTab({ fire }) {
  const { step, stepInfo, playing, lastStep, play, pause, stepForward, reset } = useSpread()
  const { views, toggleView } = useApp()
  const hour = stepInfo ? stepInfo.hour : 0
  const wind = windAt(fire, hour)
  const events = recipeEvents(fire)
  return (
    <>
      <Section title="Playback">
        <div className="spread-tab-row">
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
          <div className="spread-tab-now">
            <strong>{stepInfo ? stepInfo.label : 'Ignition'}</strong>
            <span>{stepInfo ? `${formatHa(stepInfo.ha.p50)} in P50 · ${formatHa(stepInfo.ha.p25)} in P25` : `${fire.ignitionZone.class} · ${formatHa(fire.ignitionZone.hectares)}`}</span>
          </div>
        </div>
        <p className="spread-tab-wind">
          Wind from {compass(wind.windFromDeg)} {wind.windKmh} km/h, gusts {wind.gustKmh} · RH {wind.rh}% · head {wind.headKmh} km/h · LB {wind.lb}
        </p>
        <div className="chip-row" role="group" aria-label="Spread overlays">
          <button type="button" className={`chip${views.isochrones ? ' is-on' : ''}`} aria-pressed={views.isochrones} onClick={() => toggleView('isochrones')}>
            Isochrones
          </button>
          <button type="button" className={`chip${views.probability ? ' is-on' : ''}`} aria-pressed={views.probability} onClick={() => toggleView('probability')}>
            Burn probability
          </button>
          <button type="button" className={`chip${views.barriers ? ' is-on' : ''}`} aria-pressed={views.barriers} onClick={() => toggleView('barriers')}>
            Barriers
          </button>
        </div>
      </Section>
      <Section title="Wind and events">
        <ol className="event-timeline">
          {events.map((e) => (
            <li key={`${e.hour}-${e.text}`} className={`${e.hour <= hour && step >= 0 ? 'is-past' : ''}${e.shift ? ' is-shift' : ''}${e.spot ? ' is-spot' : ''}`}>
              <span className="ev-hour">h{e.hour}</span>
              <span className="ev-text">
                {e.text}
                {e.shift && <span className="pill pill-orange ev-pill">Wind shift</span>}
                {e.spot && <span className="pill pill-amber ev-pill">Spotting</span>}
              </span>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Recipe">
        <p className="card-text">{fire.shape.recipe}</p>
      </Section>
      <Section title="Barriers">
        <BarrierList barriers={fire.barriers} />
      </Section>
    </>
  )
}
