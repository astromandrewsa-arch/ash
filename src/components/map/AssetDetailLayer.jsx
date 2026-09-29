import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { CanvasOverlay } from '../../lib/canvasOverlay.js'
import { MAP } from '../../config/map.js'
import { palette } from '../../styles/palette.js'
import useMapPane from '../../hooks/useMapPane.js'

const TAU = Math.PI * 2

function paint(ctx, view, assets) {
  const c = palette()
  const b = view.bounds
  const inB = (lat, lng) => lat >= b.getSouth() && lat <= b.getNorth() && lng >= b.getWest() && lng <= b.getEast()
  // Poles every 90 m from zoom 12.
  if (view.zoom >= MAP.poleMinZoom) {
    const r = view.zoom >= 15 ? 3.2 : view.zoom >= 13 ? 2.6 : 2
    ctx.beginPath()
    for (const a of assets) {
      if (a.kind !== 'line') continue
      for (const p of a.poles) {
        if (!inB(p[0], p[1])) continue
        const x = view.px(p[1])
        const y = view.py(p[0])
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, TAU)
      }
    }
    ctx.fillStyle = c.yellow
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(12, 12, 13, 0.8)'
    ctx.stroke()
  }
  // Turbines from zoom 11.
  if (view.zoom >= MAP.turbineMinZoom) {
    ctx.beginPath()
    for (const a of assets) {
      if (a.kind !== 'wind' || !a.turbines) continue
      for (const p of a.turbines) {
        if (!inB(p[0], p[1])) continue
        const x = view.px(p[1])
        const y = view.py(p[0])
        ctx.moveTo(x + 2.4, y)
        ctx.arc(x, y, 2.4, 0, TAU)
      }
    }
    ctx.fillStyle = '#FFF6D0'
    ctx.fill()
    ctx.lineWidth = 1
    ctx.strokeStyle = c.yellow
    ctx.stroke()
  }
  // Pump stations as small squares from zoom 8.
  if (view.zoom >= 8) {
    for (const a of assets) {
      for (const s of a.stations || []) {
        if (!inB(s.pos[0], s.pos[1])) continue
        const x = view.px(s.pos[1])
        const y = view.py(s.pos[0])
        ctx.fillStyle = c.yellow
        ctx.fillRect(x - 3.5, y - 3.5, 7, 7)
        ctx.lineWidth = 1.2
        ctx.strokeStyle = 'rgba(12, 12, 13, 0.85)'
        ctx.strokeRect(x - 3.5, y - 3.5, 7, 7)
      }
    }
  }
}

/** Poles, turbines and pump stations drawn on one canvas (thousands of points, no DOM). */
export default function AssetDetailLayer({ assets }) {
  const map = useMap()
  const pane = useMapPane('assetDetailPane', 435)
  const layer = useRef(null)
  const data = useRef(assets)

  useLayoutEffect(() => {
    data.current = assets
    layer.current?.redraw()
  }, [assets])

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
