import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatNumber, formatPct, formatUSDCompact, formatUSDRange } from '../../lib/format.js'
import { stageRag } from '../../lib/selectors.js'
import VerdictPill from '../fire/VerdictPill.jsx'

// ELT view (§13, §19): event ID, rate (probability), mean loss (point) with its lower–upper band,
// SD, exposure impacted. Related figures stack in one cell so every §13 column fits the page.
const COLS = [
  { key: 'id', label: 'Fire' },
  { key: 'place', label: 'Place' },
  { key: 'type', label: 'Exposure' },
  { key: 'daysAway', label: 'Days away · window', num: true },
  { key: 'probability', label: 'Prob.', num: true },
  { key: 'severity', label: 'Severity' },
  { key: 'homes', label: 'Homes', num: true },
  { key: 'assets', label: 'Assets', num: true },
  { key: 'tiv', label: 'Exposed TIV', num: true },
  { key: 'point', label: 'Loss · lower–upper', num: true },
  { key: 'sd', label: 'SD', num: true },
  { key: 'rp', label: 'Return period', num: true },
  { key: 'stage', label: 'Verdict · stage' },
]

const rpText = (rp) => (rp < 2 ? 'under 1-in-2' : `1-in-${Math.round(rp)}`)

/** One row per dated fire; select a row to open the fire on the map. */
export default function EltTable({ rows, sort, onSort, onOpen }) {
  return (
    <div className="elt-wrap glass">
      <table className="elt">
        <thead>
          <tr>
            {COLS.map((c) => {
              const on = sort.key === c.key
              return (
                <th key={c.key} scope="col" className={c.num ? 'num' : undefined} aria-sort={on ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => onSort(c.key, c.num)}>
                    {c.label}
                    {on && (sort.dir > 0 ? <ArrowUp size={11} aria-hidden="true" /> : <ArrowDown size={11} aria-hidden="true" />)}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              tabIndex={0}
              onClick={() => onOpen(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen(r.id)
                }
              }}
              aria-label={`Open ${r.id} ${r.name} on the map`}
            >
              <td className="elt-id">{r.id}</td>
              <td className="elt-stack elt-place">
                <strong title={r.name}>{r.name}</strong>
                <span title={r.place}>{r.place}</span>
              </td>
              <td className="elt-stack">
                <strong className="elt-type">
                  {r.type}
                  {r.types.length > 1 && (
                    <em className="elt-more" title={r.types.join(', ')}>
                      +{r.types.length - 1}
                    </em>
                  )}
                </strong>
                <span>{r.state}</span>
              </td>
              <td className="num elt-stack">
                <strong>{r.daysAway} d</strong>
                <span className="nowrap">{r.window}</span>
              </td>
              <td className="num">{formatPct(r.probability)}</td>
              <td>
                <span className={`sev-text ${r.severity === 'Severe' ? 'is-severe' : 'is-nonsevere'}`}>{r.severity}</span>
              </td>
              <td className="num">{formatNumber(r.homes)}</td>
              <td className="num">{formatNumber(r.assets)}</td>
              <td className="num">{formatUSDCompact(r.tiv)}</td>
              <td className="num elt-stack">
                <strong>{formatUSDCompact(r.point)}</strong>
                <span className="nowrap">{formatUSDRange(r.lower, r.upper)}</span>
              </td>
              <td className="num">{formatUSDCompact(r.sd)}</td>
              <td className="num nowrap txt">{rpText(r.rp)}</td>
              <td className="elt-plan">
                <div className="plan-stack">
                  <VerdictPill verdict={r.verdict} />
                  <span className={`stage-pill rag-${stageRag(r.stage)}`}>{r.stage}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
