import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { boundsOfPolys, pointInPolys } from '../../lib/geo.js'
import { store } from '../../lib/store.js'
import { palette } from '../../styles/palette.js'
import useSpread from '../../state/useSpread.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2
const IN_P50 = new Set(['p90', 'p50'])

/** Which parts of the fire's assets sit inside the P50 perimeter at a step (computed once per step). */
function burnState(fire, stepIndex) {
  const step = fire.steps[stepIndex]
  const polys = step.p50
  const b = boundsOfPolys(polys)
  const inside = (pt) => b && b.contains(L.latLng(pt[0], pt[1])) && pointInPolys(pt, polys)
  const out = []
  for (const hit of fire.assetsInPath) {
    const asset = store.assetById.get(hit.assetId)
    if (!asset) continue
    if (asset.kind === 'line') out.push({ asset, kind: 'poles', pts: asset.poles, flags: asset.poles.map(inside) })
    else if (asset.kind === 'pipeline') out.push({ asset, kind: 'path', pts: asset.geometry, flags: asset.geometry.map(inside) })
    else if (asset.kind === 'wind') out.push({ asset, kind: 'turbines', pts: asset.turbines, flags: asset.turbines.map(inside) })
    else if (IN_P50.has(hit.band) && hit.hourReached <= step.hour) out.push({ asset, kind: 'site' })
  }
  return out
}

function paint(ctx, view, st) {
  if (!st.items.length) return
  const red = palette().red
  for (const it of st.items) {
    if (it.kind === 'site') {
      const g = it.asset.geometry
      ctx.beginPath()
      if (it.asset.kind === 'substation') ctx.arc(view.px(g[1]), view.py(g[0]), 14, 0, TAU)
      else g.forEach(([lat, lng], i) => (i ? ctx.lineTo(view.px(lng), view.py(lat)) : ctx.moveTo(view.px(lng), view.py(lat))))
      ctx.closePath()
      ctx.fillStyle = 'rgba(215, 38, 61, 0.28)'
      ctx.fill()
      ctx.strokeStyle = red
      ctx.lineWidth = 2.6
      ctx.stroke()
      continue
    }
    if (it.kind === 'turbines') {
      ctx.beginPath()
      it.pts.forEach((p, i) => {
        if (!it.flags[i]) return
        const x = view.px(p[1])
        const y = view.py(p[0])
        ctx.moveTo(x + 3, y)
        ctx.arc(x, y, 3, 0, TAU)
      })
      ctx.fillStyle = red
      ctx.fill()
      continue
    }
    // Lines and pipelines: red wherever consecutive points are both inside the perimeter.
    ctx.beginPath()
    for (let i = 1; i < it.pts.length; i++) {
      if (!it.flags[i] || !it.flags[i - 1]) continue
      ctx.moveTo(view.px(it.pts[i - 1][1]), view.py(it.pts[i - 1][0]))
      ctx.lineTo(view.px(it.pts[i][1]), view.py(it.pts[i][0]))
    }
    ctx.strokeStyle = 'rgba(12, 12, 13, 0.55)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.setLineDash(it.kind === 'path' ? [8, 6] : [])
    ctx.stroke()
    ctx.strokeStyle = '#FF3B52'
    ctx.lineWidth = 3.2
    ctx.setLineDash(it.kind === 'path' ? [8, 6] : [])
    ctx.stroke()
    ctx.setLineDash([])
    if (it.kind === 'poles' && view.zoom >= 13) {
      ctx.beginPath()
      it.pts.forEach((p, i) => {
        if (!it.flags[i]) return
        const x = view.px(p[1])
        const y = view.py(p[0])
        ctx.moveTo(x + 3, y)
        ctx.arc(x, y, 3, 0, TAU)
      })
      ctx.fillStyle = '#FF5A6E'
      ctx.fill()
    }
  }
}

/** Assets turn red where the P50 perimeter has reached them at the current step (§10). */
export default function AssetBurnLayer() {
  const map = useMap()
  const { fire, step } = useSpread()
  const pane = useMapPane('assetBurnPane', 436)
  const layer = useRef(null)
  const st = useRef({ items: [] })
  const items = useMemo(() => (fire && step >= 0 ? burnState(fire, step) : []), [fire, step])

  useLayoutEffect(() => {
    st.current.items = items
    layer.current?.redraw()
  }, [items])

  useEffect(() => {
    const l = new CanvasOverlay((ctx, view) => paint(ctx, view, st.current), { pane, pad: 0.25 })
    l.addTo(map)
    layer.current = l
    return () => {
      l.remove()
      layer.current = null
    }
  }, [map, pane])

  return null
}
