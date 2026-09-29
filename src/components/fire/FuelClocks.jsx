import { ArrowDownRight, Hourglass, Timer } from 'lucide-react'

function Metric({ label, value, note, tone }) {
  return (
    <div className={`clock-metric${tone ? ` tone-${tone}` : ''}`}>
      <span className="clock-label">{label}</span>
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
  const ercTone = fuel.erc >= fuel.ercPercentile ? 'red' : null
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
            tone={fuel.liveFm <= 90 ? 'amber' : null}
          />
          <Metric label="Curing" value={`${fuel.curing}%`} note="Share of grass cured" tone={fuel.curing >= 85 ? 'amber' : null} />
        </div>
      </section>
      <section className="clock clock-fast">
        <header>
          <Timer size={14} aria-hidden="true" />
          <span className="label">Fast clock · sets the day</span>
        </header>
        <div className="clock-grid is-four">
          <Metric label="1-h dead" value={`${fuel.dead1h}%`} note="at 15:00" />
          <Metric label="10-h dead" value={`${fuel.dead10h}%`} tone={fuel.dead10h <= 7 ? 'red' : null} />
          <Metric label="100-h dead" value={`${fuel.dead100h}%`} tone={fuel.dead100h <= 13 ? 'red' : null} />
          <Metric label="1000-h dead" value={`${fuel.dead1000h}%`} />
          <Metric label="ERC" value={fuel.erc} note={`90th pct ${fuel.ercPercentile}`} tone={ercTone} />
          <Metric label="KBDI" value={fuel.kbdi} note="of 800" />
          <Metric label="Days since rain" value={fuel.daysSinceRain} note="over 2 mm" />
        </div>
      </section>
    </div>
  )
}
