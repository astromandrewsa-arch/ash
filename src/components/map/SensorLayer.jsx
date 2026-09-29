import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { store } from '../../lib/store.js'
import { inBook } from '../../lib/selectors.js'
import { MAP } from '../../config/map.js'
import { palette } from '../../styles/palette.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2

function paint(ctx, view, areas) {
  const r = view.zoom >= 12 ? 4.5 : view.zoom >= 9 ? 3.5 : 2.4
  ctx.beginPath()
  for (const a of areas) {
    for (const s of a.sensors) {
      const x = view.px(s.pos[1])
      const y = view.py(s.pos[0])
      if (x < -10 || y < -10 || x > view.width + 10 || y > view.height + 10) continue
      ctx.moveTo(x + r, y)
      ctx.arc(x, y, r, 0, TAU)
    }
  }
  ctx.fillStyle = palette().sensor
  ctx.fill()
  ctx.lineWidth = r > 3 ? 1.4 : 1
  ctx.strokeStyle = 'rgba(243, 241, 236, 0.9)'
  ctx.stroke()
}

/** PRIMER sensor sites (§9): 6–10 grey dots per area. */
export default function SensorLayer() {
  const map = useMap()
  const { portfolioId } = useApp()
  const pane = useMapPane('sensorPane', 440)
  const layer = useRef(null)
  const areas = useMemo(() => store.areas.filter((a) => inBook(a.state, portfolioId)), [portfolioId])
  const data = useRef(areas)

  useLayoutEffect(() => {
    data.current = areas
    layer.current?.redraw()
  }, [areas])

  useEffect(() => {
    const l = new CanvasOverlay((ctx, view) => paint(ctx, view, data.current), { pane, pad: MAP.viewportPad })
    l.addTo(map)
    layer.current = l
    return () => {
      l.remove()
      layer.current = null
    }
  }, [map, pane])

  return null
}
