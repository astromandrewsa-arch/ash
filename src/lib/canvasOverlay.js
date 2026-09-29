// A Leaflet layer that paints on one canvas covering the viewport plus a margin (CLAUDE.md §2: never
// mount thousands of DOM markers). `draw(ctx, view)` runs on every moveend and resize and on
// `redraw()`. `view.px(lng)` / `view.py(lat)` project to canvas pixels without allocating, so a
// redraw of tens of thousands of points stays well inside a frame budget.
import L from 'leaflet'

const DEG = Math.PI / 180
const MAX_LAT = 85.0511287798

export const CanvasOverlay = L.Layer.extend({
  options: { pane: 'overlayPane', pad: 0.2, className: '' },

  initialize(draw, options) {
    this._draw = draw
    L.setOptions(this, options)
  },

  setDraw(draw) {
    this._draw = draw
    return this.redraw()
  },

  onAdd(map) {
    this._canvas = L.DomUtil.create('canvas', `canvas-overlay leaflet-zoom-animated ${this.options.className}`.trim())
    this._ctx = this._canvas.getContext('2d')
    this.getPane().appendChild(this._canvas)
    map.on('moveend resize', this._reset, this)
    map.on('zoomanim', this._animateZoom, this)
    this._reset()
  },

  onRemove(map) {
    map.off('moveend resize', this._reset, this)
    map.off('zoomanim', this._animateZoom, this)
    L.DomUtil.remove(this._canvas)
    this._canvas = null
  },

  redraw() {
    if (this._map && this._canvas) this._reset()
    return this
  },

  /** The view of the last redraw (for hit tests). */
  view() {
    return this._view
  },

  _animateZoom(e) {
    if (!this._bounds) return
    const scale = this._map.getZoomScale(e.zoom)
    const offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min
    L.DomUtil.setTransform(this._canvas, offset, scale)
  },

  _reset() {
    const map = this._map
    const size = map.getSize()
    const pad = size.multiplyBy(this.options.pad).round()
    const topLeft = map.containerPointToLayerPoint(pad.multiplyBy(-1)).round()
    const full = size.add(pad.multiplyBy(2))
    const dpr = window.devicePixelRatio || 1
    const c = this._canvas
    if (c.width !== full.x * dpr || c.height !== full.y * dpr) {
      c.width = full.x * dpr
      c.height = full.y * dpr
      c.style.width = `${full.x}px`
      c.style.height = `${full.y}px`
    }
    L.DomUtil.setPosition(c, topLeft)
    this._bounds = L.latLngBounds(map.layerPointToLatLng(topLeft), map.layerPointToLatLng(topLeft.add(full)))
    const ctx = this._ctx
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, full.x, full.y)

    const zoom = map.getZoom()
    const scale = 256 * 2 ** zoom
    const origin = map.getPixelOrigin()
    const ox = origin.x + topLeft.x
    const oy = origin.y + topLeft.y
    const px = (lng) => ((lng + 180) / 360) * scale - ox
    const py = (lat) => {
      const s = Math.sin(Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) * DEG)
      return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * scale - oy
    }
    // Container point of a canvas pixel (for hit tests against the mouse).
    const toContainer = (x, y) => [x - pad.x, y - pad.y]
    this._view = { map, zoom, bounds: this._bounds, viewport: map.getBounds(), px, py, width: full.x, height: full.y, pad, toContainer }
    this._draw?.(ctx, this._view)
  },
})
