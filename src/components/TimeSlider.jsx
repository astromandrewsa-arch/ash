import timeline from '../data/timeline.json'
import useApp from '../state/useApp.js'
import { formatDayOffset } from '../utils/format.js'

const THUMB_PX = 18

// Percentage along the track, corrected for the thumb width so ticks sit under the thumb centre.
function tickPosition(value) {
  const pct = ((value - timeline.min) / (timeline.max - timeline.min)) * 100
  return `calc(${pct}% + ${THUMB_PX / 2 - (pct / 100) * THUMB_PX}px)`
}

export default function TimeSlider() {
  const { daysUntilFire, setDaysUntilFire } = useApp()
  const fill = ((daysUntilFire - timeline.min) / (timeline.max - timeline.min)) * 100

  return (
    <div className="slider-dock">
      <div className="card time-slider">
        <div className="time-slider-head">
          <span className="time-slider-title">{timeline.label}</span>
          <span className="time-slider-value">{formatDayOffset(daysUntilFire)} days</span>
        </div>
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
        <div className="time-slider-ticks" aria-hidden="true">
          {timeline.ticks.map((tick) => (
            <span key={tick} style={{ left: tickPosition(tick) }}>
              {formatDayOffset(tick)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
