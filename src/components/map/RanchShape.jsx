import { useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import { store } from '../../lib/store.js'
import { formatNumber } from '../../lib/format.js'
import { palette } from '../../styles/palette.js'

// The hatch is a presentation attribute, not CSS: a url(#id) inside an external stylesheet would
// resolve against the stylesheet's URL and miss the pattern.
export default function RanchShape({ area, renderer, pane, selected, onSelect, children }) {
  const c = palette()
  const ranch = store.ranchById.get(area.ranchId)
  const handlers = useMemo(() => ({ click: () => onSelect(area.ranchId) }), [onSelect, area.ranchId])
  return (
    <>
      <Polygon
        pane={pane}
        renderer={renderer}
        positions={area.polygon}
        bubblingMouseEvents={false}
        pathOptions={{ className: 'ranch-shape', color: c.yellow, weight: selected ? 2.4 : 1.4, opacity: selected ? 1 : 0.8, dashArray: '6 4', fillColor: 'url(#ranch-hatch)', fillOpacity: 1 }}
        eventHandlers={handlers}
      >
        <Tooltip className="map-tooltip" sticky direction="top" offset={[0, -8]}>
          <strong>{ranch.name}</strong>
          <span>
            {formatNumber(ranch.acres)} ac · {formatNumber(ranch.cattle + (ranch.bison || 0))} head
          </span>
        </Tooltip>
      </Polygon>
      {children}
    </>
  )
}
