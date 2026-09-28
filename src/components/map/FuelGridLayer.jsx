import { useMemo } from 'react'
import { ImageOverlay } from 'react-leaflet'
import { fuelGrid, mapConfig } from '../../lib/data.js'
import { mix, palette } from '../../styles/palette.js'

// Days to fuel threshold → colour: red (imminent) → orange → green (scale end and beyond).
function colourFor(days, c) {
  const t = Math.min(1, days / mapConfig.fuelGridScaleDays)
  return t < 0.5 ? mix(c.red, c.orange, t / 0.5) : mix(c.orange, c.green, (t - 0.5) / 0.5)
}

/** One pixel per 200 m cell, stretched over the grid bounds and drawn with crisp edges. */
function gridImage(grid) {
  const c = palette()
  const canvas = document.createElement('canvas')
  canvas.width = grid.cols
  canvas.height = grid.rows
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(grid.cols, grid.rows)
  grid.values.forEach((row, r) =>
    row.forEach((days, col) => {
      const i = (r * grid.cols + col) * 4
      if (days < 0) return
      const [red, green, blue] = colourFor(days, c)
      img.data.set([red, green, blue, 255], i)
    }),
  )
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

export default function FuelGridLayer() {
  const images = useMemo(() => fuelGrid.areas.map((g) => ({ id: g.areaId, url: gridImage(g), bounds: g.bounds })), [])
  return images.map((g) => (
    <ImageOverlay
      key={g.id}
      url={g.url}
      bounds={g.bounds}
      opacity={mapConfig.fuelGridOpacity}
      className="fuel-grid-img"
      pane="fuel"
      interactive={false}
    />
  ))
}
