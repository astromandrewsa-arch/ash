import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { assetSvg } from '../../lib/icons.js'
import { assetAnchor } from '../../lib/assets.js'

/** The asset's icon chip (§3): power pole, tank cluster, pipeline, turbine or substation. */
export default function AssetIcon({ asset, pane, selected, docked = false, onSelect }) {
  // Docked (sharing a spot with a home cluster's badge): a smaller chip offset to the badge's 4 o'clock.
  const icon = useMemo(
    () =>
      L.divIcon({
        html: `<div class="asset-chip${selected ? ' is-selected' : ''}${docked ? ' is-docked' : ''}">${assetSvg(asset.kind, docked ? 11 : 15)}</div>`,
        className: 'asset-chip-icon',
        iconSize: docked ? [18, 18] : [26, 26],
        iconAnchor: docked ? [9 - 14, 9 - 10] : [13, 13],
      }),
    [asset.kind, selected, docked],
  )
  const handlers = useMemo(() => ({ click: () => onSelect(asset.id) }), [onSelect, asset.id])
  return <Marker pane={pane} position={assetAnchor(asset)} icon={icon} title={asset.name} alt={asset.name} zIndexOffset={docked ? 400 : -100} eventHandlers={handlers} />
}
