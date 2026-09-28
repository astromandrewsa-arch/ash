const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86400000

const parse = (iso) => new Date(`${iso}T00:00:00Z`)

/** "2026-10-12" → "12 Oct" */
export function dayMonth(iso) {
  return `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
}

/** "2026-10-12" → "12 Oct 2026" */
export function fullDate(iso) {
  return `${dayMonth(iso)} ${iso.slice(0, 4)}`
}

/** "11–14 Oct" or "30 Oct–2 Nov" */
export function dateRange(start, end) {
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${Number(start.slice(8, 10))}–${dayMonth(end)}`
  }
  return `${dayMonth(start)}–${dayMonth(end)}`
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from, to) {
  return Math.round((parse(to) - parse(from)) / DAY_MS)
}
