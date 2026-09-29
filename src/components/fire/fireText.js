import { formatNumber } from '../../lib/format.js'

/** "Called 15 days ahead; window narrowed from 14 to 5 days." (§10) */
export function leadLine(f) {
  if (f.windowDays < f.windowNarrowedFrom) return `Called ${f.leadDays} days ahead; window narrowed from ${f.windowNarrowedFrom} to ${f.windowDays} days.`
  return `Called ${f.leadDays} days ahead; the ${f.windowDays}-day window narrows as the date nears.`
}

/** "Smokehouse Creek (2024): 1,058,482 ac, 500 structures lost." */
export function analogueLine(a) {
  const loss = a.homesLost ? `, ${formatNumber(a.homesLost)} homes lost` : a.structures ? `, ${formatNumber(a.structures)} structures lost` : ''
  return `${a.name} (${a.year}): ${formatNumber(a.acres)} ac${loss}.`
}

/** "Includes demand surge 18%, debris removal 5%, ALE. Excludes smoke, urban conflagration beyond the band." */
export function basisLine(f) {
  const list = (xs) => xs.join(', ')
  return `Includes ${list(f.inclusions)}. Excludes ${list(f.exclusions)}.`
}
