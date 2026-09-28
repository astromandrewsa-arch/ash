import { useMemo } from 'react'
import L from 'leaflet'
import { CircleMarker, Marker, Polygon, Polyline, Tooltip } from 'react-leaflet'
import useSpread from '../../state/useSpread.js'
import { palette } from '../../styles/palette.js'

function styles() {
  const c = palette()
  return {
    current: { color: c.red, weight: 2.5, opacity: 1, fillColor: c.red, fillOpacity: 0.3 },
    earlier: { color: c.red, weight: 1, opacity: 0.45, fillColor: c.red, fillOpacity: 0.06 },
    block: { color: c.orange, weight: 3, opacity: 1, fill: false, dashArray: '8 5' },
    road: { color: c.road, weight: 4, opacity: 0.95, lineCap: 'round' },
    river: { color: c.river, weight: 4, opacity: 0.95, lineCap: 'round' },
  }
}

// The block label hangs off the block's upwind corner, away from the fire's run.
function upwindCorner(fire) {
  const rad = (fire.intensity.windFromDeg * Math.PI) / 180
  const toward = [Math.cos(rad), Math.sin(rad)] // [north, east] components of the upwind direction
  return fire.block.polygon.reduce((best, p) =>
    p[0] * toward[0] + p[1] * toward[1] > best[0] * toward[0] + best[1] * toward[1] ? p : best,
  )
}

function blockLabelIcon(fire, corner) {
  const centreLat = fire.block.polygon.reduce((s, p) => s + p[0], 0) / fire.block.polygon.length
  const side = corner[0] < centreLat ? 'below' : 'above'
  return L.divIcon({ className: 'block-label-icon', html: `<div class="block-label is-${side}">${fire.block.label}</div>`, iconSize: [0, 0] })
}

// Barrier names sit most of the way along each line: on screen, but clear of the block label.
function labelPoint(line) {
  if (line.length > 3) return line[Math.floor(line.length * 0.7)]
  const a = line[Math.floor(line.length / 2)]
  const b = line.at(-1)
  return [a[0] + (b[0] - a[0]) * 0.8, a[1] + (b[1] - a[1]) * 0.8]
}

/** Ignition block, barrier lines and the spread perimeters revealed so far for the selected fire. */
export default function SelectedFireLayer() {
  const { fire, step } = useSpread()
  const s = useMemo(styles, [])
  const corner = useMemo(() => (fire ? upwindCorner(fire) : null), [fire])
  const icon = useMemo(() => (fire ? blockLabelIcon(fire, corner) : null), [fire, corner])
  if (!fire) return null

  const shown = fire.spread.steps.slice(0, step + 1)

  return (
    <>
      {fire.spread.barriers.map((b) => (
        <Polyline key={b.name} positions={b.line} pathOptions={b.type === 'river' ? s.river : s.road} interactive={false} />
      ))}
      {fire.spread.barriers.map((b) => (
        <CircleMarker key={`${b.name}-label`} center={labelPoint(b.line)} radius={0} interactive={false}>
          <Tooltip permanent direction="right" offset={[4, 0]} opacity={1} pane="tooltipPane" className={`barrier-label barrier-${b.type}`}>
            {b.name}
          </Tooltip>
        </CircleMarker>
      ))}
      {shown.map((p, i) => (
        <Polygon key={p.index} positions={p.polygon} pathOptions={i === shown.length - 1 ? s.current : s.earlier} interactive={false} />
      ))}
      <Polygon positions={fire.block.polygon} pathOptions={s.block} interactive={false} />
      <Marker position={corner} icon={icon} interactive={false} keyboard={false} zIndexOffset={-100} />
    </>
  )
}
