import { cssPx } from '../styles/palette.js'

/** Map padding that keeps flown-to features clear of the floating panels and, when open, the drawer. */
export function mapPadding(withDrawer) {
  const gap = cssPx('--overlay-gap')
  const left = cssPx('--left-panel-width') + gap * 2
  const right = withDrawer ? cssPx('--drawer-width') + gap * 2 : cssPx('--alert-card-width') + gap * 2
  return { paddingTopLeft: [left, gap * 2], paddingBottomRight: [right, cssPx('--slider-clearance')] }
}
