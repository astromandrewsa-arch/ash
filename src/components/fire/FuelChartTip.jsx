/** Hover card for the fuel chart. */
export default function FuelChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const live = row.liveFm ?? row.liveProj
  const dead = row.dead100h ?? row.deadProj
  const projected = row.liveFm === undefined
  return (
    <div className="chart-tip">
      <strong>
        {label}
        {projected ? ' · projected' : ''}
      </strong>
      <span>
        <i className="dot dot-orange" /> Live fuel {live.toFixed(1)}%
      </span>
      <span>
        <i className="dot dot-blue" /> 100-h dead {dead.toFixed(1)}%
      </span>
    </div>
  )
}
