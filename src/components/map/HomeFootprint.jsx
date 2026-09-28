import { memo, useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import { palette } from '../../styles/palette.js'
import HomeTooltip from './HomeTooltip.jsx'

let styles = null
function footprintStyles() {
  if (!styles) {
    const c = palette()
    // A 2 px stroke keeps each home visible as a dot at town zoom, before it resolves to a building.
    styles = {
      home: { color: c.yellow, weight: 2, opacity: 1, fillColor: c.yellow, fillOpacity: 0.95 },
      burning: { color: c.red, weight: 2, opacity: 1, fillColor: c.red, fillOpacity: 0.95 },
    }
  }
  return styles
}

function HomeFootprint({ home, burning, hovered, onHover }) {
  const handlers = useMemo(
    () => ({
      mouseover: () => onHover(home.id),
      mouseout: () => onHover(null),
    }),
    [home, onHover],
  )
  const s = footprintStyles()
  return (
    <Polygon
      positions={home.footprint}
      pathOptions={burning ? s.burning : s.home}
      smoothFactor={0}
      eventHandlers={handlers}
      bubblingMouseEvents={false}
    >
      {hovered && (
        <Tooltip permanent direction="top" offset={[0, -6]} opacity={1} pane="tooltipPane" className="home-tooltip">
          <HomeTooltip home={home} />
        </Tooltip>
      )}
    </Polygon>
  )
}

export default memo(HomeFootprint)
