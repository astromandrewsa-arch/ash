import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { paintSpreadFills, paintSpreadLines, paintSpreadTop } from '../../lib/spreadPaint.js'
import { UI } from '../../config/ui.js'
import { mapPadding } from '../../lib/mapPadding.js'
import useApp from '../../state/useApp.js'
import useSpread from '../../state/useSpread.js'
import useMapPane from '../../hooks/useMapPane.js'
import AssetBurnLayer from './AssetBurnLayer.jsx'
import SpreadCamera from './SpreadCamera.jsx'

/**
 * The selected fire on three canvases: fills under the homes (ignition heat, burn-probability
 * bands, isochrone fills), lines over the homes (isochrones, perimeter, barriers, zone) so homes
 * never hide the perimeter, and the wind arrow and label above the utilities and icons.
 * A new perimeter fades in over 600 ms (§3 motion).
 */
export default function SelectedFireLayer() {
  const map = useMap()
  const { views, drawerOpen } = useApp()
  const { fire, step } = useSpread()
  const pane = useMapPane('spreadPane', 400)
  const linePane = useMapPane('spreadLinePane', 428)
  const topPane = useMapPane('spreadTopPane', 612)
  const layers = useRef([])
  const st = useRef({ fire: null, step: -1, views, fade: 1 })
  const raf = useRef(0)

  useEffect(() => {
    const ls = [
      new CanvasOverlay((ctx, view) => paintSpreadFills(ctx, view, st.current), { pane, pad: 0.25 }),
      new CanvasOverlay((ctx, view) => paintSpreadLines(ctx, view, st.current), { pane: linePane, pad: 0.25 }),
      new CanvasOverlay((ctx, view) => paintSpreadTop(ctx, view, st.current), { pane: topPane, pad: 0.1 }),
    ]
    for (const l of ls) l.addTo(map)
    layers.current = ls
    return () => {
      for (const l of ls) l.remove()
      layers.current = []
    }
  }, [map, pane, linePane, topPane])

  useLayoutEffect(() => {
    const grew = fire !== null && st.current.fire === fire && step > st.current.step
    // The free map area (outside the floating panels and the drawer), for placing the wind arrow.
    const pad = mapPadding(drawerOpen)
    const size = map.getSize()
    const free = [pad.paddingTopLeft[0], pad.paddingTopLeft[1], size.x - pad.paddingBottomRight[0], size.y - pad.paddingBottomRight[1]]
    Object.assign(st.current, { fire, step, views, free })
    cancelAnimationFrame(raf.current)
    if (!grew) {
      st.current.fade = 1
      for (const l of layers.current) l.redraw()
      return undefined
    }
    const t0 = performance.now()
    const tick = () => {
      const f = Math.min(1, (performance.now() - t0) / UI.perimeterMs)
      st.current.fade = 1 - (1 - f) ** 2
      for (const l of layers.current) l.redraw()
      if (f < 1) raf.current = requestAnimationFrame(tick)
    }
    st.current.fade = 0
    tick()
    return () => cancelAnimationFrame(raf.current)
  }, [fire, step, views, drawerOpen, map])

  return (
    <>
      <AssetBurnLayer />
      <SpreadCamera />
    </>
  )
}
