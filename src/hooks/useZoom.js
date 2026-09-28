import { useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

/** Current map zoom, updated at the end of each zoom. */
export default function useZoom() {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  return zoom
}
