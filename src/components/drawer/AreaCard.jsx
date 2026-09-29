import { House } from 'lucide-react'
import { store } from '../../lib/store.js'
import { formatHa, formatNumber, formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import FactGrid from './FactGrid.jsx'
import LinkedFire from './LinkedFire.jsx'
import WatchNote from './WatchNote.jsx'
import FireHistoryList from './FireHistoryList.jsx'

/** A covered homes area: book figures, its bundle, dated fires reaching it and its fire history. */
export default function AreaCard({ areaId }) {
  const { closeDrawer, select } = useApp()
  const area = store.areaById.get(areaId)
  if (!area) return null
  const bundle = store.bundleById.get(area.bundleId)
  const fires = store.fires.filter((f) => f.areaIds.includes(area.id))
  const homes = store.homesByArea.get(area.id) || []
  const inPath = homes.filter((h) => store.pathByHome.has(h.id)).length
  return (
    <div className="card-body">
      <DrawerHeader icon={<House size={20} />} kicker={`${area.county}, ${area.state}`} title={area.name} subtitle={area.realHook} onClose={closeDrawer} />
      <section className="card-section">
        <FactGrid
          items={[
            { label: 'Homes covered', value: formatNumber(area.homes) },
            { label: 'Average TIV', value: formatUSDCompact(area.avgTiv) },
            { label: 'Total insured value', value: formatUSDCompact(area.tiv) },
            { label: 'Premium in force', value: formatUSDCompact(area.premium) },
            { label: 'Area', value: formatHa(area.hectares) },
            { label: 'Sensor sites', value: formatNumber(area.sensors.length) },
            bundle ? { label: 'Bundle', value: bundle.name, wide: true, action: () => select('bundle', bundle.id) } : null,
          ]}
        />
      </section>
      <WatchNote areaId={area.id} />
      {fires.length > 0 && (
        <section className="card-section">
          <h3 className="label">Dated fires reaching this area</h3>
          <div className="linked-list">
            {fires.map((f) => (
              <LinkedFire key={f.id} fire={f} onOpen={(id) => select('fire', id)}>
                <strong>{f.name}</strong> · {f.headerLine}
                {inPath > 0 ? ` · ${formatNumber(inPath)} of these homes in a band` : ''}
              </LinkedFire>
            ))}
          </div>
        </section>
      )}
      <FireHistoryList history={area.fireHistory} />
    </div>
  )
}
