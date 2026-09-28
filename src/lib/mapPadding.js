import { cssPx } from '../styles/palette.js'

/** Map padding that keeps flown-to features clear of the floating panels and, when open, the drawer. */
export function mapPadding(withDrawer) {
  const gap = cssPx('--overlay-gap')
  const left = cssPx('--left-panel-width') + gap * 2
  const right = withDrawer ? cssPx('--drawer-width') + gap * 2 : cssPx('--alert-card-width') + gap * 2
  const top = withDrawer ? cssPx('--alert-compact-clearance') : gap * 2
  const bottom = cssPx(withDrawer ? '--slider-clearance-open' : '--slider-clearance')
  return { paddingTopLeft: [left, top], paddingBottomRight: [right, bottom] }
}
