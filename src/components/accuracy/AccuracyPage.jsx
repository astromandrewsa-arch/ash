import { store } from '../../lib/store.js'
import ModelExhibit from './ModelExhibit.jsx'
import AccuracyTiles from './AccuracyTiles.jsx'
import HitRateCard from './HitRateCard.jsx'
import Reliability from './Reliability.jsx'
import LaFlashTile from './LaFlashTile.jsx'
import HistoricalTable from './HistoricalTable.jsx'
import RuledOutTable from './RuledOutTable.jsx'
import BeforeAfterCard from './BeforeAfterCard.jsx'

/** Historical Accuracy (§16): the model exhibit, last season's scores, twelve fires and the ruled-out calls. */
export default function AccuracyPage() {
  const { models, historical, seasonStats: s } = store
  return (
    <section className="page2 accuracy" aria-labelledby="acc-title">
      <header className="page2-head">
        <div>
          <h1 id="acc-title">Historical Accuracy</h1>
          <p>The {s.season} season: what PRIMER dated, what the named models said before each fire, and what happened.</p>
        </div>
      </header>
      <ModelExhibit models={models} />
      <AccuracyTiles tiles={s.tiles} />
      <div className="acc-grid">
        <HitRateCard models={models} />
        <div className="acc-side">
          <Reliability stats={s} models={models} />
          <LaFlashTile la={s.la2025} />
        </div>
      </div>
      <h2 className="acc-h2">Twelve fires from last season</h2>
      <HistoricalTable fires={historical.fires} models={models} />
      <div className="acc-grid is-even acc-lower">
        <RuledOutTable rows={historical.ruledOut} />
        <BeforeAfterCard exhibit={s.crabapple} />
      </div>
      <p className="acc-footer">{s.footer}</p>
    </section>
  )
}
