// Copy helpers: invented street-style addresses, dates and money in the portal's house style.
// Street names are generic Texas and Oklahoma naming (plants, animals, landforms); numbering is
// generated, so no address points at a real home.

const STREET_ROOTS = [
  'Cedar Hollow', 'Live Oak', 'Mesquite Bend', 'Bluestem', 'Agarita', 'Red Bud', 'Sotol', 'Caliche', 'Juniper Ridge', 'Post Oak',
  'Bois d’Arc', 'Prickly Pear', 'Blackjack', 'Sumac', 'Hackberry', 'Pecan Creek', 'Buffalo Grass', 'Sideoats', 'Switchgrass', 'Indian Blanket',
  'Bluebonnet', 'Paintbrush', 'Firewheel', 'Cenizo', 'Yaupon', 'Sycamore', 'Chinkapin', 'Shin Oak', 'Whitebrush', 'Persimmon',
  'Roadrunner', 'Scissortail', 'Painted Bunting', 'Kestrel', 'Cardinal', 'Mockingbird', 'Pronghorn', 'Armadillo', 'Horned Lark', 'Canyon Wren',
  'Limestone', 'Chalk Bluff', 'Flint Rock', 'Granite Knob', 'Sandstone', 'Red Clay', 'Gypsum', 'Shale Point', 'Rimrock', 'Mesa Vista',
  'Windmill', 'Stock Tank', 'Wagon Trail', 'Cattle Guard', 'Branding Iron', 'Saddle Horn', 'Spur', 'Chuckwagon', 'Barbed Wire', 'Line Camp',
  'Twin Creeks', 'Dry Fork', 'Arroyo', 'Draw', 'Spring Branch', 'High Plains', 'Caprock', 'Breaks', 'Crosstimber', 'Prairie View',
  'Sunset Ridge', 'Morning Star', 'Harvest Moon', 'North Star', 'Tumbleweed', 'Dust Devil', 'Blue Norther', 'Thunderhead', 'Rain Lily', 'Cloud Crest',
]
const SUFFIXES = ['Dr', 'Ln', 'Trl', 'Cv', 'Ct', 'Way', 'Rd', 'Pass', 'Loop', 'Path', 'Bend', 'Run']

/** A street name for a cluster's n-th street; each cluster gets its own shuffled pool. */
export function streetNamer(rng) {
  const roots = rng.shuffle(STREET_ROOTS)
  const used = new Set()
  return (n) => {
    for (let k = 0; k < 40; k++) {
      const root = roots[(n + k * 7) % roots.length]
      const suffix = SUFFIXES[(n * 5 + k + roots.length) % SUFFIXES.length]
      const name = `${root} ${suffix}`
      if (!used.has(name)) {
        used.add(name)
        return name
      }
    }
    return `${roots[n % roots.length]} ${SUFFIXES[n % SUFFIXES.length]} ${n}`
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86400000
export const parseDate = (iso) => new Date(`${iso}T00:00:00Z`)
export const isoDate = (d) => d.toISOString().slice(0, 10)
export const addDays = (iso, n) => isoDate(new Date(parseDate(iso).getTime() + n * DAY_MS))
export const daysBetween = (from, to) => Math.round((parseDate(to) - parseDate(from)) / DAY_MS)
export const dayMonth = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`

/** "14–18 Oct", or "20 Oct–2 Nov" across months. */
export function windowLabel(start, end) {
  if (start.slice(5, 7) === end.slice(5, 7)) return `${Number(start.slice(8, 10))}–${dayMonth(end)}`
  return `${dayMonth(start)}–${dayMonth(end)}`
}

/** $48M, $2.1M, $480k, $1.2B */
export function money(v, dp) {
  const a = Math.abs(v)
  const s = v < 0 ? '−' : ''
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(dp ?? 1)}B`
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(dp ?? (a >= 1e8 ? 0 : a >= 1e7 ? 0 : 1))}M`
  if (a >= 1e3) return `${s}$${Math.round(a / 1e3)}k`
  return `${s}$${Math.round(a)}`
}

export const pct = (f, dp = 0) => `${(f * 100).toFixed(dp)}%`
export const int = (n) => new Intl.NumberFormat('en-US').format(Math.round(n))
