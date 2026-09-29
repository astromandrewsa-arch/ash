import { useState } from 'react'
import { useMap } from 'react-leaflet'

/** Creates (once) a named map pane at a z-index and returns its name. */
export default function useMapPane(name, zIndex, { interactive = false } = {}) {
  const map = useMap()
  const [ready] = useState(() => {
    if (!map.getPane(name)) {
      const pane = map.createPane(name)
      pane.style.zIndex = String(zIndex)
      if (!interactive) pane.style.pointerEvents = 'none'
    }
    return name
  })
  return ready
}
