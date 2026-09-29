// Search index for the top bar (§4): fire IDs, places, assets, ranches, bundles and watchlist areas.
import { store } from './store.js'
import { ASSET_KIND } from './assets.js'
import { formatNumber } from './format.js'

const norm = (s) => String(s || '').trim().toLowerCase()

let index = null

function build() {
  const out = []
  for (const f of store.fires) {
    out.push({ kind: 'fire', id: f.id, state: f.state, label: `${f.id} — ${f.name}`, sub: `${f.place} · ${f.headerLine}`, keys: [f.id, f.id.replace('-', ''), f.name, f.place, f.county], primary: 3, rank: 5 })
  }
  for (const [place, areas] of store.areasByPlace) {
    const a = areas[0]
    if (a.type !== 'homes') continue
    const homes = areas.reduce((s, x) => s + x.homes, 0)
    out.push({ kind: 'area', id: a.id, state: a.state, place, label: place, sub: `${a.county}, ${a.state} · ${formatNumber(homes)} homes in ${areas.length} ${areas.length === 1 ? 'area' : 'areas'}`, keys: [place, ...areas.map((x) => x.name), a.county], primary: 1 + areas.length, rank: 4 })
  }
  for (const asset of store.assets) {
    const area = store.areaById.get(asset.areaId)
    out.push({ kind: 'asset', id: asset.id, state: area.state, label: asset.name, sub: `${ASSET_KIND[asset.kind]} · ${asset.operator}`, keys: [asset.name, asset.operator, area.county], rank: 3 })
  }
  for (const r of store.ranches) {
    const area = store.areaById.get(r.areaId)
    out.push({ kind: 'ranch', id: r.id, state: area.state, label: r.name, sub: `Rangeland · ${formatNumber(r.acres)} ac · ${area.county}`, keys: [r.name, area.county], rank: 3 })
  }
  for (const b of store.bundles) {
    out.push({ kind: 'bundle', id: b.id, state: null, label: `${b.name} bundle`, sub: `${formatNumber(b.policies)} policies · rate adequacy ${b.adequacy < 0 ? '−' : '+'}${Math.abs(Math.round(b.adequacy * 100))}%`, keys: [b.name, `${b.name} bundle`], rank: 2 })
  }
  for (const w of store.watchlist) {
    const area = store.areaById.get(w.areaId)
    out.push({ kind: 'watch', id: w.areaId, state: area.state, label: `${w.place} (watchlist)`, sub: `${w.probability}% · ${w.windowDays}-day window`, keys: [w.place, 'watchlist'], rank: 1 })
  }
  return out
}

/** Name keys count in full; secondary keys (operator, county) at 60%. */
function score(entry, q) {
  let best = 0
  entry.keys.forEach((k, i) => {
    const key = norm(k)
    if (!key) return
    let s = 0
    if (key === q) s = 100
    else if (key.startsWith(q)) s = 60
    else if (key.split(/[\s,/()–-]+/).some((w) => w.startsWith(q))) s = 40
    else if (q.length >= 3 && key.includes(q)) s = 20
    const weight = i < (entry.primary ?? 1) ? 1 : 0.6
    best = Math.max(best, s * weight)
  })
  return best ? best + entry.rank : 0
}

export const SEARCH_KIND_LABEL = { fire: 'Dated fire', area: 'Place', asset: 'Asset', ranch: 'Ranch', bundle: 'Bundle', watch: 'Watchlist' }

/** Ranked matches for a query. */
export function searchIndex(query, limit = 8) {
  const q = norm(query)
  if (!q) return []
  if (!index) index = build()
  return index
    .map((e) => ({ e, s: score(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.label.localeCompare(b.e.label))
    .slice(0, limit)
    .map((x) => x.e)
}
