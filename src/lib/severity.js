// Isochrone severity ramp (§3): 1 h pale → 48 h deep red, interpolated on log hours.
import { palette, rgb } from '../styles/palette.js'

export function hourColor(hour) {
  const sev = palette().sev
  const t = Math.max(0, Math.min(1, Math.log(Math.max(1, hour)) / Math.log(48)))
  const x = t * (sev.length - 1)
  const i = Math.min(sev.length - 2, Math.floor(x))
  const a = rgb(sev[i])
  const b = rgb(sev[i + 1])
  const f = x - i
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/** Burn-probability fills (§3): P90 darkest, P50, P25 lightest, all at 35% alpha. */
export function bandColor(band) {
  const sev = palette().sev
  return { p90: sev[3], p50: sev[2], p25: sev[1] }[band]
}
