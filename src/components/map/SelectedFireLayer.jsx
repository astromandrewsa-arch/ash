import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { paintSpread } from '../../lib/spreadPaint.js'
import { UI } from '../../config/ui.js'
import useApp from '../../state/useApp.js'
import useSpread from '../../state/useSpread.js'
import useMapPane from '../../hooks/useMapPane.js'
import AssetBurnLayer from './AssetBurnLayer.jsx'
import SpreadCamera from './SpreadCamera.jsx'

/**
 * The selected fire on one canvas: ignition heat and zone, barriers, burn-probability bands and
 * isochrones up to the current step. A new perimeter fades in over 600 ms (§3 motion).
 */
export default function SelectedFireLayer() {
  const map = useMap()
  const { views } = useApp()
  const { fire, step } = useSpread()
  const pane = useMapPane('spreadPane', 400)
  const layer = useRef(null)
  const st = useRef({ fire: null, step: -1, views, fade: 1 })
  const raf = useRef(0)

  useEffect(() => {
    const l = new CanvasOverlay((ctx, view) => paintSpread(ctx, view, st.current), { pane, pad: 0.25 })
    l.addTo(map)
    layer.current = l
    return () => {
      l.remove()
      layer.current = null
    }
  }, [map, pane])

  useLayoutEffect(() => {
    const grew = fire !== null && st.current.fire === fire && step > st.current.step
    Object.assign(st.current, { fire, step, views })
    cancelAnimationFrame(raf.current)
    if (!grew) {
      st.current.fade = 1
      layer.current?.redraw()
      return undefined
    }
    const t0 = performance.now()
    const tick = () => {
      const f = Math.min(1, (performance.now() - t0) / UI.perimeterMs)
      st.current.fade = 1 - (1 - f) ** 2
      layer.current?.redraw()
      if (f < 1) raf.current = requestAnimationFrame(tick)
    }
    st.current.fade = 0
    tick()
    return () => cancelAnimationFrame(raf.current)
  }, [fire, step, views])

  return (
    <>
      <AssetBurnLayer />
      <SpreadCamera />
    </>
  )
}
