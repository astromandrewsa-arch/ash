import { store } from '../../lib/store.js'
import { formatUSDCompact } from '../../lib/format.js'

const TYPE = { homes: 'Homes', utility: 'Utility', rangeland: 'Rangeland' }

/**
 * Exposure concentration (§13, §19): the ten areas with the most TIV inside the dated fires' P50
 * paths, as bars; utility corridors are flagged as linear accumulations.
 */
export default function ConcentrationStrip({ portfolioId, onOpenArea }) {
  const p = store.portfolio.portfolios.find((x) => x.id === portfolioId)
  const list = p?.exposedConcentrations || []
  if (!list.length) return null
  const max = list[0].exposedTiv
  return (
    <section className="conc glass" aria-labelledby="conc-title">
      <header className="conc-head">
        <h2 id="conc-title" className="label">
          Exposure concentration · top 10 areas by exposed TIV
        </h2>
        <span className="conc-key">
          <i className="conc-swatch is-linear" /> Linear accumulation (utility corridor)
        </span>
      </header>
      <ol className="conc-list">
        {list.map((c) => (
          <li key={c.areaId}>
            <button type="button" className="conc-row" onClick={() => onOpenArea(c.areaId)} title={`Open ${c.name} on the map`}>
              <span className="conc-name">
                <strong>{c.name}</strong>
                <span>
                  {TYPE[c.type]}
                  {c.linear && <em className="conc-linear"> · linear</em>} · {c.fireIds.join(', ')}
                </span>
              </span>
              <span className="conc-track">
                <span className={`conc-bar${c.linear ? ' is-linear' : ''}`} style={{ width: `${(c.exposedTiv / max) * 100}%` }} />
              </span>
              <span className="conc-value">{formatUSDCompact(c.exposedTiv)}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
