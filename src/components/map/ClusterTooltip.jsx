import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import MapTip from './MapTip.jsx'

/** Hover card for a cluster dot: the places it stands for and their homes. */
export default function ClusterTooltip({ cluster, place }) {
  const places = [...new Set(cluster.areas.map((a) => a.place))]
  const title = places.length > 2 ? `${places.slice(0, 2).join(', ')} +${places.length - 2} more` : places.join(', ')
  const n = cluster.areas.length
  return (
    <MapTip place={place} title={title} subtitle={`${n} covered ${n === 1 ? 'area' : 'areas'}`}>
      <dl className="tip-grid">
        <div>
          <dt>Homes</dt>
          <dd>{formatNumber(cluster.homes)}</dd>
        </div>
        <div>
          <dt>TIV</dt>
          <dd>{formatUSDCompact(cluster.tiv)}</dd>
        </div>
      </dl>
      <p className="tip-hint">Click to zoom in</p>
    </MapTip>
  )
}
