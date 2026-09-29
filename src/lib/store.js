// v2 data store. The big files (homes, fires, areas, assets, fuel grid) are fetched once at boot so
// they stay out of the JS bundle; the small ones are imported. After `loadData()` resolves, every
// component reads the same objects and lookups from `store`.
import meta from '../data/meta.json'
import portfolioFile from '../data/portfolio.json'
import plans from '../data/plans.json'
import negotiations from '../data/negotiations.json'
import bundles from '../data/bundles.json'
import watchlist from '../data/watchlist.json'
import ranches from '../data/ranches.json'
import models from '../data/models.json'
import historical from '../data/historical.json'
import seasonStats from '../data/seasonStats.json'
import help from '../data/help.json'
import areasUrl from '../data/areas.json?url'
import homesUrl from '../data/homes.json?url'
import assetsUrl from '../data/assets.json?url'
import firesUrl from '../data/fires.json?url'
import fuelUrl from '../data/fuelGrid.json?url'

const INDEX_CELL_DEG = 0.02

export const store = {
  ready: false,
  meta,
  portfolio: portfolioFile,
  plans,
  negotiations,
  bundles,
  watchlist,
  ranches,
  models,
  historical,
  seasonStats,
  help,
  indexCellDeg: INDEX_CELL_DEG,
}

const byId = (list) => new Map(list.map((x) => [x.id, x]))

async function getJson(url, onProgress) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not load ${url}: HTTP ${res.status}`)
  const json = await res.json()
  onProgress?.()
  return json
}

/** Grid index over home centroids: Map<"i,j", home[]>. */
function indexHomes(homes) {
  const cells = new Map()
  for (const h of homes) {
    const key = `${Math.floor(h.centroid[0] / INDEX_CELL_DEG)},${Math.floor(h.centroid[1] / INDEX_CELL_DEG)}`
    let list = cells.get(key)
    if (!list) cells.set(key, (list = []))
    list.push(h)
  }
  return cells
}

export const DATA_FILES = 5

let loading = null
let loadedFiles = 0
const listeners = new Set()

/** Load the big files once; every caller shares the same promise and progress (files loaded). */
export function loadData(onProgress) {
  if (onProgress) listeners.add(onProgress)
  if (!loading) {
    loading = fetchAll(() => {
      loadedFiles++
      listeners.forEach((fn) => fn(loadedFiles))
    })
  }
  return loading
}

async function fetchAll(onProgress) {
  const [areas, homes, assets, fires, fuelGrid] = await Promise.all([areasUrl, homesUrl, assetsUrl, firesUrl, fuelUrl].map((u) => getJson(u, onProgress)))
  // Held steps (after crews stop the head) repeat the previous perimeter.
  for (const f of fires) {
    f.steps.forEach((s, i) => {
      if (!s.held) return
      const prev = f.steps[i - 1]
      s.p90 = prev.p90
      s.p50 = prev.p50
      s.p25 = prev.p25
    })
  }
  Object.assign(store, { areas, homes, assets, fires, fuelGrid })
  store.areaById = byId(areas)
  store.homeById = byId(homes)
  store.assetById = byId(assets)
  store.fireById = byId(fires)
  store.ranchById = byId(ranches)
  store.bundleById = byId(bundles)
  store.planByFire = new Map(plans.map((p) => [p.fireId, p]))
  store.negotiationByFire = new Map(negotiations.filter((n) => !n.lastMonth).map((n) => [n.fireId, n]))
  store.homeIndex = indexHomes(homes)
  store.homesByArea = new Map()
  for (const h of homes) {
    let list = store.homesByArea.get(h.areaId)
    if (!list) store.homesByArea.set(h.areaId, (list = []))
    list.push(h)
  }
  store.areasByPlace = new Map()
  for (const a of areas) {
    let list = store.areasByPlace.get(a.place)
    if (!list) store.areasByPlace.set(a.place, (list = []))
    list.push(a)
  }
  // Which fire reaches each home and asset, in which band and at which hour.
  store.pathByHome = new Map()
  store.pathByAsset = new Map()
  for (const f of fires) {
    for (const p of f.homesInPath) store.pathByHome.set(p.homeId, { ...p, fireId: f.id })
    for (const p of f.assetsInPath) if (!store.pathByAsset.has(p.assetId)) store.pathByAsset.set(p.assetId, { ...p, fireId: f.id })
  }
  store.ready = true
  return store
}
