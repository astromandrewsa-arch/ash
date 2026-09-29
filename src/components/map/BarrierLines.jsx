import { Polyline } from 'react-leaflet'
import { palette } from '../../styles/palette.js'

/** Barriers from the fire's recipe (§7): water in blue, highways in grey, escarpments and fields hatched. */
export default function BarrierLines({ fire, pane }) {
  const c = palette()
  const style = (b) => {
    if (b.kind === 'lake' || b.kind === 'river') return { color: c.water, weight: b.effect === 'partial' ? 2 : 2.6, opacity: 0.95, dashArray: b.effect === 'partial' ? '10 5' : null }
    if (b.kind === 'highway') return { color: c.road, weight: 2.4, opacity: 0.9, dashArray: '7 5' }
    if (b.kind === 'island' || b.kind === 'patch') return { color: '#8C8F94', weight: 1.4, opacity: 0.9, fill: true, fillColor: '#2A2A2B', fillOpacity: 0.55 }
    return { color: '#C9CBD0', weight: 4, opacity: 0.85, dashArray: '2 6', lineCap: 'butt' }
  }
  return fire.barriers.map((b, i) => <Polyline key={`${b.kind}-${i}`} pane={pane} interactive={false} positions={b.geometry} pathOptions={style(b)} />)
}
