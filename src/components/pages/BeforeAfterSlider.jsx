import { useCallback, useMemo, useRef, useState } from 'react'
import { ChevronsLeftRight } from 'lucide-react'
import { historicalFires } from '../../lib/data.js'
import { fullDate } from '../../lib/dates.js'
import { formatHa } from '../../lib/format.js'
import { palette } from '../../styles/palette.js'
import BeforeAfterMap from './BeforeAfterMap.jsx'

const featured = historicalFires.find((h) => h.beforeAfter)

/** The same parcel before and after the burn; drag the divider to compare. Predicted perimeter on both. */
export default function BeforeAfterSlider() {
  const ba = featured.beforeAfter
  const [pos, setPos] = useState(50)
  const frame = useRef(null)
  const c = palette()
  const styles = useMemo(
    () => ({
      predicted: { color: c.orange, weight: 3, dashArray: '8 6', fill: false },
      scar: { color: '#0B0B0B', weight: 1, fillColor: '#101010', fillOpacity: 0.72 },
    }),
    [c],
  )

  const moveTo = useCallback((clientX) => {
    const r = frame.current.getBoundingClientRect()
    setPos(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)))
  }, [])

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    moveTo(e.clientX)
  }
  const onPointerMove = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX)
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(2, p - 4))
    if (e.key === 'ArrowRight') setPos((p) => Math.min(98, p + 4))
  }

  return (
    <article className="card chart-card">
      <header className="card-head">
        <h2>
          {featured.id} · {featured.place}, {featured.county}
        </h2>
        <span>
          Declined intervention; burned {fullDate(featured.burnedOn)}. PRIMER's predicted perimeter matched {ba.overlapPct}% of the{' '}
          {formatHa(ba.burnScarHectares)} scar.
        </span>
      </header>
      <div className="ba-frame" ref={frame}>
        <BeforeAfterMap ba={ba} styles={styles} attribution />
        <div className="ba-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <BeforeAfterMap ba={ba} styles={styles} after />
        </div>
        <span className="ba-tag is-before">Before · {fullDate(ba.beforeDate)}</span>
        <span className="ba-tag is-after">After · {fullDate(ba.afterDate)}</span>
        <div
          className="ba-divider"
          style={{ left: `${pos}%` }}
          role="slider"
          tabIndex={0}
          aria-label="Before and after divider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={onKeyDown}
        >
          <span className="ba-handle">
            <ChevronsLeftRight size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="ba-legend">
        <span>
          <i className="ba-key is-predicted" aria-hidden="true" /> PRIMER predicted perimeter
        </span>
        <span>
          <i className="ba-key is-scar" aria-hidden="true" /> Observed burn scar
        </span>
      </div>
    </article>
  )
}
