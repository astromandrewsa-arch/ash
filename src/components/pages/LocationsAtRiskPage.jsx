import { TriangleAlert } from 'lucide-react'
import { fireTotals, fires } from '../../lib/data.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import PageHeader from '../common/PageHeader.jsx'
import StatTile from '../common/StatTile.jsx'
import FireTable from './FireTable.jsx'

/** CLAUDE.md §7: every dated fire, with summary tiles; a row opens the fire on the map. */
export default function LocationsAtRiskPage() {
  const t = fireTotals(fires)
  const tiles = [
    { label: 'Fires dated', value: formatNumber(t.datedFires), note: 'next 30 days' },
    { label: 'Homes in path', value: formatNumber(t.homesInPath) },
    { label: 'TIV in path', value: formatUSDCompact(t.tivInPath) },
    { label: 'Expected loss', value: formatUSDCompact(t.expectedLoss), tone: 'loss' },
    { label: 'Preventable', value: formatUSDCompact(t.preventable), note: 'if intervened', tone: 'saving' },
  ]

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHeader
        icon={TriangleAlert}
        title="Locations at Risk"
        summary="Every fire PRIMER has dated across your book. Select a row to open it on the map."
      />
      <div className="tile-row">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
      <FireTable />
    </section>
  )
}
