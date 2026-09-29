import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { store } from '../../lib/store.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'

const BAND_LABEL = { p90: 'P90', p50: 'P50', p25: 'P25' }
const BAND_ORDER = { p90: 0, p50: 1, p25: 2 }
const STATE_LABEL = { protected: 'Protected', warned: 'Warned' }

const COLS = [
  { key: 'name', label: 'Address or asset', cmp: (a, b) => a.name.localeCompare(b.name) },
  { key: 'area', label: 'Area', cmp: (a, b) => a.area.localeCompare(b.area) },
  { key: 'tiv', label: 'TIV', num: true },
  { key: 'loss', label: 'Loss if it burns', num: true },
  { key: 'expected', label: 'Expected loss', num: true },
  { key: 'band', label: 'Band', cmp: (a, b) => BAND_ORDER[a.band] - BAND_ORDER[b.band] },
  { key: 'hour', label: 'Hour', num: true },
  { key: 'state', label: 'Plan', cmp: (a, b) => (a.state || 'z').localeCompare(b.state || 'z') },
]

/** Rows for every home, asset, ranch and outbuilding group in the path (§10 More info · Addresses). */
function rowsOf(fire) {
  const assets = fire.assetsInPath
    .filter((a) => a.band !== 'watch')
    .map((a) => {
      const asset = store.assetById.get(a.assetId)
      return { key: a.assetId, kind: 'asset', name: asset.name, area: asset.operator, tiv: a.tiv, loss: a.loss, expected: a.expectedLoss, band: a.band, hour: a.hourReached, state: null }
    })
  const ranches = fire.ranches.map((r) => {
    const ranch = store.ranchById.get(r.ranchId)
    return { key: r.ranchId, kind: 'ranch', name: ranch.name, area: `${formatNumber(r.burnedHa.p50 || r.burnedHa.p25)} ha of range`, tiv: r.tiv, loss: r.loss, expected: r.expectedLoss, band: r.band, hour: null, state: null }
  })
  const other = (fire.otherInPath || []).map((o) => ({ key: `other-${o.band}`, kind: 'other', name: `${formatNumber(o.count)} ${o.label.toLowerCase()}`, area: 'Rural structures', tiv: o.tiv, loss: o.loss, expected: o.expectedLoss, band: o.band, hour: null, state: null }))
  const homes = fire.homesInPath.map((h) => {
    const home = store.homeById.get(h.homeId)
    return { key: h.homeId, kind: 'home', name: home.address, area: store.areaById.get(home.areaId).name, tiv: home.tiv, loss: h.loss, expected: h.expectedLoss, band: h.band, hour: h.hourReached, state: home.protectedState }
  })
  return [...assets, ...ranches, ...other, ...homes]
}

/** Every home and asset in the path: sortable by any column. */
export default function AddressTable({ fire }) {
  const [sort, setSort] = useState({ key: 'expected', dir: -1 })
  const rows = useMemo(() => rowsOf(fire), [fire])
  const sorted = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key)
    const cmp = col.cmp || ((a, b) => (a[col.key] ?? -1) - (b[col.key] ?? -1))
    return [...rows].sort((a, b) => sort.dir * cmp(a, b) || a.key.localeCompare(b.key))
  }, [rows, sort])
  const onSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : COLS.find((c) => c.key === key).num ? -1 : 1 }))
  if (!rows.length) return <p className="addr-summary">No insured homes or assets inside any band.</p>
  const homes = rows.filter((r) => r.kind === 'home').length
  return (
    <div className="addr-wrap">
      <p className="addr-summary">
        {formatNumber(homes)} {homes === 1 ? 'home' : 'homes'} and {formatNumber(rows.length - homes)} other {rows.length - homes === 1 ? 'location' : 'locations'} in the path. Expected loss is the dated probability × the band's minimum burn share × the loss if it burns. Select a column to sort.
      </p>
      <table className="addr-table">
        <thead>
          <tr>
            {COLS.map((c) => (
              <th key={c.key} scope="col" className={c.num ? 'num' : undefined} aria-sort={sort.key === c.key ? (sort.dir > 0 ? 'ascending' : 'descending') : 'none'}>
                <button type="button" onClick={() => onSort(c.key)}>
                  {c.label}
                  {sort.key === c.key && (sort.dir > 0 ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.key} className={`is-${r.kind}`}>
              <td className="addr-name">{r.name}</td>
              <td className="muted">{r.area}</td>
              <td className="num">{formatUSDCompact(r.tiv)}</td>
              <td className="num">{formatUSDCompact(r.loss)}</td>
              <td className="num">{formatUSDCompact(r.expected)}</td>
              <td>
                <span className={`band-pill band-${r.band}`}>{BAND_LABEL[r.band]}</span>
              </td>
              <td className="num">{r.hour == null ? '—' : `h${r.hour}`}</td>
              <td>{r.state ? <span className={`tag tag-${r.state}`}>{STATE_LABEL[r.state]}</span> : <span className="muted">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
