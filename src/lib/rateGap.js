// Rate gap Quick View (CLAUDE.md §9, §15): what the map shades per bundle, today or for 2027.
import { filedGap } from './premium.js'
import { formatPctSigned } from './format.js'
import { clusterRadius } from './homesPaint.js'

/** Below zoom 9 a homes area shades as a disc just wider than its cluster dot's glow. */
export const discRadius = (homes) => clusterRadius(homes) * 2.1 + 3

/** Signed gap the shading reads: adequacy today, or the filed 2027 change less PRIMER's recommendation. */
export const gapOf = (b, mode) => (mode === '2027' ? filedGap(b) : b.adequacy)

/** Orange where the rate (or the filing) falls short of PRIMER, blue where it runs above. */
export const isShort = (b, mode) => gapOf(b, mode) < 0

/** Label text for a bundle on the map; compact at state scale, where only the figures fit. */
export function gapLabel(b, mode, compact = false) {
  if (mode === '2027') return `${formatPctSigned(b.recommendation2027)} vs ${formatPctSigned(b.filed2027)}${compact ? '' : ' filed'}`
  return compact ? formatPctSigned(b.adequacy) : `${formatPctSigned(b.adequacy)} ${b.underPriced ? 'under-priced' : 'over-priced'}`
}
