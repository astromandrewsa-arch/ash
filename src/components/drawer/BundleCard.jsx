import { BadgeDollarSign } from 'lucide-react'
import { store } from '../../lib/store.js'
import { formatNumber, formatPctSigned, formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import FactGrid from './FactGrid.jsx'

/** A Premium Intelligence bundle, opened from search or a bundle link. */
export default function BundleCard({ bundleId }) {
  const { closeDrawer, setActiveView } = useApp()
  const b = store.bundleById.get(bundleId)
  if (!b) return null
  return (
    <div className="card-body">
      <DrawerHeader icon={<BadgeDollarSign size={20} />} kicker="Premium Intelligence bundle" title={b.name} subtitle={b.places.join(' · ')} onClose={closeDrawer} />
      <section className="card-section">
        <FactGrid
          items={[
            { label: 'Policies', value: formatNumber(b.policies) },
            { label: 'Total insured value', value: formatUSDCompact(b.tiv) },
            { label: 'Premium', value: formatUSDCompact(b.premium) },
            { label: 'Market rate', value: `$${b.marketRatePer1000.toFixed(1)} per $1,000` },
            { label: 'PRIMER technical rate', value: `$${b.primerRatePer1000.toFixed(1)} per $1,000` },
            { label: 'Rate adequacy', value: `${formatPctSigned(b.adequacy)} ${b.adequacy < 0 ? 'under-priced' : 'over-priced'}`, tone: b.adequacy < 0 ? 'orange' : 'blue' },
            { label: '2027 recommendation', value: b.recommendationText, tone: b.recommendation2027 < 0 ? 'blue' : 'orange', wide: b.recommendationText.length > 16 },
            { label: 'Carrier’s filed 2027 change', value: formatPctSigned(b.filed2027) },
          ]}
        />
      </section>
      <section className="card-section">
        <h3 className="label">Sensitivity</h3>
        <p className="card-text">{b.science.sensitivityLine}</p>
      </section>
      <section className="card-section">
        <button type="button" className="btn btn-primary btn-block" onClick={() => setActiveView('premium')}>
          Open Premium Intelligence
        </button>
      </section>
    </div>
  )
}
