import { store } from '../../lib/store.js'
import { formatHa, formatNumber, formatUSDCompact } from '../../lib/format.js'

const BAND_LABEL = { p90: 'P90', p50: 'P50', p25: 'P25' }

/** Rows for every home, asset, ranch and outbuilding group in the path, earliest first. */
export function inPathRows(fire) {
  const assets = fire.assetsInPath
    .filter((a) => a.band !== 'watch')
    .map((a) => {
      const asset = store.assetById.get(a.assetId)
      return { key: a.assetId, kind: 'asset', name: asset.name, sub: asset.operator, tiv: a.tiv, band: a.band, hour: a.hourReached }
    })
  const ranches = fire.ranches.map((r) => {
    const ranch = store.ranchById.get(r.ranchId)
    return { key: r.ranchId, kind: 'ranch', name: ranch.name, sub: `${formatHa(r.burnedHa.p50 || r.burnedHa.p25)} · ${formatNumber(r.livestock.p50 || r.livestock.p25)} head`, tiv: r.tiv, band: r.band, hour: null }
  })
  const other = (fire.otherInPath || []).map((o) => ({ key: `other-${o.band}`, kind: 'other', name: o.count === 1 ? '1 outbuilding' : `${formatNumber(o.count)} outbuildings and barns`, sub: 'Rural structures', tiv: o.tiv, band: o.band, hour: null }))
  const homes = fire.homesInPath.map((h) => {
    const home = store.homeById.get(h.homeId)
    return { key: h.homeId, kind: 'home', name: home.address, sub: store.areaById.get(home.areaId).name, tiv: home.tiv, band: h.band, hour: h.hourReached, state: home.protectedState }
  })
  const byHour = (a, b) => (a.hour ?? 999) - (b.hour ?? 999)
  return [...assets, ...ranches, ...other, ...homes.sort(byHour)]
}

/** Every home and asset in the path with its band and the hour the perimeter reaches it (§10). */
export default function InPathList({ fire }) {
  const rows = inPathRows(fire)
  if (!rows.length) return <p className="card-text muted">No insured homes or assets inside any band.</p>
  return (
    <div className="inpath" role="table" aria-label="Homes and assets in the path">
      <div className="inpath-head" role="row">
        <span role="columnheader">Home or asset</span>
        <span role="columnheader">TIV</span>
        <span role="columnheader">Band</span>
        <span role="columnheader">Hour</span>
      </div>
      <div className="inpath-body">
        {rows.map((r) => (
          <div key={r.key} className={`inpath-row is-${r.kind}`} role="row">
            <span className="inpath-name" role="cell">
              <strong>{r.name}</strong>
              <span>
                {r.sub}
                {r.state === 'protected' && <em className="tag-green"> · protected</em>}
                {r.state === 'warned' && <em className="tag-amber"> · warned</em>}
              </span>
            </span>
            <span role="cell">{formatUSDCompact(r.tiv)}</span>
            <span role="cell">
              <span className={`band-pill band-${r.band}`}>{BAND_LABEL[r.band]}</span>
            </span>
            <span role="cell">{r.hour == null ? '—' : `h${r.hour}`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
