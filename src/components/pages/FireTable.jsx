import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { fires, processByFireId } from '../../lib/data.js'
import { dateRange } from '../../lib/dates.js'
import { formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import RagPill from '../common/RagPill.jsx'

const RAG_ORDER = { red: 0, amber: 1, green: 2 }

const COLUMNS = [
  { id: 'id', label: 'Fire ID', value: (f) => f.id },
  { id: 'place', label: 'Town / county', value: (f) => f.place },
  { id: 'days', label: 'Days away', value: (f) => f.daysUntilFire, numeric: true },
  { id: 'window', label: 'Window', value: (f) => f.window.start },
  { id: 'probability', label: 'Probability', value: (f) => f.probability, numeric: true },
  { id: 'homes', label: 'Homes in path', value: (f) => f.exposure.homesEngulfed, numeric: true },
  { id: 'tiv', label: 'TIV in path', value: (f) => f.exposure.tiv, numeric: true },
  { id: 'loss', label: 'Expected loss', value: (f) => f.exposure.expectedLoss, numeric: true },
  { id: 'status', label: 'Intervention', value: (f) => RAG_ORDER[processByFireId[f.id].rag] },
]

export default function FireTable() {
  const { openFire } = useApp()
  const [sort, setSort] = useState({ id: 'days', dir: 'asc' })

  const column = COLUMNS.find((c) => c.id === sort.id)
  const rows = [...fires].sort((a, b) => {
    const va = column.value(a)
    const vb = column.value(b)
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return sort.dir === 'asc' ? cmp : -cmp
  })

  const toggle = (id) => setSort((s) => (s.id === id ? { id, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { id, dir: 'asc' }))

  return (
    <div className="card table-card">
      <table className="data-table">
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = sort.id === c.id
              const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
              return (
                <th key={c.id} className={c.numeric ? 'is-numeric' : ''} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className={`sort-btn${active ? ' is-active' : ''}`} onClick={() => toggle(c.id)}>
                    {c.label}
                    <Icon size={13} aria-hidden="true" />
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const p = processByFireId[f.id]
            const open = () => openFire(f.id)
            return (
              <tr
                key={f.id}
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
                aria-label={`Open ${f.id} on the map`}
              >
                <td>
                  <span className="fire-id-cell">
                    <span className="fire-id-dot" aria-hidden="true" />
                    {f.id}
                  </span>
                </td>
                <td>
                  <strong>{f.place}</strong>
                  <small>{f.county}</small>
                </td>
                <td className="is-numeric">{f.daysUntilFire}</td>
                <td>
                  {dateRange(f.window.start, f.window.end)}
                  <small>{f.window.days} days</small>
                </td>
                <td className="is-numeric">{formatPct(f.probability)}</td>
                <td className="is-numeric">{formatNumber(f.exposure.homesEngulfed)}</td>
                <td className="is-numeric">{formatUSDCompact(f.exposure.tiv)}</td>
                <td className="is-numeric">{formatUSDCompact(f.exposure.expectedLoss)}</td>
                <td>
                  <RagPill rag={p.rag} label={p.stageLabel} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
