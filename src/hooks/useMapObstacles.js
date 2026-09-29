import { useEffect, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { store } from '../lib/store.js'
import { areaInBook } from '../lib/selectors.js'
import { assetAnchor } from '../lib/assets.js'
import { clusterRadius } from '../lib/homesPaint.js'
import { panelKeepOut } from '../lib/mapPadding.js'
import { MAP } from '../config/map.js'
import useApp from '../state/useApp.js'

/**
 * Screen boxes (container px) a map label must not cover: the floating panels, fire markers and
 * their labels and watchlist rings (published by the fire layer), home cluster dots below zoom 9,
 * and asset icons. Recomputed after every move.
 */
export default function useMapObstacles() {
  const map = useMap()
  const { portfolioId, drawerOpen } = useApp()
  const [fireBoxes, setFireBoxes] = useState([])
  const [tick, setTick] = useState(0)
  const bump = () => setTick((t) => t + 1)
  useMapEvents({ moveend: bump, zoomend: bump, resize: bump })
  useEffect(() => {
    const on = (e) => setFireBoxes(e.boxes)
    map.on('pyrome:firelabels', on)
    return () => map.off('pyrome:firelabels', on)
  }, [map])

  return useMemo(() => {
    void tick
    const out = [...panelKeepOut(drawerOpen)]
    const at = (ll) => map.latLngToContainerPoint(ll)
    for (const b of fireBoxes) {
      const p = at(b.at)
      out.push({ x0: p.x + b.x0, y0: p.y + b.y0, x1: p.x + b.x1, y1: p.y + b.y1 })
    }
    if (map.getZoom() < MAP.dotsMinZoom) {
      for (const a of store.areas) {
        if (a.type !== 'homes' || !areaInBook(a.id, portfolioId)) continue
        const p = at(a.centroid)
        const r = clusterRadius(a.homes) + 1
        out.push({ x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r })
      }
    }
    for (const asset of store.assets) {
      if (!areaInBook(asset.areaId, portfolioId)) continue
      const p = at(assetAnchor(asset))
      out.push({ x0: p.x - 13, y0: p.y - 13, x1: p.x + 13, y1: p.y + 13 })
    }
    return out
  }, [tick, fireBoxes, drawerOpen, portfolioId, map])
}
