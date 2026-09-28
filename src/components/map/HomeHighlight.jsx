import { useMemo } from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { homeById } from '../../lib/data.js'
import { palette } from '../../styles/palette.js'
import HomeTooltip from './HomeTooltip.jsx'

/** Ring and pinned card for a home found through search. */
export default function HomeHighlight({ homeId }) {
  const home = homeById.get(homeId)
  const style = useMemo(() => ({ color: palette().orange, weight: 3, fill: false }), [])
  if (!home) return null
  return (
    <CircleMarker center={home.centroid} radius={16} pathOptions={style} interactive={false}>
      <Tooltip permanent direction="top" offset={[0, -14]} opacity={1} pane="tooltipPane" className="home-tooltip">
        <HomeTooltip home={home} />
      </Tooltip>
    </CircleMarker>
  )
}
