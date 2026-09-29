import { store } from '../../lib/store.js'
import { assetSvg } from '../../lib/icons.js'
import { formatKm, formatNumber, formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import FactGrid from './FactGrid.jsx'
import LinkedFire from './LinkedFire.jsx'
import WatchNote from './WatchNote.jsx'
import FireHistoryList from './FireHistoryList.jsx'
import ValueSplit from './ValueSplit.jsx'
import SvgIcon from '../common/SvgIcon.jsx'

/** Ranch card (§9): acres, pastures, last burn year, livestock and fencing value. */
export default function RanchCard({ ranchId }) {
  const { closeDrawer, select } = useApp()
  const ranch = store.ranchById.get(ranchId)
  if (!ranch) return null
  const area = store.areaById.get(ranch.areaId)
  const fire = store.fires.find((f) => f.ranches.some((r) => r.ranchId === ranch.id))
  const hit = fire?.ranches.find((r) => r.ranchId === ranch.id)
  const c = ranch.components
  return (
    <div className="card-body">
      <DrawerHeader icon={<SvgIcon html={assetSvg('ranch', 20)} />} kicker={`Rangeland · ${area.county}, ${area.state}`} title={ranch.name} subtitle={area.realHook} onClose={closeDrawer} />
      <section className="card-section">
        <FactGrid
          items={[
            { label: 'Acres', value: formatNumber(ranch.acres) },
            { label: 'Pastures', value: formatNumber(ranch.pastures) },
            { label: 'Last prescribed burn', value: String(ranch.lastBurnYear) },
            { label: 'Cattle', value: formatNumber(ranch.cattle) },
            ranch.bison ? { label: 'Bison', value: formatNumber(ranch.bison) } : null,
            { label: 'Fencing', value: formatKm(ranch.fenceKm) },
            { label: 'Headquarters and camps', value: formatNumber(ranch.structures.length) },
            { label: 'Insured value', value: formatUSDCompact(ranch.tiv) },
          ]}
        />
      </section>
      <WatchNote areaId={ranch.areaId} />
      {fire && hit && (
        <section className="card-section">
          <h3 className="label">Dated fire on the ranch</h3>
          <LinkedFire fire={fire} onOpen={(id) => select('fire', id)}>
            P50 path: {formatNumber(hit.burnedHa.p50)} ha of pasture, {formatKm(hit.fenceKm.p50)} of fencing, {formatNumber(hit.livestock.p50)} head, {hit.structures.p50} of {ranch.structures.length} headquarters and camps. Burns {fire.windowLabel}.
          </LinkedFire>
        </section>
      )}
      <section className="card-section">
        <h3 className="label">Insured value</h3>
        <ValueSplit
          total={ranch.tiv}
          parts={[
            ['Structures', c.structures],
            ['Fencing', c.fencing],
            ['Livestock', c.livestock],
            ['Forage', c.forage],
          ]}
        />
        <p className="card-text muted">{ranch.notes}</p>
      </section>
      <FireHistoryList history={area.fireHistory} />
    </div>
  )
}
