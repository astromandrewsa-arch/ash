import { formatHa, formatNumber, formatUSDCompact } from '../../lib/format.js'

const BANDS = [
  { key: 'p90', label: 'P90', note: 'Core · 90% of runs', title: 'Burns in at least 90% of ensemble runs' },
  { key: 'p50', label: 'P50', note: 'Expected', title: 'Burns in at least half the runs: the point loss' },
  { key: 'p25', label: 'P25', note: 'Tail', title: 'The tail if nothing intervenes' },
]
const CUM = { p90: ['p90'], p50: ['p90', 'p50'], p25: ['p90', 'p50', 'p25'] }

/**
 * The three bands side by side (§8): loss, homes, assets, exposed TIV and mean damage ratio, plus
 * rangeland and livestock where ranches burn and outbuildings where rural structures do.
 */
export default function BandCards({ fire, gross }) {
  const rows = [
    { key: 'loss', label: gross ? 'Gross loss' : 'Loss', value: (d) => formatUSDCompact(gross ? d.gross : d.loss) },
    { key: 'homes', label: 'Homes', value: (d) => formatNumber(d.homes) },
    { key: 'assets', label: 'Assets', value: (d) => formatNumber(d.assets) },
  ]
  if (fire.ranches.length) {
    rows.push({ key: 'range', label: 'Rangeland', value: (d, band) => formatHa(fire.ranches.reduce((s, r) => s + (r.burnedHa[band] || 0), 0)) })
    rows.push({ key: 'stock', label: 'Livestock', value: (d, band) => `${formatNumber(fire.ranches.reduce((s, r) => s + (r.livestock[band] || 0), 0))} head` })
  }
  if (fire.otherInPath?.length) {
    rows.push({ key: 'out', label: 'Outbuildings', value: (d, band) => formatNumber(fire.otherInPath.filter((o) => CUM[band].includes(o.band)).reduce((s, o) => s + o.count, 0)) })
  }
  rows.push({ key: 'tiv', label: 'Exposed TIV', value: (d) => formatUSDCompact(d.tiv) })
  rows.push({ key: 'dr', label: 'Damage ratio', value: (d) => `${Math.round(d.damageRatio * 100)}%` })
  return (
    <table className="band-table">
      <thead>
        <tr>
          <th scope="col">
            <span className="visually-hidden">Measure</span>
          </th>
          {BANDS.map((b) => (
            <th key={b.key} scope="col" className={`band-${b.key}`} title={b.title}>
              <span className="band-name">{b.label}</span>
              <span className="band-note">{b.note}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className={`is-${r.key}`}>
            <th scope="row">{r.label}</th>
            {BANDS.map((b) => (
              <td key={b.key} className={`band-${b.key}`}>
                {r.value(fire.bands[b.key], b.key)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
