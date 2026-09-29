import { useMemo } from 'react'
import { Polygon, Polyline, Tooltip } from 'react-leaflet'
import { palette } from '../../styles/palette.js'
import { assetSummary } from '../../lib/assets.js'

/** One asset's geometry: a cased yellow line (dashed for pipelines) or a yellow footprint. */
export default function AssetShape({ asset, pane, selected, onSelect }) {
  const c = palette()
  const handlers = useMemo(() => ({ click: () => onSelect(asset.id) }), [onSelect, asset.id])
  const tip = (
    <Tooltip className="map-tooltip" sticky direction="top" offset={[0, -8]}>
      <strong>{asset.name}</strong>
      <span>{assetSummary(asset)}</span>
    </Tooltip>
  )
  if (asset.kind === 'substation') return null
  if (asset.kind === 'line' || asset.kind === 'pipeline') {
    return (
      <>
        <Polyline
          pane={pane}
          positions={asset.geometry}
          bubblingMouseEvents={false}
          pathOptions={{ color: '#0F0F10', weight: selected ? 9 : 7, opacity: 0.55, lineCap: 'round', lineJoin: 'round' }}
          eventHandlers={handlers}
        >
          {tip}
        </Polyline>
        <Polyline
          pane={pane}
          positions={asset.geometry}
          interactive={false}
          pathOptions={{ color: c.yellow, weight: selected ? 4 : 2.6, opacity: 1, dashArray: asset.kind === 'pipeline' ? '8 6' : null, lineCap: 'round', lineJoin: 'round' }}
        />
      </>
    )
  }
  return (
    <Polygon
      pane={pane}
      positions={asset.geometry}
      bubblingMouseEvents={false}
      pathOptions={{ color: c.yellow, weight: selected ? 2.6 : 1.6, opacity: 0.95, fillColor: c.yellow, fillOpacity: selected ? 0.24 : 0.13 }}
      eventHandlers={handlers}
    >
      {tip}
    </Polygon>
  )
}
