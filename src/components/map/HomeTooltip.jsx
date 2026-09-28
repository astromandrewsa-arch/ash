import { formatUSDCompact } from '../../lib/format.js'

export default function HomeTooltip({ home }) {
  return (
    <div className="home-tip">
      <div className="home-tip-address">{home.address}</div>
      <div className="home-tip-locality">{home.locality}, TX · {home.policyNumber}</div>
      <dl className="home-tip-grid">
        <dt>Insured value</dt>
        <dd>{formatUSDCompact(home.tiv)}</dd>
        <dt>Construction</dt>
        <dd>{home.construction}</dd>
        <dt>Nearest dated fire</dt>
        <dd>
          {home.nearestFire.km.toFixed(1)} km · {home.nearestFire.fireId}
        </dd>
      </dl>
    </div>
  )
}
