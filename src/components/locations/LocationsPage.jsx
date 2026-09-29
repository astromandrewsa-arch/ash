import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { store } from '../../lib/store.js'
import { FILTER_DEFAULTS, applyFilters, fireRows, sortRows } from '../../lib/locations.js'
import SummaryTiles from './SummaryTiles.jsx'
import FilterBar from './FilterBar.jsx'
import EltTable from './EltTable.jsx'
import ConcentrationStrip from './ConcentrationStrip.jsx'

/** Locations at Risk (§13): tiles, the filtered ELT-style table and the concentration strip. */
export default function LocationsPage() {
  const { portfolioId, select } = useApp()
  const portfolio = store.portfolio.portfolios.find((p) => p.id === portfolioId)
  const rows = useMemo(() => fireRows(portfolioId), [portfolioId])
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [sort, setSort] = useState({ key: 'daysAway', dir: 1 })
  const shown = useMemo(() => sortRows(applyFilters(rows, filters), sort.key, sort.dir), [rows, filters, sort])
  const onSort = (key, numeric) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : numeric && key !== 'daysAway' ? -1 : 1 }))
  return (
    <section className="page2 locations" aria-labelledby="loc-title">
      <header className="page2-head">
        <div>
          <h1 id="loc-title">Locations at Risk</h1>
          <p>Every fire PRIMER has dated in {portfolio?.name}. Select a row to open it on the map.</p>
        </div>
      </header>
      <SummaryTiles fires={rows.map((r) => r.fire)} portfolioId={portfolioId} />
      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(FILTER_DEFAULTS)} rows={rows} shown={shown.length} portfolioStates={portfolio?.states || []} />
      {shown.length ? (
        <EltTable rows={shown} sort={sort} onSort={onSort} onOpen={(id) => select('fire', id)} />
      ) : (
        <div className="empty glass">
          <SearchX size={20} aria-hidden="true" />
          <p>No dated fire matches these filters.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setFilters(FILTER_DEFAULTS)}>
            Reset filters
          </button>
        </div>
      )}
      <ConcentrationStrip portfolioId={portfolioId} onOpenArea={(id) => select('area', id)} />
    </section>
  )
}
