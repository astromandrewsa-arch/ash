import { useMemo } from 'react'
import L from 'leaflet'
import { Marker, useMap } from 'react-leaflet'
import { areas, mapConfig } from '../../lib/data.js'
import useZoom from '../../hooks/useZoom.js'

// Close in, the label sits on the area's northern edge; zoomed out it sits above or below the home cluster.
function labelAnchor(area, near) {
  if (!near) return area.center
  const top = area.polygon.reduce((best, p) => (p[0] > best[0] ? p : best), area.polygon[0])
  return [top[0], area.center[1]]
}

// Zoomed out, two areas close on screen split their labels: the northern one above, the southern below.
function farSides(map) {
  const pts = areas.map((a) => map.latLngToContainerPoint(a.center))
  return areas.map((a, i) => {
    const clash = areas.find((b, j) => j !== i && Math.abs(pts[j].x - pts[i].x) < 140 && Math.abs(pts[j].y - pts[i].y) < 60)
    return clash && a.center[0] >= clash.center[0] ? 'up' : 'down'
  })
}

function AreaLabel({ area, placement }) {
  const near = placement === 'near'
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'area-label-icon',
        html: `<div class="area-label is-${placement}"><strong>${area.name}</strong>${near ? `<span>${area.county}</span>` : ''}</div>`,
        iconSize: [0, 0],
      }),
    [area, placement, near],
  )
  return <Marker position={labelAnchor(area, near)} icon={icon} interactive={false} keyboard={false} zIndexOffset={-500} />
}

export default function AreaLabels() {
  const map = useMap()
  const zoom = useZoom()
  const near = zoom >= mapConfig.areaLabelMinZoom
  const sides = near ? null : farSides(map)
  return areas.map((area, i) => <AreaLabel key={area.id} area={area} placement={near ? 'near' : sides[i]} />)
}
