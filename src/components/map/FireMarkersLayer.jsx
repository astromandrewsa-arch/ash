import { useCallback, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { stageRag, visibleFires, watchlistInBook } from '../../lib/selectors.js'
import { fireCenter } from '../../lib/geo.js'
import { dayMonth } from '../../lib/dates.js'
import { labelWidth, placeLabels } from '../../lib/labelPlacement.js'
import { panelKeepOut } from '../../lib/mapPadding.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'
import FireMarker, { FLAME_PX } from './FireMarker.jsx'

const COMPACT_BELOW_ZOOM = 7

/** §9 marker label: ID · called date · window · probability · homes in path (or the main exposure). */
export function fireLabel(f) {
  return `${f.id} · ${dayMonth(f.called)} · ${f.windowLabel} · ${Math.round(f.probability * 100)}% · ${f.pathLabel}`
}

export default function FireMarkersLayer() {
  const map = useMap()
  const { daysUntilFire, views, portfolioId, selection, select, drawerOpen } = useApp()
  const pane = useMapPane('firePane', 640, { interactive: true })
  const [tick, setTick] = useState(0)
  useMapEvents({ zoomend: () => setTick((t) => t + 1), resize: () => setTick((t) => t + 1) })
  const fires = useMemo(() => visibleFires({ slider: daysUntilFire, views, portfolioId }), [daysUntilFire, views, portfolioId])
  const selectedId = selection?.kind === 'fire' ? selection.id : null
  const compact = map.getZoom() < COMPACT_BELOW_ZOOM

  const sides = useMemo(() => {
    void tick
    const ordered = [...fires].sort((a, b) => (a.id === selectedId ? -1 : b.id === selectedId ? 1 : b.lossPoint - a.lossPoint))
    const items = ordered.map((f) => {
      const text = compact && f.id !== selectedId ? f.id : fireLabel(f)
      // The open fire's label would sit on its own perimeter; the drawer header carries it instead.
      return { id: f.id, point: map.latLngToContainerPoint(fireCenter(f)), size: FLAME_PX[f.intensity.class] + 8, width: labelWidth(text), height: 24, skip: f.id === selectedId }
    })
    // Watchlist rings are obstacles too, so labels do not sit on them.
    const rings = views.watchlist
      ? watchlistInBook(portfolioId).map((w) => {
          const p = map.latLngToContainerPoint(w.center)
          return { x0: p.x - 18, y0: p.y - 18, x1: p.x + 18, y1: p.y + 18 }
        })
      : []
    return placeLabels(items, [...panelKeepOut(drawerOpen), ...rings])
  }, [fires, map, tick, compact, selectedId, drawerOpen, views.watchlist, portfolioId])

  const onSelect = useCallback((id) => select('fire', id), [select])

  return fires.map((f) => {
    const neg = store.negotiationByFire.get(f.id)
    return (
      <FireMarker
        key={f.id}
        fire={f}
        position={fireCenter(f)}
        label={fireLabel(f)}
        shortLabel={f.id}
        compact={compact && f.id !== selectedId}
        side={sides.get(f.id) || 'hidden'}
        selected={f.id === selectedId}
        rag={views.intervention && neg ? stageRag(neg.stage) : null}
        pane={pane}
        onSelect={onSelect}
      />
    )
  })
}
