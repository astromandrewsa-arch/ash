import { useMap } from 'react-leaflet'
import { mapConfig, visibleFires } from '../../lib/data.js'
import useApp from '../../state/useApp.js'
import useZoom from '../../hooks/useZoom.js'
import FireMarker from './FireMarker.jsx'

// Two fires close together on screen get their labels split above and below.
function labelSides(fires, map) {
  const pts = fires.map((f) => map.latLngToContainerPoint(f.ignition))
  return fires.map((f, i) => {
    const clash = fires.find((g, j) => j !== i && Math.abs(pts[j].x - pts[i].x) < 220 && Math.abs(pts[j].y - pts[i].y) < 70)
    if (!clash) return 'mid'
    return f.ignition[0] >= clash.ignition[0] ? 'up' : 'down'
  })
}

export default function FireMarkersLayer() {
  const map = useMap()
  const zoom = useZoom()
  const { daysUntilFire, layers, preset, selection, openFire } = useApp()
  const fires = visibleFires(daysUntilFire)
  const sides = labelSides(fires, map)
  const far = zoom < mapConfig.areaLabelMinZoom

  return fires.map((fire, i) => (
    <FireMarker
      key={fire.id}
      fire={fire}
      side={sides[i]}
      far={far}
      ring={layers.interventions}
      preset={preset}
      selected={selection?.fireId === fire.id}
      onOpen={openFire}
    />
  ))
}
