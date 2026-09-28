import { useMemo } from 'react'
import { Polygon } from 'react-leaflet'
import { areas } from '../../lib/data.js'
import { palette } from '../../styles/palette.js'

export default function CoverageLayer() {
  const style = useMemo(() => {
    const c = palette()
    return { color: c.yellow, weight: 2, opacity: 0.9, fillColor: c.yellow, fillOpacity: 0.12 }
  }, [])

  return areas.map((area) => <Polygon key={area.id} positions={area.polygon} pathOptions={style} interactive={false} />)
}
