import { FlaskConical, Flame, ShieldCheck } from 'lucide-react'
import { historicalFires, models } from '../../lib/data.js'
import { dayMonth } from '../../lib/dates.js'
import { formatPct, formatUSDCompact } from '../../lib/format.js'
import ModelChecks from './ModelChecks.jsx'

const others = models.models.filter((m) => !m.isPrimer)

// The three outcome sentences from CLAUDE.md §9, with the figures filled in.
function sentence(h) {
  if (h.outcome === 'prevented') {
    return (
      <>
        Dated {h.leadTimeDays} days prior → government intervened → cost <strong>{formatUSDCompact(h.cost)}</strong> → premium saved{' '}
        <strong className="is-saving">{formatUSDCompact(h.premiumSaved5yr)}</strong> → fire prevented.
      </>
    )
  }
  if (h.outcome === 'declined') {
    return (
      <>
        Dated at {formatPct(h.probability)}, {h.leadTimeDays} days out → intervention declined → fire occurred on the predicted date,{' '}
        {dayMonth(h.burnedOn)} → loss <strong className="is-loss">{formatUSDCompact(h.realisedLoss)}</strong> (prediction proven).
      </>
    )
  }
  return (
    <>
      Tested against three other models ({others.map((m) => m.kind).join(', ')}) — all three missed this fire, PRIMER dated it{' '}
      <strong className="is-primer">{h.leadTimeDays} days out</strong>.
    </>
  )
}

const ICONS = { prevented: ShieldCheck, declined: Flame, backtest: FlaskConical }
const LABELS = { prevented: 'Prevented', declined: 'Declined, burned', backtest: 'Back-test' }

export default function HistoricalList() {
  const rows = [...historicalFires].sort((a, b) => (a.predictedDate < b.predictedDate ? -1 : 1))
  return (
    <article className="card history-card">
      <header className="card-head">
        <h2>Every fire, last season</h2>
        <span>Comparison models: a tick means the model caught the fire, and how many days out</span>
      </header>
      <ol className="history-list">
        {rows.map((h) => {
          const Icon = ICONS[h.outcome]
          return (
            <li key={h.id} className={`history-row is-${h.outcome}`}>
              <span className="history-icon" title={LABELS[h.outcome]}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="history-main">
                <div className="history-title">
                  <strong>{h.id}</strong> {h.place}, {h.county} · {dayMonth(h.predictedDate)} {h.predictedDate.slice(0, 4)}
                  <span className="history-tag">{LABELS[h.outcome]}</span>
                </div>
                <p className="history-sentence">{sentence(h)}</p>
              </div>
              <ModelChecks fire={h} models={others} />
            </li>
          )
        })}
      </ol>
    </article>
  )
}
