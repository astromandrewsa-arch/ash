import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import useApp from '../../state/useApp.js'

/** Hands the Leaflet map to app state so pages and search can fly it. */
export default function MapBridge() {
  const map = useMap()
  const { registerMap } = useApp()
  useEffect(() => {
    registerMap(map)
    // Dev only: lets automated browser checks drive the map.
    if (import.meta.env.DEV) window.__pyromeMap = map
  }, [map, registerMap])
  return null
}
