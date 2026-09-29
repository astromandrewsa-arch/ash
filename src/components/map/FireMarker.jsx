import { useMemo } from 'react'
import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { flameSvg } from '../../lib/icons.js'

export const FLAME_PX = { Moderate: 16, High: 20, 'Very High': 24, Extreme: 28 }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Flame glyph sized by intensity class, pulsing glow by severity, optional RAG ring and label (§3, §9). */
export default function FireMarker({ fire, position, label, shortLabel, side, compact, selected, rag, pane, onSelect }) {
  const size = FLAME_PX[fire.intensity.class] || 20
  const box = size + 20
  const icon = useMemo(() => {
    const text = compact ? shortLabel : label
    const cls = ['fire-marker', fire.severity === 'Severe' ? 'is-severe' : 'is-nonsevere', selected ? 'is-selected' : '', rag ? `rag-${rag}` : '', `label-${side}`].filter(Boolean).join(' ')
    const html = `<div class="${cls}" style="--flame:${size}px">
      <span class="fm-glow"></span>
      ${rag ? '<span class="fm-rag"></span>' : ''}
      <span class="fm-flame">${flameSvg(size)}</span>
      <span class="fm-label"><span class="fm-label-text">${esc(text)}</span><span class="fm-label-full">${esc(label)}</span></span>
    </div>`
    return L.divIcon({ html, className: 'fire-marker-icon', iconSize: [box, box], iconAnchor: [box / 2, box / 2] })
  }, [fire.severity, size, box, label, shortLabel, compact, side, selected, rag])
  const handlers = useMemo(() => ({ click: () => onSelect(fire.id) }), [onSelect, fire.id])
  return <Marker pane={pane} position={position} icon={icon} title={label} alt={label} zIndexOffset={selected ? 1000 : fire.severity === 'Severe' ? 200 : 100} eventHandlers={handlers} />
}
