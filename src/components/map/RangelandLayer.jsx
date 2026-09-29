import { useCallback, useMemo } from 'react'
import L from 'leaflet'
import { store } from '../../lib/store.js'
import { inBook } from '../../lib/selectors.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import useZoom from '../../hooks/useZoom.js'
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
  return areas.map((a) => (
    <RanchShape key={a.id} area={a} renderer={renderer} pane={pane} selected={a.ranchId === selectedRanch} onSelect={onSelect}>
      {zoom >= MAP.ranchLabelMinZoom && <RanchLabel area={a} ranch={store.ranchById.get(a.ranchId)} onSelect={onSelect} />}
    </RanchShape>
  ))
}
