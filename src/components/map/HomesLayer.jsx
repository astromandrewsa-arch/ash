import { useCallback, useState } from 'react'
import { homes, mapConfig, pathByHome } from '../../lib/data.js'
import useApp from '../../state/useApp.js'
import useSpread from '../../state/useSpread.js'
import useZoom from '../../hooks/useZoom.js'
import HomeFootprint from './HomeFootprint.jsx'
import HomeClusters from './HomeClusters.jsx'
import HomeHighlight from './HomeHighlight.jsx'

export default function HomesLayer() {
  const zoom = useZoom()
  const { highlightHomeId } = useApp()
  const { fire, step } = useSpread()
  const [hoveredId, setHoveredId] = useState(null)
  const onHover = useCallback((id) => setHoveredId(id), [])

  if (zoom < mapConfig.homesMinZoom) return <HomeClusters />

  // A home turns red once the selected fire's perimeter has reached it.
  const isBurning = (home) => {
    if (!fire) return false
    const path = pathByHome.get(home.id)
    return path !== undefined && path.fireId === fire.id && path.step <= step
  }

  return (
    <>
      {homes.map((home) => (
        <HomeFootprint
          key={home.id}
          home={home}
          burning={isBurning(home)}
          hovered={hoveredId === home.id && highlightHomeId !== home.id}
          onHover={onHover}
        />
      ))}
      {highlightHomeId && <HomeHighlight homeId={highlightHomeId} />}
    </>
  )
}
