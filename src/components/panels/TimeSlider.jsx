import timeline from '../../data/timeline.json'
import { fires, visibleFires } from '../../lib/data.js'
import { formatDayOffset } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import SpreadControls from './SpreadControls.jsx'

const THUMB_PX = 18

// Percentage along the track, corrected for the thumb width so ticks sit under the thumb centre.
function trackPosition(value) {
  const pct = ((value - timeline.min) / (timeline.max - timeline.min)) * 100
  return `calc(${pct}% + ${THUMB_PX / 2 - (pct / 100) * THUMB_PX}px)`
}

export default function TimeSlider() {
  const { daysUntilFire, setDaysUntilFire, selection } = useApp()
  const fill = ((daysUntilFire - timeline.min) / (timeline.max - timeline.min)) * 100
  const shown = visibleFires(daysUntilFire).length

  return (
    <div className="slider-dock">
      {selection && <SpreadControls />}
      <div className="card time-slider">
        <div className="time-slider-head">
          <span className="time-slider-title">{timeline.label}</span>
          <span className="time-slider-count">
            {shown} of {fires.length} dated fires shown
          </span>
          <span className="time-slider-value">{formatDayOffset(daysUntilFire)} days</span>
        </div>
        <div className="time-slider-track">
          <input
            type="range"
            min={timeline.min}
            max={timeline.max}
            step={timeline.step}
            value={daysUntilFire}
            onChange={(e) => setDaysUntilFire(Number(e.target.value))}
            style={{ '--fill': `${fill}%` }}
            aria-label={timeline.label}
          />
          {/* Where each fire enters the view: a fire dated N days out appears at –N. */}
          {fires.map((f) => (
            <span
              key={f.id}
              className={`time-slider-fire${daysUntilFire >= -f.daysUntilFire ? ' is-on' : ''}`}
              style={{ left: trackPosition(-f.daysUntilFire) }}
              title={`${f.id} appears at ${formatDayOffset(-f.daysUntilFire)}`}
            />
          ))}
        </div>
        <div className="time-slider-ticks" aria-hidden="true">
          {timeline.ticks.map((tick) => (
            <span key={tick} style={{ left: trackPosition(tick) }}>
              {formatDayOffset(tick)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
