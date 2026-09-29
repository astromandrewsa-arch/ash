import { useCallback, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { areaInBook } from '../../lib/selectors.js'
import { assetAnchor } from '../../lib/assets.js'
import { MAP } from '../../config/map.js'
import useZoom from '../../hooks/useZoom.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import AssetShape from './AssetShape.jsx'
import AssetIcon from './AssetIcon.jsx'
import AssetDetailLayer from './AssetDetailLayer.jsx'

/** Covered utility assets (§6): yellow lines and pipelines, footprints, icons; poles from zoom 12. */
export default function UtilitiesLayer() {
  const { portfolioId, selection, select } = useApp()
  const pane = useMapPane('assetsPane', 430, { interactive: true })
  const iconPane = useMapPane('assetIconPane', 620, { interactive: true })
  const assets = useMemo(() => store.assets.filter((a) => areaInBook(a.areaId, portfolioId)), [portfolioId])
  const selectedId = selection?.kind === 'asset' ? selection.id : null
  const onSelect = useCallback((id) => select('asset', id), [select])
  const map = useMap()
  const zoom = useZoom()
  // Below zoom 9 an icon that would sit on a home cluster's badge docks at the badge's 4 o'clock.
  const docked = useMemo(() => {
    const out = new Set()
    if (zoom >= MAP.dotsMinZoom) return out
    const dots = store.areas.filter((a) => a.type === 'homes' && areaInBook(a.id, portfolioId)).map((a) => map.latLngToContainerPoint(a.centroid))
    for (const asset of assets) {
      const p = map.latLngToContainerPoint(assetAnchor(asset))
      if (dots.some((d) => Math.hypot(d.x - p.x, d.y - p.y) < 20)) out.add(asset.id)
    }
    return out
  }, [assets, zoom, map, portfolioId])
  return (
    <>
      {assets.map((a) => (
        <AssetShape key={a.id} asset={a} pane={pane} selected={a.id === selectedId} onSelect={onSelect} />
      ))}
      <AssetDetailLayer assets={assets} />
      {assets.map((a) => (
        <AssetIcon key={a.id} asset={a} pane={iconPane} selected={a.id === selectedId} docked={docked.has(a.id)} onSelect={onSelect} />
      ))}
    </>
  )
}
