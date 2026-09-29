import { fuelVariant } from '../../lib/fuel.js'

/** Gradient key for the active fuel grid, driest end on the right. */
export default function FuelLegend({ variantId }) {
  const v = fuelVariant(variantId)
  if (!v) return null
  const stops = v.reverse ? [...v.stops].reverse() : v.stops
  const gradient = `linear-gradient(90deg, ${stops.map(([, c], i) => `${c} ${(i / (stops.length - 1)) * 100}%`).join(', ')})`
  const unit = v.unit
  return (
    <div className="fuel-legend">
      <div className="fuel-legend-head">
        <span>{v.label}</span>
        <span className="muted">Drier →</span>
      </div>
      <span className="fuel-legend-bar" style={{ background: gradient }} aria-hidden="true" />
      <div className="fuel-legend-ticks">
        {stops.map(([value]) => (
          <span key={value}>
            {value}
            {unit}
          </span>
        ))}
      </div>
    </div>
  )
}
