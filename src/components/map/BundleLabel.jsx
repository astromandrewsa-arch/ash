import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const BUNDLE_LABEL_H = 26

/** A bundle's name and rate gap on the map; click opens the bundle card. */
export default function BundleLabel({ bundle, position, text, full, compact, short, width, pane, onSelect }) {
  const icon = useMemo(() => {
    const name = compact ? '' : `<strong>${esc(bundle.name)}</strong>`
    const html = `<div class="bundle-label ${short ? 'is-short' : 'is-long'}${compact ? ' is-compact' : ''}" style="width:${width}px"><i></i>${name}<span>${esc(text)}</span></div>`
    return L.divIcon({ html, className: 'bundle-label-icon', iconSize: [width, BUNDLE_LABEL_H], iconAnchor: [width / 2, BUNDLE_LABEL_H / 2] })
  }, [bundle.name, text, compact, short, width])
  const handlers = useMemo(() => ({ click: () => onSelect(bundle.id) }), [onSelect, bundle.id])
  return <Marker pane={pane} position={position} icon={icon} title={`${bundle.name}: ${full}`} alt={`${bundle.name}: ${full}`} eventHandlers={handlers} keyboard />
}
