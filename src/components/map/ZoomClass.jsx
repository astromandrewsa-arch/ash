import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/** Mirrors the zoom level onto the map container (data-zoom) so CSS can size icons by scale. */
export default function ZoomClass() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const update = () => {
      el.dataset.zoom = String(Math.round(map.getZoom()))
    }
    update()
    map.on('zoomend', update)
    return () => map.off('zoomend', update)
  }, [map])
  return null
}
