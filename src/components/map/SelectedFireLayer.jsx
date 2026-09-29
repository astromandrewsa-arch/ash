import { Fragment } from 'react'
import { CircleMarker, Polygon } from 'react-leaflet'
import useApp from '../../state/useApp.js'
import useSpread from '../../state/useSpread.js'
import useMapPane from '../../hooks/useMapPane.js'
import { bandColor, hourColor } from '../../lib/severity.js'
import { palette } from '../../styles/palette.js'
import BarrierLines from './BarrierLines.jsx'

/** The selected fire: ignition zone, barriers, and its perimeters up to the current spread step. */
export default function SelectedFireLayer() {
  const { views } = useApp()
  const { fire, step } = useSpread()
  const pane = useMapPane('spreadPane', 400)
  if (!fire) return null
  const c = palette()
  const cur = step >= 0 ? fire.steps[step] : null
  return (
    <>
      {views.barriers && <BarrierLines fire={fire} pane={pane} />}
      {cur && views.probability &&
        ['p25', 'p50', 'p90'].map((band) => (
          <Polygon key={band} pane={pane} interactive={false} positions={cur[band].map((poly) => poly)} pathOptions={{ stroke: false, fillColor: bandColor(band), fillOpacity: 0.35 }} />
        ))}
      {cur && views.isochrones &&
        fire.steps.slice(0, step).map((s, i) =>
          s.held && i > 0 ? null : (
            <Polygon key={s.hour} pane={pane} interactive={false} positions={s.p50} pathOptions={{ color: hourColor(s.hour), weight: 1.4, opacity: 0.75, fill: false }} />
          ),
        )}
      {cur && (
        <Fragment key={`cur-${step}`}>
          <Polygon
            pane={pane}
            interactive={false}
            positions={cur.p50}
            pathOptions={{ color: views.isochrones ? hourColor(cur.hour) : c.red, weight: 2.2, opacity: 1, fillColor: hourColor(cur.hour), fillOpacity: views.isochrones ? 0.45 : 0.3 }}
          />
        </Fragment>
      )}
      <Polygon pane={pane} interactive={false} positions={fire.ignitionZone.polygon} pathOptions={{ color: c.orange, weight: 2.2, dashArray: '6 5', fillColor: c.orange, fillOpacity: 0.1 }} />
      {fire.ignitionZone.ignitions?.map((ig) => (
        <CircleMarker key={`${ig.pos[0]},${ig.pos[1]}`} pane={pane} interactive={false} center={ig.pos} radius={4.5} pathOptions={{ color: '#1C1C1C', weight: 1.5, fillColor: '#FFE8B0', fillOpacity: 1 }} />
      ))}
    </>
  )
}
