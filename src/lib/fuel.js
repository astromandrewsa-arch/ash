// Colour ramps for the four fuel-grid Quick Views (stops come from fuelGrid.json).
import { store } from './store.js'
import { rgb } from '../styles/palette.js'

export function fuelVariant(id) {
  return store.fuelGrid.variants.find((v) => v.id === id)
}

/** Stored value → display value (10-h dead moisture is stored ×10). */
export const fuelValue = (variant, raw) => raw / variant.scale

/** Interpolated [r, g, b] for a display value along the variant's stops. */
export function fuelRgb(variant, value) {
  const stops = variant.stops
  if (value <= stops[0][0]) return rgb(stops[0][1])
  if (value >= stops[stops.length - 1][0]) return rgb(stops[stops.length - 1][1])
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i]
    const [v0, c0] = stops[i - 1]
    if (value <= v1) {
      const t = (value - v0) / (v1 - v0)
      const a = rgb(c0)
      const b = rgb(c1)
      return a.map((x, k) => Math.round(x + (b[k] - x) * t))
    }
  }
  return rgb(stops[stops.length - 1][1])
}
