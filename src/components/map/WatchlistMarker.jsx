import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Watchlist marker (§3): a hollow amber ring with the probability inside. */
export default function WatchlistMarker({ item, pane, onSelect }) {
  const label = `Watchlist · ${item.place} · ${item.probability}% · ${item.windowDays}-day window`
  const icon = useMemo(
    () =>
      L.divIcon({
        html: `<div class="watch-marker"><span class="wm-ring">${item.probability}%</span><span class="wm-label">${esc(label)}</span></div>`,
        className: 'watch-marker-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      }),
    [item.probability, label],
  )
  const handlers = useMemo(() => ({ click: () => onSelect(item) }), [onSelect, item])
  return <Marker pane={pane} position={item.center} icon={icon} title={label} alt={label} eventHandlers={handlers} />
}
