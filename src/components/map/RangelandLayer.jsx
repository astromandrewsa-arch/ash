import { useCallback, useMemo } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { inBook } from '../../lib/selectors.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import useZoom from '../../hooks/useZoom.js'
import useMapObstacles from '../../hooks/useMapObstacles.js'
import { MAP } from '../../config/map.js'
import RanchShape from './RanchShape.jsx'
import RanchLabel from './RanchLabel.jsx'

/** Covered rangeland (§6): hatched yellow at 25% with the ranch name. */
export default function RangelandLayer() {
  const { portfolioId, selection, select } = useApp()
  const pane = useMapPane('ranchPane', 380, { interactive: true })
  const zoom = useZoom()
  // SVG, not canvas, so the ranches can take the hatch pattern defined in MapView.
  const renderer = useMemo(() => L.svg({ pane, padding: 0.4 }), [pane])
  const areas = useMemo(() => store.areas.filter((a) => a.type === 'rangeland' && inBook(a.state, portfolioId)), [portfolioId])
  const selectedRanch = selection?.kind === 'ranch' ? selection.id : null
  const onSelect = useCallback((ranchId) => select('ranch', ranchId), [select])
  const map = useMap()
  const obstacles = useMapObstacles()
  // A ranch name that would sit under a panel, a marker, a cluster dot or an asset icon is left off.
  const clear = useMemo(() => {
    const ok = new Set()
    if (zoom < MAP.ranchLabelMinZoom) return ok
    for (const a of areas) {
      const name = store.ranchById.get(a.ranchId)?.name ?? ''
      const p = map.latLngToContainerPoint(a.centroid)
      const w = name.length * 7.4 + 8
      const box = { x0: p.x - w / 2, y0: p.y - 9, x1: p.x + w / 2, y1: p.y + 9 }
      if (!obstacles.some((o) => o.x0 < box.x1 && box.x0 < o.x1 && o.y0 < box.y1 && box.y0 < o.y1)) ok.add(a.id)
    }
    return ok
  }, [areas, obstacles, zoom, map])
  return areas.map((a) => (
    <RanchShape key={a.id} area={a} renderer={renderer} pane={pane} selected={a.ranchId === selectedRanch} onSelect={onSelect}>
      {clear.has(a.id) && <RanchLabel area={a} ranch={store.ranchById.get(a.ranchId)} onSelect={onSelect} />}
    </RanchShape>
  ))
}
