import { Target } from 'lucide-react'
import { models, seasonStats } from '../../lib/data.js'
import { formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import PageHeader from '../common/PageHeader.jsx'
import StatTile from '../common/StatTile.jsx'
import AccuracyChart from './AccuracyChart.jsx'
import BeforeAfterSlider from './BeforeAfterSlider.jsx'
import HistoricalList from './HistoricalList.jsx'

/** CLAUDE.md §9: last season's results, PRIMER against three comparison models. */
export default function AccuracyPage() {
  const s = seasonStats
  const others = models.models.filter((m) => !m.isPrimer)
  const tiles = [
    { label: 'Fires dated last season', value: formatNumber(s.firesDated), note: `${s.season} · plus ${s.backTested} back-tests` },
    { label: 'Prevented', value: formatNumber(s.prevented), note: `of ${s.firesDated} dated`, tone: 'saving' },
    { label: 'Premium saved', value: formatUSDCompact(s.premiumSaved), note: `for ${formatUSDCompact(s.interventionCost)} of work`, tone: 'saving' },
    { label: 'Realised loss on declined', value: formatUSDCompact(s.realisedLossOnDeclined), note: `${s.declined} fires burned on the predicted date`, tone: 'loss' },
    {
      label: 'Brier score',
      value: s.brierScore.primer.toFixed(3),
      note: `vs ${others.map((m) => s.brierScore[m.id].toFixed(3)).join(' · ')}`,
      tone: 'primer',
    },
    {
      label: 'Hit rate at 14 days',
      value: formatPct(s.hitRate14.primer),
      note: `vs ${others.map((m) => `${m.name} ${formatPct(s.hitRate14[m.id])}`).join(' · ')}`,
      tone: 'primer',
    },
  ]

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHeader
        icon={Target}
        title="Historical Accuracy vs Other Models"
        summary={`How PRIMER performed in the ${s.season} season, scored against ${formatNumber(s.scoredForecasts)} observed fires across Texas.`}
      />
      <div className="tile-row tile-row-6">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
      <div className="accuracy-grid">
        <AccuracyChart />
        <BeforeAfterSlider />
      </div>
      <HistoricalList />
    </section>
  )
}
