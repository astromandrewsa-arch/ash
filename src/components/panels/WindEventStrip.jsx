import { Navigation, Wind } from 'lucide-react'
import { compass, eventAt, windAt } from '../../lib/recipe.js'

/** The wind now and the latest recipe event, with wind shifts and spotting called out (§10). */
export default function WindEventStrip({ fire, stepInfo, prevHour }) {
  const hour = stepInfo ? stepInfo.hour : 0
  const wind = windAt(fire, hour)
  const event = eventAt(fire, stepInfo ? hour : 0)
  const fresh = event && (stepInfo ? event.hour > prevHour : event.hour === 0)
  return (
    <div className="wind-strip">
      <span className="wind-now" title={`Wind from ${compass(wind.windFromDeg)} at ${wind.windKmh} km/h`}>
        <Navigation size={14} className="wind-arrow" style={{ transform: `rotate(${wind.windFromDeg + 180 - 45}deg)` }} aria-hidden="true" />
        <span>
          From {compass(wind.windFromDeg)} {wind.windKmh} km/h
          <span className="muted"> · gusts {wind.gustKmh} · RH {wind.rh}%</span>
        </span>
      </span>
      {event && (
        <span key={`${event.hour}-${event.text}`} className={`wind-event${fresh ? ' is-fresh' : ''}`}>
          {event.shift && (
            <span className="pill pill-orange">
              <Wind size={12} aria-hidden="true" />
              Wind shift
            </span>
          )}
          {event.spot && !event.shift && <span className="pill pill-amber">Spotting</span>}
          <span className="wind-event-hour">h{event.hour}</span>
          <span className="wind-event-text">{event.text}</span>
        </span>
      )}
    </div>
  )
}
