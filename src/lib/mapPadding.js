import { cssPx } from '../styles/palette.js'

/** Map padding that keeps flown-to features clear of the floating panels and, when open, the drawer. */
export function mapPadding(withDrawer) {
  const gap = cssPx('--overlay-gap')
  const left = cssPx('--left-panel-width') + gap * 2
  const right = withDrawer ? cssPx('--drawer-width') + gap * 2 : cssPx('--alert-card-width') + gap * 2
  const top = cssPx('--topbar-height') + gap
  const bottom = cssPx(withDrawer ? '--slider-clearance-open' : '--slider-clearance')
  return { paddingTopLeft: [left, top], paddingBottomRight: [right, bottom] }
}

const PANELS = '.topbar, .overlay-left > *, .alert30:not(.is-hidden), .slider-dock > *'

/** Map-container rectangles covered by floating panels, for label placement. */
export function panelKeepOut(drawerOpen) {
  const host = document.querySelector('.map-host')
  if (!host) return []
  const base = host.getBoundingClientRect()
  const pad = 6
  const rects = [...document.querySelectorAll(PANELS)].map((el) => {
    const r = el.getBoundingClientRect()
    return { x0: r.left - base.left - pad, y0: r.top - base.top - pad, x1: r.right - base.left + pad, y1: r.bottom - base.top + pad }
  })
  if (drawerOpen) {
    const w = cssPx('--drawer-width')
    rects.push({ x0: base.width - w - pad, y0: 0, x1: base.width, y1: base.height })
  }
  return rects
}
