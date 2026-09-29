import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { clusterAt, homeAt } from '../../lib/homesPaint.js'
import { boundsOfAreas, pointInRing } from '../../lib/geo.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'
import HomeTooltip from './HomeTooltip.jsx'
import ClusterTooltip from './ClusterTooltip.jsx'

/** Hover and click on the homes canvas: tooltips for homes and cluster dots, clicks open the area. */
export default function HomeHover({ st }) {
  const map = useMap()
  const { select, flyToBounds } = useApp()
  const [hover, setHover] = useState(null)

  useEffect(() => {
    let raf = 0
    let last = null
    const test = () => {
      raf = 0
      if (!last) return
      const k = clusterAt(st.current, last)
      if (k) return setHover({ kind: 'cluster', item: k, x: last.x, y: last.y })
      const h = homeAt(st.current, map, last)
      if (h) return setHover({ kind: 'home', item: h, x: last.x, y: last.y })
      setHover(null)
    }
    const onMove = (e) => {
      last = e.containerPoint
      if (!raf) raf = requestAnimationFrame(test)
    }
    const clear = () => {
      last = null
      setHover(null)
    }
    const onClick = (e) => {
      const k = clusterAt(st.current, e.containerPoint)
      if (k) {
        flyToBounds(boundsOfAreas(k.areas).pad(0.15), { maxZoom: 13 })
        return
      }
      const h = homeAt(st.current, map, e.containerPoint)
      if (h) {
        select('area', h.areaId, { fly: false })
        return
      }
      if (map.getZoom() >= MAP.dotsMinZoom && st.current.showHomes) {
        const ll = [e.latlng.lat, e.latlng.lng]
        const area = st.current.areas.find((a) => pointInRing(ll, a.polygon))
        if (area) select('area', area.id, { fly: false })
      }
    }
    map.on('mousemove', onMove)
    map.on('mouseout movestart zoomstart', clear)
    map.on('click', onClick)
    return () => {
      map.off('mousemove', onMove)
      map.off('mouseout movestart zoomstart', clear)
      map.off('click', onClick)
      cancelAnimationFrame(raf)
    }
  }, [map, st, select, flyToBounds])

  useEffect(() => {
    map.getContainer().classList.toggle('is-over-home', Boolean(hover))
  }, [map, hover])

  if (!hover) return null
  const size = map.getSize()
  const place = { left: hover.x + 16, top: hover.y + 14, flipX: hover.x > size.x - 300, flipY: hover.y > size.y - 220 }
  return hover.kind === 'home' ? <HomeTooltip home={hover.item} place={place} /> : <ClusterTooltip cluster={hover.item} place={place} />
}
