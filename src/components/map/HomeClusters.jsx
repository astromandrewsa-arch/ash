import { useMemo } from 'react'
import L from 'leaflet'
import { Marker, useMap } from 'react-leaflet'
import { areas, boundsOfPolygons } from '../../lib/data.js'
import { formatNumber } from '../../lib/format.js'
import { mapPadding } from '../../lib/mapPadding.js'
import { UI } from '../../config/ui.js'

function Cluster({ area }) {
  const map = useMap()
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'home-cluster-icon',
        html: `<div class="home-cluster" title="${area.homesCount} homes in ${area.name}"><span>${formatNumber(area.homesCount)}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
    [area],
  )
  const handlers = useMemo(
    () => ({ click: () => map.flyToBounds(boundsOfPolygons([area.polygon]), { ...mapPadding(false), duration: UI.flyDurationS }) }),
    [map, area],
  )
  return <Marker position={area.center} icon={icon} eventHandlers={handlers} zIndexOffset={-200} />
}

/** Below town zoom, one yellow marker per coverage area with its home count. */
export default function HomeClusters() {
  return areas.map((area) => <Cluster key={area.id} area={area} />)
}
