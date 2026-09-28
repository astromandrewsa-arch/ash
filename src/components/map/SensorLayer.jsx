import { useMemo } from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { sensors } from '../../lib/data.js'
import { palette } from '../../styles/palette.js'

export default function SensorLayer() {
  const style = useMemo(() => {
    const c = palette()
    return { color: '#FFFFFF', weight: 1.5, fillColor: c.sensor, fillOpacity: 1 }
  }, [])
  return sensors.map((s) => (
    <CircleMarker key={s.id} center={s.position} radius={4.5} pathOptions={style}>
      <Tooltip direction="top" offset={[0, -4]} opacity={1} pane="tooltipPane" className="sensor-tooltip">
        <strong>{s.id}</strong> · {s.type} · installed {s.installed}
      </Tooltip>
    </CircleMarker>
  ))
}
