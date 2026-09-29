import { ArrowDownRight, Hourglass, Timer } from 'lucide-react'

function Metric({ label, value, note, crossed }) {
  return (
    <div className={`clock-metric${crossed ? ' is-crossed' : ''}`}>
      <span className="clock-label">
        {crossed && <i className="clock-dot" aria-label="past its threshold" />}
        {label}
      </span>
      <span className="clock-value">{value}</span>
      {note && <span className="clock-note">{note}</span>}
    </div>
  )
}

/**
 * Both fuel clocks (§10): the slow clock (live fuel and curing) sets the window; the fast clock
 * (dead fuel by timelag class, ERC, KBDI, days since rain) sets the day.
 */
export default function FuelClocks({ fuel }) {
  // A metric is marked when the forecast's own threshold for it has been crossed (not projected).
  const crossed = (prefix) => fuel.thresholds.some((t) => t.name.startsWith(prefix) && !t.projected)
  return (
    <div className="clocks">
      <section className="clock clock-slow">
        <header>
          <Hourglass size={14} aria-hidden="true" />
          <span className="label">Slow clock · sets the window</span>
        </header>
        <div className="clock-grid">
          <Metric
            label="Live fuel moisture"
            value={`${fuel.liveFm}%`}
            note={
              <>
                <ArrowDownRight size={12} aria-hidden="true" /> {Math.abs(fuel.liveTrendPtsPerDay)} pts a day
              </>
            }
            crossed={crossed('Live')}
          />
          <Metric label="Curing" value={`${fuel.curing}%`} note="Share of grass cured" crossed={crossed('Curing')} />
        </div>
      </section>
      <section className="clock clock-fast">
        <header>
          <Timer size={14} aria-hidden="true" />
          <span className="label">Fast clock · sets the day</span>
        </header>
        <div className="clock-grid is-four">
          <Metric label="1-h dead" value={`${fuel.dead1h}%`} note="at 15:00" />
          <Metric label="10-h dead" value={`${fuel.dead10h}%`} crossed={crossed('10-h')} />
          <Metric label="100-h dead" value={`${fuel.dead100h}%`} crossed={crossed('100-h')} />
          <Metric label="1000-h dead" value={`${fuel.dead1000h}%`} />
          <Metric label="ERC" value={fuel.erc} note={`90th pct ${fuel.ercPercentile}`} crossed={fuel.erc >= fuel.ercPercentile} />
          <Metric label="KBDI" value={fuel.kbdi} note="of 800" />
          <Metric label="Days since rain" value={fuel.daysSinceRain} note="over 2 mm" />
        </div>
        <p className="clock-key">
          <i className="clock-dot" aria-hidden="true" /> past its threshold on this forecast
        </p>
      </section>
    </div>
  )
}
