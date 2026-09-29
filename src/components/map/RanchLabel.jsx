import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The ranch's name printed on the pasture. */
export default function RanchLabel({ area, ranch, onSelect }) {
  const icon = useMemo(() => L.divIcon({ html: `<span class="ranch-label">${esc(ranch.name)}</span>`, className: 'ranch-label-icon', iconSize: null }), [ranch.name])
  const handlers = useMemo(() => ({ click: () => onSelect(ranch.id) }), [onSelect, ranch.id])
  return <Marker position={area.centroid} icon={icon} keyboard={false} zIndexOffset={-500} eventHandlers={handlers} />
}
