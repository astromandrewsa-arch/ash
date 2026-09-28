import { fuelGrid, mapConfig } from '../../lib/data.js'

/** Key for the fuel-state grid, shown while that layer is on. */
export default function FuelLegend() {
  return (
    <div className="card fuel-legend" aria-label="Fuel-state grid legend">
      <span className="fuel-legend-title">Days to fuel threshold · {fuelGrid.cellM} m cells</span>
      <span className="fuel-legend-ramp" aria-hidden="true" />
      <span className="fuel-legend-scale">
        <span>0</span>
        <span>{mapConfig.fuelGridScaleDays / 2}</span>
        <span>{mapConfig.fuelGridScaleDays}+</span>
      </span>
    </div>
  )
}
