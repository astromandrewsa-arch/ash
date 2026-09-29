/** Keys for the status overlays that are switched on. */
export default function ViewLegend({ views }) {
  if (!views.intervention && !views.rateGap && !views.sensors) return null
  return (
    <div className="view-legend">
      {views.intervention && (
        <div className="view-legend-row">
          <span className="label">Fires</span>
          <span><i className="dot dot-green" />Work agreed</span>
          <span><i className="dot dot-amber" />In negotiation</span>
          <span><i className="dot dot-red" />Not engaged</span>
        </div>
      )}
      {views.intervention && (
        <div className="view-legend-row">
          <span className="label">Homes</span>
          <span><i className="ring ring-green" />Protected</span>
          <span><i className="ring ring-amber" />Warned</span>
        </div>
      )}
      {views.rateGap && (
        <div className="view-legend-row">
          <span className="label">Rate gap</span>
          <span><i className="dot dot-orange" />Under-priced</span>
          <span><i className="dot dot-blue" />Over-priced</span>
        </div>
      )}
      {views.sensors && (
        <div className="view-legend-row">
          <span className="label">Sensors</span>
          <span><i className="dot dot-sensor" />Live and dead fuel moisture sites</span>
        </div>
      )}
    </div>
  )
}
