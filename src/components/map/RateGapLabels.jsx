import { useCallback, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { bundlesInBook } from '../../lib/premium.js'
import { areaInBook, watchlistInBook } from '../../lib/selectors.js'
import { clusterRadius } from '../../lib/homesPaint.js'
import { discRadius, gapLabel, gapOf, isShort } from '../../lib/rateGap.js'
import { labelWidth } from '../../lib/labelPlacement.js'
import { panelKeepOut } from '../../lib/mapPadding.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import BundleLabel, { BUNDLE_LABEL_H } from './BundleLabel.jsx'

// A bundle's label sits just outside one of its shaded places (largest first): below, above, right
// or left. It hides when every spot is taken. Below zoom 7 it carries the figures only (the name
// shows on hover), as the fire markers do.
const COMPACT_BELOW_ZOOM = 7
const GAP = 4
const MAX_PLACES = 3
const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const rectAt = (x, y, w) => ({ x0: x - w / 2, y0: y - BUNDLE_LABEL_H / 2, x1: x + w / 2, y1: y + BUNDLE_LABEL_H / 2 })

/** Screen boxes of a bundle's places (as the Rate gap layer shades them), largest TIV first. */
function placeBoxes(bundle, map) {
  const discs = map.getZoom() < MAP.dotsMinZoom
  const groups = new Map()
  for (const id of bundle.insuredAreaIds) {
    const a = store.areaById.get(id)
    if (!a) continue
    let box
    if (discs && a.type === 'homes') {
      const p = map.latLngToContainerPoint(a.centroid)
      const r = discRadius(a.homes)
      box = { x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r }
    } else {
      const pts = a.polygon.map((ll) => map.latLngToContainerPoint(ll))
      box = { x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y)) }
    }
    const g = groups.get(a.place)
    if (!g) groups.set(a.place, { tiv: a.tiv, box })
    else {
      g.tiv += a.tiv
      g.box = { x0: Math.min(g.box.x0, box.x0), y0: Math.min(g.box.y0, box.y0), x1: Math.max(g.box.x1, box.x1), y1: Math.max(g.box.y1, box.y1) }
    }
  }
  return [...groups.values()].sort((a, b) => b.tiv - a.tiv).slice(0, MAX_PLACES)
}

function place(items, obstacles) {
  const taken = [...obstacles]
  const out = []
  for (const it of items) {
    const h = BUNDLE_LABEL_H / 2 + GAP
    const w = it.width / 2 + GAP
    for (const { box } of it.places) {
      const cx = (box.x0 + box.x1) / 2
      const cy = (box.y0 + box.y1) / 2
      const spot = [
        [cx, box.y1 + h],
        [cx, box.y0 - h],
        [box.x1 + w, cy],
        [box.x0 - w, cy],
      ]
        .map(([x, y]) => rectAt(x, y, it.width))
        .find((r) => !taken.some((t) => overlaps(t, r)))
      if (spot) {
        taken.push(spot)
        out.push({ ...it, point: [(spot.x0 + spot.x1) / 2, (spot.y0 + spot.y1) / 2] })
        break
      }
    }
  }
  return out
}

/** Bundle names with their rate gap (or 2027 change) beside the Rate gap shading; click opens the bundle. */
export default function RateGapLabels() {
  const map = useMap()
  const { portfolioId, views, select, drawerOpen } = useApp()
  const pane = useMapPane('rateLabelPane', 618, { interactive: true })
  const [tick, setTick] = useState(0)
  const bump = () => setTick((t) => t + 1)
  useMapEvents({ zoomend: bump, moveend: bump, resize: bump })
  const mode = views.rateGap2027 ? '2027' : 'now'

  const labels = useMemo(() => {
    void tick
    const compact = map.getZoom() < COMPACT_BELOW_ZOOM
    const items = bundlesInBook(portfolioId)
      .sort((a, b) => Math.abs(gapOf(b, mode)) - Math.abs(gapOf(a, mode)))
      .map((b) => {
        const text = gapLabel(b, mode, compact)
        return { id: b.id, bundle: b, text, full: gapLabel(b, mode), compact, width: labelWidth(compact ? text : `${b.name} ${text}`) + 12, places: placeBoxes(b, map) }
      })
    // Cluster dots and watchlist rings are obstacles, so a label never hides a count.
    const dots =
      map.getZoom() < MAP.dotsMinZoom
        ? store.areas
            .filter((a) => a.type === 'homes' && areaInBook(a.id, portfolioId))
            .map((a) => {
              const p = map.latLngToContainerPoint(a.centroid)
              const r = clusterRadius(a.homes) + 1
              return { x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r }
            })
        : []
    const rings = views.watchlist
      ? watchlistInBook(portfolioId).map((w) => {
          const p = map.latLngToContainerPoint(w.center)
          return { x0: p.x - 18, y0: p.y - 18, x1: p.x + 18, y1: p.y + 18 }
        })
      : []
    return place(items, [...panelKeepOut(drawerOpen), ...dots, ...rings]).map((l) => ({ ...l, latLng: map.containerPointToLatLng(l.point) }))
  }, [portfolioId, mode, map, tick, drawerOpen, views.watchlist])
  const onSelect = useCallback((id) => select('bundle', id), [select])

  return labels.map((l) => (
    <BundleLabel key={l.id} bundle={l.bundle} position={l.latLng} text={l.text} full={l.full} compact={l.compact} short={isShort(l.bundle, mode)} width={l.width} pane={pane} onSelect={onSelect} />
  ))
}
