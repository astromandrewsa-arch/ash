// Leaflet paths and recharts need real colour values, so read them from the CSS tokens once.
let cache = null

export function palette() {
  if (cache) return cache
  const style = getComputedStyle(document.documentElement)
  const v = (name) => style.getPropertyValue(name).trim()
  const values = {
    orange: v('--pyrome-orange'),
    charcoal: v('--charcoal'),
    yellow: v('--homes-yellow'),
    red: v('--fire-red'),
    green: v('--savings-green'),
    amber: v('--rag-amber'),
    blue: v('--comparison-blue'),
    blue2: v('--comparison-blue-2'),
    blue3: v('--comparison-blue-3'),
    road: v('--road-grey'),
    river: v('--river-blue'),
    sensor: v('--sensor-grey'),
    muted: v('--text-muted'),
    border: v('--border'),
  }
  if (values.orange) cache = values
  return values
}

/** Pixel value of a layout token such as --drawer-width. */
export function cssPx(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0
}

// "#abc" or "#aabbcc" → [r, g, b]. Minified CSS may shorten a token to three digits.
function rgb(hex) {
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
}

/** Linear blend of two hex colours. */
export function mix(a, b, t) {
  const pa = rgb(a)
  const pb = rgb(b)
  return pa.map((x, i) => Math.round(x + (pb[i] - x) * t))
}
