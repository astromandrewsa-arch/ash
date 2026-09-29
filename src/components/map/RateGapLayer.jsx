import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { store } from '../../lib/store.js'
import { inBook } from '../../lib/selectors.js'
import { MAP } from '../../config/map.js'
import { palette, rgb } from '../../styles/palette.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2

/** Under-priced bundles shade orange, over-priced blue, stronger with the size of the gap. */
function shadeOf(bundle) {
  const c = palette()
  const [r, g, b] = rgb(bundle.adequacy < 0 ? c.orange : c.blue)
  const k = Math.min(1, Math.abs(bundle.adequacy) / 0.28)
  return { r, g, b, a: 0.36 + 0.44 * k }
}

function paint(ctx, view, areas) {
  for (const a of areas) {
    const bundle = store.bundleById.get(a.bundleId)
    if (!bundle) continue
    const { r, g, b, a: al } = shadeOf(bundle)
    if (a.type === 'rangeland' || view.zoom >= 10) {
      ctx.beginPath()
      a.polygon.forEach(([lat, lng], i) => (i ? ctx.lineTo(view.px(lng), view.py(lat)) : ctx.moveTo(view.px(lng), view.py(lat))))
      ctx.closePath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${al * 0.75})`
      ctx.fill()
      if (a.type === 'rangeland') continue
    }
    // Homes areas get a soft halo so the shading reads at state scale.
    const x = view.px(a.centroid[1])
    const y = view.py(a.centroid[0])
    const rad = Math.max(30, Math.min(110, (view.px(a.centroid[1] + 0.03) - x) * 1.8))
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${al})`)
    grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${al * 0.55})`)
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, rad, 0, TAU)
    ctx.fill()
  }
}

/** Rate gap Quick View (§9, §15): bundle shading by PRIMER technical rate against the market rate. */
export default function RateGapLayer() {
  const map = useMap()
  const { portfolioId } = useApp()
  const pane = useMapPane('rateGapPane', 360)
  const layer = useRef(null)
  const areas = useMemo(() => store.areas.filter((a) => a.type !== 'utility' && inBook(a.state, portfolioId)), [portfolioId])
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
