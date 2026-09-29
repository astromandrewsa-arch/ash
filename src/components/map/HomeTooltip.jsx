import { store } from '../../lib/store.js'
import { visibleFires } from '../../lib/selectors.js'
import { distanceToRingKm } from '../../lib/geo.js'
import { formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import MapTip from './MapTip.jsx'

const BAND = { p90: 'P90 core', p50: 'P50 path', p25: 'P25 tail' }

function distanceText(km) {
  if (km === 0) return 'inside its ignition zone'
  if (km < 1) return `${Math.round(km * 100) * 10} m from its ignition zone`
  return `${km.toFixed(km < 10 ? 1 : 0)} km from its ignition zone`
}

/** Hover card for one home (§9): address, TIV, construction, roof, nearest dated fire, plan state. */
export default function HomeTooltip({ home, place }) {
  const { daysUntilFire, views, portfolioId } = useApp()
  const area = store.areaById.get(home.areaId)
  const fires = visibleFires({ slider: daysUntilFire, views, portfolioId })
  let nearest = null
  for (const f of fires) {
    const km = distanceToRingKm(home.centroid, f.ignitionZone.polygon[0])
    if (!nearest || km < nearest.km) nearest = { fire: f, km }
  }
  const path = store.pathByHome.get(home.id)
  const inPath = path && fires.some((f) => f.id === path.fireId)
  return (
    <MapTip place={place} title={home.address} subtitle={`${area.name} · ${area.county}, ${area.state}`}>
      <dl className="tip-grid">
        <div>
          <dt>TIV</dt>
          <dd>{formatUSDCompact(home.tiv)}</dd>
        </div>
        <div>
          <dt>Construction</dt>
          <dd>{home.construction}</dd>
        </div>
        <div>
          <dt>Roof class</dt>
          <dd>{home.roofClass}</dd>
        </div>
        <div>
          <dt>Built</dt>
          <dd>{home.yearBuilt}</dd>
        </div>
      </dl>
      <p className="tip-line">
        {nearest ? (
          <>
            Nearest dated fire <strong>{nearest.fire.id}</strong>, {distanceText(nearest.km)}
          </>
        ) : (
          'No dated fire in view at this slider position'
        )}
      </p>
      {inPath && (
        <p className="tip-line tone-red">
          In {path.fireId}’s {BAND[path.band]}, reached at hour {path.hourReached}
        </p>
      )}
      {inPath && home.protectedState === 'protected' && <p className="tip-line tone-green">Protected under the negotiated plan</p>}
      {inPath && home.protectedState === 'warned' && <p className="tip-line tone-amber">Warned: pre-notice only under the plan</p>}
    </MapTip>
  )
}
