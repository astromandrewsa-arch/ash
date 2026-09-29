import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { store } from '../../lib/store.js'
import { bundlesInBook } from '../../lib/premium.js'
import { discRadius, gapOf, isShort } from '../../lib/rateGap.js'
import { traceDiscUnionOutline } from '../../lib/discUnion.js'
import { MAP } from '../../config/map.js'
import { palette, rgb } from '../../styles/palette.js'
import useApp from '../../state/useApp.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2

const ringPath = (ctx, view, ring) =>
  ring.forEach(([lat, lng], i) => (i ? ctx.lineTo(view.px(lng), view.py(lat)) : ctx.moveTo(view.px(lng), view.py(lat))))

function paint(ctx, view, { groups, max, mode }) {
  const c = palette()
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1.5
  for (const { bundle, areas } of groups) {
    const [r, g, b] = rgb(isShort(bundle, mode) ? c.orange : c.blue)
    const k = Math.min(1, Math.abs(gapOf(bundle, mode)) / max)
    const fill = 0.24 + 0.36 * k
    const polys = areas.filter((a) => a.type === 'rangeland' || view.zoom >= MAP.dotsMinZoom)
    const discs = areas
      .filter((a) => a.type !== 'rangeland' && view.zoom < MAP.dotsMinZoom)
      .map((a) => ({ x: view.px(a.centroid[1]), y: view.py(a.centroid[0]), r: discRadius(a.homes) }))
    // One path per bundle, filled once, so overlapping areas do not stack their alpha.
    ctx.beginPath()
    for (const a of polys) {
      ringPath(ctx, view, a.polygon)
      ctx.closePath()
    }
    for (const d of discs) {
      ctx.moveTo(d.x + d.r, d.y)
      ctx.arc(d.x, d.y, d.r, 0, TAU)
    }
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fill})`
    ctx.fill('nonzero')
    // Homes polygons are small beside their dots at zoom 9–12: a wide soft rim keeps the shade readable.
    const homesPolys = polys.filter((a) => a.type === 'homes')
    if (homesPolys.length) {
      ctx.beginPath()
      for (const a of homesPolys) {
        ringPath(ctx, view, a.polygon)
        ctx.closePath()
      }
      ctx.lineWidth = Math.max(8, 20 - (view.zoom - MAP.dotsMinZoom) * 3)
      // The rim is all that shows beside the homes, so it runs stronger than the fill.
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + 0.35 * k})`
      ctx.stroke()
      ctx.lineWidth = 1.5
    }
    // Crisp rims: rangeland outlines, and only the outer edge where discs merge.
    ctx.beginPath()
    for (const a of polys) {
      if (a.type !== 'rangeland') continue
      ringPath(ctx, view, a.polygon)
      ctx.closePath()
    }
    traceDiscUnionOutline(ctx, discs)
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, fill + 0.4)})`
    ctx.stroke()
  }
}

/** Rate gap Quick View (§9, §15): each bundle's priced areas shaded by rate adequacy, or by the 2027 filing gap. */
export default function RateGapLayer() {
  const map = useMap()
  const { portfolioId, views } = useApp()
  const pane = useMapPane('rateGapPane', 360)
  const layer = useRef(null)
  const mode = views.rateGap2027 ? '2027' : 'now'
  const state = useMemo(() => {
    const bundles = bundlesInBook(portfolioId)
    const groups = bundles.map((bundle) => ({ bundle, areas: bundle.insuredAreaIds.map((id) => store.areaById.get(id)).filter(Boolean) }))
    const max = Math.max(...bundles.map((b) => Math.abs(gapOf(b, mode))), 0.01)
    return { groups, max, mode }
  }, [portfolioId, mode])
  const data = useRef(state)

  useLayoutEffect(() => {
    data.current = state
    layer.current?.redraw()
  }, [state])

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
