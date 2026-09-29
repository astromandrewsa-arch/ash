import { store } from '../../lib/store.js'
import { assetSvg } from '../../lib/icons.js'
import { ASSET_KIND } from '../../lib/assets.js'
import { formatKm, formatNumber, formatUSDCompact } from '../../lib/format.js'
import { dayMonth } from '../../lib/dates.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import FactGrid from './FactGrid.jsx'
import LinkedFire from './LinkedFire.jsx'
import WatchNote from './WatchNote.jsx'
import FireHistoryList from './FireHistoryList.jsx'
import SvgIcon from '../common/SvgIcon.jsx'

const BAND = { p90: 'P90 core', p50: 'P50 path', p25: 'P25 tail' }

/** Asset card (§9): the whole network or footprint, its history and any dated fire nearby. */
export default function AssetCard({ assetId }) {
  const { closeDrawer, select } = useApp()
  const asset = store.assetById.get(assetId)
  if (!asset) return null
  const area = store.areaById.get(asset.areaId)
  const path = store.pathByAsset.get(asset.id)
  const fire = path ? store.fireById.get(path.fireId) : null
  const wmpTone = asset.wmpStatus === 'Not filed' ? 'amber' : asset.wmpStatus === 'n/a' ? null : 'green'
  const items = [
    { label: 'Operator', value: asset.operator, wide: true },
    asset.km ? { label: 'Length', value: formatKm(asset.km, 1) } : null,
    asset.poles?.length ? { label: 'Poles', value: `${formatNumber(asset.poles.length)}, every 90 m` } : null,
    asset.stations?.length ? { label: 'Pump stations', value: formatNumber(asset.stations.length) } : null,
    asset.turbineCount ? { label: 'Turbines', value: formatNumber(asset.turbineCount) } : null,
    asset.capacity && asset.kind !== 'wind' ? { label: 'Capacity', value: asset.capacity } : null,
    asset.kind === 'wind' ? { label: 'Capacity', value: asset.capacity.split(', ').pop() } : null,
    { label: 'Insured value', value: formatUSDCompact(asset.tiv) },
    { label: 'Wildfire mitigation plan', value: asset.wmpStatus === 'n/a' ? 'Not required' : asset.wmpStatus, tone: wmpTone },
    { label: 'Counties', value: area.county, wide: true },
  ]
  return (
    <div className="card-body">
      <DrawerHeader icon={<SvgIcon html={assetSvg(asset.kind, 20)} />} kicker={ASSET_KIND[asset.kind]} title={asset.name} subtitle={area.realHook} onClose={closeDrawer} />
      <section className="card-section">
        <FactGrid items={items} />
      </section>
      <WatchNote areaId={asset.areaId} />
      {fire && (
        <section className="card-section">
          <h3 className="label">Dated fire nearby</h3>
          <LinkedFire fire={fire} onOpen={(id) => select('fire', id)}>
            {path.band === 'watch' ? (
              <>
                {path.note}. Time to arrival {path.hourReached} h at forecast spread.
              </>
            ) : (
              <>
                In the {BAND[path.band]}; the perimeter reaches it at hour {path.hourReached}
                {path.km ? `, ${formatKm(path.km, 1)} of line` : ''}
                {path.poles ? ` (${formatNumber(path.poles)} poles)` : ''}
                {path.turbines ? `, ${formatNumber(path.turbines)} turbines` : ''}
                {path.stations ? `, ${path.stations} pump stations` : ''}.
              </>
            )}{' '}
            Burns {fire.windowLabel} at {Math.round(fire.probability * 100)}%, called {dayMonth(fire.called)}.
          </LinkedFire>
        </section>
      )}
      <section className="card-section">
        <h3 className="label">Ignition history</h3>
        <p className="card-text">{asset.ignitionHistory}</p>
      </section>
      <FireHistoryList history={area.fireHistory} />
    </div>
  )
}
