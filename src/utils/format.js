const numberFmt = new Intl.NumberFormat('en-US')

export function formatNumber(value) {
  return numberFmt.format(value)
}

/** $148k, $2.1M, $1.2B — the compact money style used across the portal. */
export function formatUSDCompact(value) {
  const abs = Math.abs(value)
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `$${Math.round(value / 1e3)}k`
  return `$${numberFmt.format(value)}`
}

/** Relative day label with a typographic dash: –30, –7, 0. */
export function formatDayOffset(value) {
  return value < 0 ? `–${Math.abs(value)}` : String(value)
}
