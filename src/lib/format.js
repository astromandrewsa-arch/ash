const numberFmt = new Intl.NumberFormat('en-US')
const MINUS = '−'

export function formatNumber(value) {
  return numberFmt.format(Math.round(value))
}

/** $148k, $2.1M, $1.2B — the compact money style used across the portal. */
export function formatUSDCompact(value, dp) {
  const abs = Math.abs(value)
  const sign = value < 0 ? MINUS : ''
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(dp ?? 1)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(dp ?? (abs >= 1e8 ? 0 : 1))}M`
  if (abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}k`
  return `${sign}$${numberFmt.format(Math.round(abs))}`
}

/** "$48–96M" style band; falls back to two compact figures when units differ. */
export function formatUSDRange(lo, hi) {
  const a = formatUSDCompact(lo)
  const b = formatUSDCompact(hi)
  const unit = (s) => s.slice(-1)
  if (unit(a) === unit(b) && /[MBk]/.test(unit(a))) return `${a.slice(0, -1)}–${b.slice(1)}`
  return `${a}–${b}`
}

/** 0.87 → "87%" */
export function formatPct(fraction, dp = 0) {
  return `${(fraction * 100).toFixed(dp)}%`
}

/** Signed day offset with a true minus sign: −30, −7, 0. */
export function formatDayOffset(value) {
  return value < 0 ? `${MINUS}${Math.abs(value)}` : String(value)
}

export function formatHa(value) {
  return `${numberFmt.format(Math.round(value))} ha`
}

export function formatKm(value, dp = 0) {
  return `${numberFmt.format(Number(value.toFixed(dp)))} km`
}

/** −0.187 → "−19%", 0.07 → "+7%" */
export function formatPctSigned(fraction, dp = 0) {
  const v = (fraction * 100).toFixed(dp)
  if (Number(v) === 0) return '0%'
  return fraction < 0 ? `${MINUS}${Math.abs(Number(v)).toFixed(dp)}%` : `+${v}%`
}

/** "a 1-in-13 event for this book"; losses under the curve's 1-in-2 point say so instead of "1-in-1". */
export function returnPeriodText(rp) {
  if (rp < 2) return 'below the 1-in-2 loss for this book'
  return `a 1-in-${Math.round(rp)} event for this book`
}

/** Money in one unit for a set of figures (a legend reads "$1.4M · $0.8M", not "$1.4M · $800k"). */
export function formatUSDIn(value, max) {
  if (max >= 1e6) return `$${(value / 1e6).toFixed(value > 0 && value < 1e5 ? 2 : 1)}M`
  if (max >= 1e3) return `$${Math.round(value / 1e3)}k`
  return `$${Math.round(value)}`
}
