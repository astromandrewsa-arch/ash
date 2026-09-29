import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { assetSvg } from '../../lib/icons.js'
import { assetAnchor } from '../../lib/assets.js'

/** The asset's icon chip (§3): power pole, tank cluster, pipeline, turbine or substation. */
export default function AssetIcon({ asset, selected, onSelect }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        html: `<div class="asset-chip${selected ? ' is-selected' : ''}">${assetSvg(asset.kind, 15)}</div>`,
        className: 'asset-chip-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    [asset.kind, selected],
  )
  const handlers = useMemo(() => ({ click: () => onSelect(asset.id) }), [onSelect, asset.id])
  return <Marker position={assetAnchor(asset)} icon={icon} title={asset.name} alt={asset.name} zIndexOffset={-100} eventHandlers={handlers} />
}
