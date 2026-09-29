import { useEffect, useRef } from 'react'
import useApp from '../../state/useApp.js'
import SegToggle from '../common/SegToggle.jsx'

const RATE_MODES = [
  { id: 'now', label: 'Today' },
  { id: '2027', label: '2027' },
]

/** Keys for the status overlays that are switched on; the Rate gap key carries the 2027 toggle. */
export default function ViewLegend({ views }) {
  const { setView } = useApp()
  const ref = useRef(null)
  const on = [views.intervention, views.rateGap, views.sensors].filter(Boolean).length

  // Turning a status view on scrolls its key into sight in the Quick Views panel.
  useEffect(() => {
    if (on) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [on, views.intervention, views.rateGap, views.rateGap2027, views.sensors])

  if (!on) return null
  return (
    <div className="view-legend" ref={ref}>
      {views.intervention && (
        <div className="view-legend-row">
          <span className="label">Fires</span>
          <span><i className="dot dot-green" />Work agreed</span>
          <span><i className="dot dot-amber" />In negotiation</span>
          <span><i className="dot dot-red" />Not engaged</span>
        </div>
      )}
      {views.intervention && (
        <div className="view-legend-row">
          <span className="label">Homes</span>
          <span><i className="ring ring-green" />Protected</span>
          <span><i className="ring ring-amber" />Warned</span>
        </div>
      )}
      {views.rateGap && (
        <div className="view-legend-row">
          <div className="vl-head">
            <span className="label">{views.rateGap2027 ? '2027 vs filed' : 'Rate gap'}</span>
            <SegToggle className="vl-seg" label="Rate gap view" options={RATE_MODES} value={views.rateGap2027 ? '2027' : 'now'} onChange={(id) => setView('rateGap2027', id === '2027')} />
          </div>
          {views.rateGap2027 ? (
            <>
              <span><i className="dot dot-orange" />Filed below PRIMER</span>
              <span><i className="dot dot-blue" />Filed above PRIMER</span>
            </>
          ) : (
            <>
              <span><i className="dot dot-orange" />Under-priced</span>
              <span><i className="dot dot-blue" />Over-priced</span>
            </>
          )}
        </div>
      )}
      {views.sensors && (
        <div className="view-legend-row">
          <span className="label">Sensors</span>
          <span><i className="dot dot-sensor" />Live and dead fuel moisture sites</span>
        </div>
      )}
    </div>
  )
}
