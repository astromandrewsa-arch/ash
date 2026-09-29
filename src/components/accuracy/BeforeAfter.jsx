import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronsLeftRight } from 'lucide-react'
import { MapContainer, Polygon, TileLayer } from 'react-leaflet'
import { MAP } from '../../config/map.js'
import { palette } from '../../styles/palette.js'

const MAP_OPTS = { zoomControl: false, attributionControl: false, scrollWheelZoom: false, keyboard: false, zoomSnap: 0.25 }

/**
 * Before/after on HC-05's analogue (§16): two synchronised Leaflet maps of the same imagery, the
 * after side desaturated with the dark burn scar, PRIMER's predicted perimeter in orange over both,
 * and a draggable divider. Pan or zoom either side and the other follows.
 */
export default function BeforeAfter({ exhibit }) {
  const c = palette()
  const [pos, setPos] = useState(40)
  const frame = useRef(null)
  const before = useRef(null)
  const after = useRef(null)

  useEffect(() => {
    const A = before.current
    const B = after.current
    if (!A || !B) return undefined
    let busy = false
    const follow = (src, dst) => () => {
      if (busy) return
      busy = true
      dst.setView(src.getCenter(), src.getZoom(), { animate: false })
      busy = false
    }
    const ab = follow(A, B)
    const ba = follow(B, A)
    A.on('move', ab)
    B.on('move', ba)
    return () => {
      A.off('move', ab)
      B.off('move', ba)
    }
  }, [])

  const moveTo = useCallback((clientX) => {
    const r = frame.current.getBoundingClientRect()
    setPos(Math.min(97, Math.max(3, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const predicted = { color: c.orange, weight: 2.5, dashArray: '7 5', fill: false, interactive: false }
  const scar = { color: '#050505', weight: 1, fillColor: '#0B0B0B', fillOpacity: 0.7, interactive: false }
  const bounds = exhibit.bounds

  return (
    <div className="ba2-frame" ref={frame}>
      <MapContainer ref={before} className="ba2-map" bounds={bounds} boundsOptions={{ padding: [28, 28] }} {...MAP_OPTS}>
        <TileLayer url={MAP.imageryUrl} maxNativeZoom={MAP.maxNativeZoom} />
        <Polygon positions={exhibit.predicted} pathOptions={predicted} />
      </MapContainer>
      <div className="ba2-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <MapContainer ref={after} className="ba2-map is-after" bounds={bounds} boundsOptions={{ padding: [28, 28] }} {...MAP_OPTS}>
          <TileLayer url={MAP.imageryUrl} maxNativeZoom={MAP.maxNativeZoom} className="ba2-desat" />
          <Polygon positions={exhibit.burnScar} pathOptions={scar} />
          <Polygon positions={exhibit.predicted} pathOptions={predicted} />
        </MapContainer>
      </div>
      <span className="ba2-tag is-before">Before the fire</span>
      <span className="ba2-tag is-after">After · burn scar</span>
      <div
        className="ba2-divider"
        style={{ left: `${pos}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Before and after divider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          moveTo(e.clientX)
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && moveTo(e.clientX)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => Math.max(3, p - 4))
          if (e.key === 'ArrowRight') setPos((p) => Math.min(97, p + 4))
        }}
      >
        <span className="ba2-handle">
          <ChevronsLeftRight size={16} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}
