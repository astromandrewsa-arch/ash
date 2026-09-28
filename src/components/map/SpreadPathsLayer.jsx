import { useMemo } from 'react'
import { Polygon } from 'react-leaflet'
import { visibleFires } from '../../lib/data.js'
import useApp from '../../state/useApp.js'
import { palette } from '../../styles/palette.js'

/** Portfolio view: the final predicted perimeter of each revealed fire, drawn faintly. */
export default function SpreadPathsLayer() {
  const { daysUntilFire, selection } = useApp()
  const style = useMemo(() => {
    const c = palette()
    return { color: c.red, weight: 1.5, dashArray: '5 5', fillColor: c.red, fillOpacity: 0.1 }
  }, [])
  return visibleFires(daysUntilFire)
    .filter((f) => f.id !== selection?.fireId)
    .map((f) => <Polygon key={f.id} positions={f.spread.steps.at(-1).polygon} pathOptions={style} interactive={false} />)
}
