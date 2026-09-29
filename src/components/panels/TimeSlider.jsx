import { useMemo } from 'react'
import useApp from '../../state/useApp.js'
import { isVisibleAt, sliderFires } from '../../lib/shellData.js'
import { formatDayOffset } from '../../lib/format.js'

const MIN = -30
const MAX = 0
const TICKS = [-30, -25, -20, -15, -10, -5, 0]
const LANE_PX = 7

const pct = (value) => ((Math.max(MIN, Math.min(MAX, value)) - MIN) / (MAX - MIN)) * 100

/** Greedy lanes so overlapping burn windows stack instead of hiding each other. */
function laneOf(bands) {
  const laneEnds = []
  return bands.map((b) => {
    let lane = laneEnds.findIndex((end) => end < b.from)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = b.to
    return { ...b, lane }
  })
}

/** "Days until fire" from −30 to 0; each fire's burn window is a tick band in its severity colour. */
export default function TimeSlider({ children }) {
  const { daysUntilFire, setDaysUntilFire } = useApp()

  const bands = useMemo(
    () =>
      laneOf(
        sliderFires
          .map((f) => ({ ...f, from: Math.max(MIN, -f.endDay), to: -f.startDay }))
          .sort((a, b) => a.from - b.from || a.to - b.to),
      ),
    [],
  )
  const lanes = Math.max(1, ...bands.map((b) => b.lane + 1))
  const shown = sliderFires.filter((f) => isVisibleAt(f.startDay, daysUntilFire)).length

  return (
    <div className="slider-dock">
      {children}
      <div className="glass dslider" aria-label="Days until fire">
        <div className="dslider-head">
          <span className="label">Days until fire</span>
          <span className="dslider-value" aria-hidden="true">
            {formatDayOffset(daysUntilFire)}
          </span>
          <span className="dslider-legend" aria-hidden="true">
            <span>
              <i style={{ background: 'var(--red)' }} />
              Severe
            </span>
            <span>
              <i style={{ background: 'var(--amber)' }} />
              Non-severe
            </span>
          </span>
          <span className="dslider-count">
            {shown} of {sliderFires.length} dated fires in view
          </span>
        </div>
        <div className="dslider-lanes" style={{ height: lanes * LANE_PX }} aria-hidden="true">
          {bands.map((b) => (
            <span
              key={b.id}
              className={`dslider-band${isVisibleAt(b.startDay, daysUntilFire) ? ' is-on' : ''}`}
              title={`${b.id} ${b.name}: burn window ${formatDayOffset(-b.endDay)} to ${formatDayOffset(-b.startDay)} days`}
              style={{
                left: `${pct(b.from)}%`,
                width: `max(4px, ${pct(b.to) - pct(b.from)}%)`,
                top: b.lane * LANE_PX,
                background: b.severity === 'Severe' ? 'var(--red)' : 'var(--amber)',
              }}
            />
          ))}
        </div>
        <div className="dslider-track">
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={daysUntilFire}
            onChange={(e) => setDaysUntilFire(Number(e.target.value))}
            style={{ '--fill': `${pct(daysUntilFire)}%` }}
            aria-label="Days until fire"
            aria-valuetext={`${formatDayOffset(daysUntilFire)} days`}
          />
        </div>
        <div className="dslider-ticks" aria-hidden="true">
          {TICKS.map((tick) => (
            <span key={tick} style={{ left: `${pct(tick)}%` }}>
              {formatDayOffset(tick)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
