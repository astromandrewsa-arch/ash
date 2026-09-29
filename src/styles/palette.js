// Leaflet canvases and recharts need real colour values, so read them from the CSS tokens once.
let cache = null

export function palette() {
  if (cache) return cache
  const style = getComputedStyle(document.documentElement)
  const v = (name) => style.getPropertyValue(name).trim()
  const values = {
    orange: v('--orange'),
    yellow: v('--yellow'),
    red: v('--red'),
    amber: v('--amber'),
    green: v('--green'),
    blue: v('--blue'),
    blueSoft: v('--blue-soft'),
    charcoal: v('--charcoal'),
    ink: v('--ink'),
    warmGrey: v('--warm-grey'),
    muted: v('--muted'),
    hairline: v('--hairline'),
    sensor: v('--grey-sensor'),
    water: v('--water'),
    road: v('--road'),
    sev: [v('--sev-1'), v('--sev-2'), v('--sev-3'), v('--sev-4')],
    // v1 names still read by the legacy screens until their passes replace them.
    blue2: v('--blue-soft'),
    blue3: '#9DBDE6',
    river: v('--water'),
    border: v('--hairline'),
  }
  if (values.orange) cache = values
  return values
}

/** Pixel value of a layout token such as --drawer-width. */
export function cssPx(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0
}

// "#abc" or "#aabbcc" → [r, g, b]. Minified CSS may shorten a token to three digits.
export function rgb(hex) {
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
}

/** "#E2561B", 0.4 → "rgba(226, 86, 27, 0.4)" */
export function alpha(hex, a) {
  const [r, g, b] = rgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Linear blend of two hex colours. */
export function mix(a, b, t) {
  const pa = rgb(a)
  const pb = rgb(b)
  return pa.map((x, i) => Math.round(x + (pb[i] - x) * t))
}
