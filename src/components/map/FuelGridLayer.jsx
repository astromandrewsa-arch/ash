import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { store } from '../../lib/store.js'
import { areaInBook } from '../../lib/selectors.js'
import { fuelRgb, fuelValue, fuelVariant } from '../../lib/fuel.js'
import { MAP } from '../../config/map.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2

function paint(ctx, view, st) {
  const variant = st.variant
  if (!variant) return
  const b = view.bounds
  for (const g of st.grids) {
    const n = g.origin[0]
    const w = g.origin[1]
    const s = n - g.rows * g.dLat
    const e = w + g.cols * g.dLng
    if (n < b.getSouth() || s > b.getNorth() || e < b.getWest() || w > b.getEast()) continue
    const values = g[variant.id]
    const cellPx = view.px(w + g.dLng) - view.px(w)
    const extentPx = view.px(e) - view.px(w)
    if (extentPx < 16) {
      // Too small to read as squares: a soft halo in the area's mean colour, wider than the
      // cluster dot drawn on top of it.
      let sum = 0
      for (const v of values) sum += v
      const [r, gg, bb] = fuelRgb(variant, fuelValue(variant, sum / values.length))
      const x = view.px((w + e) / 2)
      const y = view.py((n + s) / 2)
      const rad = 18
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rad)
      grad.addColorStop(0, `rgba(${r}, ${gg}, ${bb}, 0.95)`)
      grad.addColorStop(0.7, `rgba(${r}, ${gg}, ${bb}, 0.75)`)
      grad.addColorStop(1, `rgba(${r}, ${gg}, ${bb}, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, TAU)
      ctx.fill()
      continue
    }
    const gap = cellPx > 6 ? 0.6 : 0
    const minSide = Math.max(1, cellPx)
    for (let k = 0, i = 0; k < g.cells.length; k += 2, i++) {
      const row = g.cells[k]
      const col = g.cells[k + 1]
      const top = n - row * g.dLat
      const left = w + col * g.dLng
      const x0 = view.px(left)
      const y0 = view.py(top)
      const x1 = view.px(left + g.dLng)
      const y1 = view.py(top - g.dLat)
      const [r, gg, bb] = fuelRgb(variant, fuelValue(variant, values[i]))
      ctx.fillStyle = `rgba(${r}, ${gg}, ${bb}, 0.72)`
      ctx.fillRect(x0 + gap, y0 + gap, Math.max(minSide, x1 - x0) - gap * 2, Math.max(minSide, y1 - y0) - gap * 2)
    }
  }
}

/** Fuel grid Quick View (§9): 200 m squares over each area, reddest near each fire's ignition zone. */
export default function FuelGridLayer() {
  const map = useMap()
  const { views, portfolioId } = useApp()
  const pane = useMapPane('fuelPane', 425)
  const layer = useRef(null)
  const st = useRef({ grids: [], variant: null })
  const grids = useMemo(() => store.fuelGrid.areas.filter((g) => areaInBook(g.areaId, portfolioId)), [portfolioId])

  useLayoutEffect(() => {
    st.current.grids = grids
    st.current.variant = views.fuel ? fuelVariant(views.fuel) : null
    layer.current?.redraw()
  }, [grids, views.fuel])

  useEffect(() => {
    if (!pane) return undefined
    const l = new CanvasOverlay((ctx, view) => paint(ctx, view, st.current), { pane, pad: MAP.viewportPad })
    l.addTo(map)
    layer.current = l
    return () => {
      l.remove()
      layer.current = null
    }
  }, [map, pane])

  return null
}
