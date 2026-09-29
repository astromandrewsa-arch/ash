import { useMemo, useState } from 'react'
import { Map as MapIcon } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { store } from '../../lib/store.js'
import { bundleTotals, bundlesInBook, sortBundles } from '../../lib/premium.js'
import ContextTiles from './ContextTiles.jsx'
import BundleTable from './BundleTable.jsx'
import SciencePanel from './SciencePanel.jsx'
import TechnicalPremium from './TechnicalPremium.jsx'

// Text columns sort A–Z first; adequacy sorts most under-priced first; other figures largest first.
const firstDir = (key) => (key === 'name' || key === 'adequacy' ? 1 : -1)

/** Premium Intelligence (§15): market context, rate adequacy by bundle, the science panel and the technical premium. */
export default function PremiumPage() {
  const { portfolioId, select, setView } = useApp()
  const [sort, setSort] = useState({ key: 'adequacy', dir: 1 })
  const [pickedId, setPickedId] = useState(null)
  const inBook = useMemo(() => bundlesInBook(portfolioId), [portfolioId])
  const rows = useMemo(() => sortBundles(inBook, sort.key, sort.dir), [inBook, sort])
  const totals = useMemo(() => bundleTotals(inBook), [inBook])
  const picked = rows.find((b) => b.id === pickedId) || rows[0]

  const onSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: firstDir(key) }))
  const showOnMap = (id) => {
    setView('rateGap', true)
    select('bundle', id)
  }

  return (
    <section className="page2 premium" aria-labelledby="premium-title">
      <header className="page2-head">
        <div>
          <h1 id="premium-title">Premium Intelligence</h1>
          <p>Rate adequacy by bundle: the market rate against PRIMER’s technical rate, the fuel science behind the gap, and the 2027 recommendation.</p>
        </div>
        <div className="page2-actions">
          <button type="button" className="btn" onClick={() => showOnMap(picked.id)}>
            <MapIcon size={15} aria-hidden="true" />
            Rate gap on the map
          </button>
        </div>
      </header>
      <ContextTiles tiles={store.portfolio.contextTiles} />
      <div className="prem-main">
        <div className="prem-left">
          <BundleTable rows={rows} totals={totals} sort={sort} onSort={onSort} selectedId={picked.id} onSelect={setPickedId} />
          <TechnicalPremium bundle={picked} pricing={store.portfolio.pricing} />
        </div>
        <SciencePanel bundle={picked} onShowOnMap={showOnMap} />
      </div>
    </section>
  )
}
