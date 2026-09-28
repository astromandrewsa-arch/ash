import { memo, useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { presetById } from '../../lib/data.js'
import { dayMonth, dateRange } from '../../lib/dates.js'
import { formatPct } from '../../lib/format.js'

const PIN = 18
// Zoomed out, the pin sits up and to the right of the area's home cluster so both stay readable.
const FAR_OFFSET = 18

function FireMarker({ fire, side, far, ring, preset, selected, onOpen }) {
  const icon = useMemo(() => {
    const presetLabel = presetById[preset].label
    const html = `
      <div class="fire-pin${ring ? ` has-ring rag-${fire.intervention.rag}` : ''}${selected ? ' is-selected' : ''}" title="${fire.id} · ${presetLabel}">
        <span class="fire-pin-pulse"></span><span class="fire-pin-dot"></span>
      </div>
      ${selected ? '' : `<div class="fire-label side-${side}${far ? ' is-compact' : ''}">
        <div class="fire-label-top"><strong>${fire.id}</strong><span>${dayMonth(fire.predictedDate)}</span></div>
        <div class="fire-label-meta">${dateRange(fire.window.start, fire.window.end)} · ${formatPct(fire.probability)} · ${fire.exposure.homesEngulfed} homes</div>
      </div>`}`
    const half = PIN / 2
    return L.divIcon({
      className: 'fire-marker',
      html,
      iconSize: [PIN, PIN],
      iconAnchor: far ? [half - FAR_OFFSET, half + FAR_OFFSET] : [half, half],
    })
  }, [fire, side, far, ring, preset, selected])

  const handlers = useMemo(() => ({ click: () => onOpen(fire.id) }), [fire.id, onOpen])

  return <Marker position={fire.ignition} icon={icon} eventHandlers={handlers} zIndexOffset={selected ? 1000 : 500} />
}

export default memo(FireMarker)
