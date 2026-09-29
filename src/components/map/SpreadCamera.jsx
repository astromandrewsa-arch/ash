import { useEffect } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { boundsOfPolys } from '../../lib/geo.js'
import { mapPadding } from '../../lib/mapPadding.js'
import useApp from '../../state/useApp.js'
import useSpread from '../../state/useSpread.js'

const MARGIN_PX = 14

/** While the spread plays, zoom out whenever the outer band (and the zone) no longer fits the free map area. */
export default function SpreadCamera() {
  const map = useMap()
  const { drawerOpen, views } = useApp()
  const { fire, step } = useSpread()
  useEffect(() => {
    if (!fire || step < 0) return
    const cur = fire.steps[step]
    const b = boundsOfPolys(views.probability ? cur.p25 : cur.p50)
    if (!b) return
    // Keep the ignition zone in frame too, so the fire never slides away from where it started.
    b.extend(L.latLngBounds(fire.ignitionZone.polygon.flat()))
    const pad = mapPadding(drawerOpen)
    const size = map.getSize()
    const nw = map.latLngToContainerPoint(b.getNorthWest())
    const se = map.latLngToContainerPoint(b.getSouthEast())
    const m = MARGIN_PX
    const fits = nw.x >= pad.paddingTopLeft[0] + m && nw.y >= pad.paddingTopLeft[1] + m && se.x <= size.x - pad.paddingBottomRight[0] - m && se.y <= size.y - pad.paddingBottomRight[1] - m
    if (!fits) {
      const grow = (p) => [p[0] + m, p[1] + m]
      map.flyToBounds(b, { paddingTopLeft: grow(pad.paddingTopLeft), paddingBottomRight: grow(pad.paddingBottomRight), maxZoom: map.getZoom(), duration: 0.8 })
    }
  }, [map, fire, step, drawerOpen, views.probability])
  return null
}
