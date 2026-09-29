import FuelClocks from './FuelClocks.jsx'
import ThresholdList from './ThresholdList.jsx'
import FuelChart from './FuelChart.jsx'
import NarrowingStrip from './NarrowingStrip.jsx'
import Section from '../common/Section.jsx'

/**
 * Forecast tab (§10): both fuel clocks, the thresholds and the day each was crossed, live and
 * 100-h dead fuel moisture over 30 days with the crossings marked, and the ensemble narrowing.
 */
export default function ForecastTab({ fire }) {
  return (
    <>
      <Section title="Fuel state · both clocks" help="fuel" note="Live fuel and curing set the window; dead fuel and wind set the day.">
        <FuelClocks fuel={fire.fuel} />
      </Section>
      <Section title="Thresholds behind the date">
        <ThresholdList thresholds={fire.fuel.thresholds} />
      </Section>
      <Section title="Live and 100-h dead fuel moisture · 30 days">
        <FuelChart fire={fire} />
        <p className="chart-legend">
          <span><i className="dot dot-orange" /> Live fuel moisture</span>
          <span><i className="dot dot-blue" /> 100-h dead fuel moisture</span>
          <span className="muted">Dashed: projected to the window</span>
        </p>
      </Section>
      <Section title="Ensemble narrowing" help="lead" note="The burn window on each issue date; probability rises as it narrows.">
        <NarrowingStrip fire={fire} />
      </Section>
    </>
  )
}
