// Greedy label placement for map markers: each label tries right, left, below, above its marker and
// takes the first spot that overlaps no marker and no label already placed; otherwise it hides
// (the full label still shows on hover).
const SIDES = ['right', 'left', 'below', 'above']
const GAP = 6

function rectFor(side, p, size, w, h) {
  const half = size / 2
  if (side === 'right') return { x0: p.x + half + GAP, y0: p.y - h / 2, x1: p.x + half + GAP + w, y1: p.y + h / 2 }
  if (side === 'left') return { x0: p.x - half - GAP - w, y0: p.y - h / 2, x1: p.x - half - GAP, y1: p.y + h / 2 }
  if (side === 'below') return { x0: p.x - w / 2, y0: p.y + half + GAP, x1: p.x + w / 2, y1: p.y + half + GAP + h }
  return { x0: p.x - w / 2, y0: p.y - half - GAP - h, x1: p.x + w / 2, y1: p.y - half - GAP }
}

const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

/**
 * items: [{ id, point: {x, y}, size, width, height, skip }] in priority order (skip: marker is an
 * obstacle but its label stays hidden).
 * keepOut: container-space rectangles labels must avoid (floating panels).
 * Returns Map<id, side | 'hidden'>.
 */
export function placeLabels(items, keepOut = []) {
  const taken = [...keepOut]
  for (const it of items) taken.push({ x0: it.point.x - it.size / 2, y0: it.point.y - it.size / 2, x1: it.point.x + it.size / 2, y1: it.point.y + it.size / 2 })
  const out = new Map()
  for (const it of items) {
    if (it.skip) {
      out.set(it.id, 'hidden')
      continue
    }
    let chosen = 'hidden'
    for (const side of SIDES) {
      const r = rectFor(side, it.point, it.size, it.width, it.height)
      if (!taken.some((t) => overlaps(t, r))) {
        chosen = side
        taken.push(r)
        break
      }
    }
    out.set(it.id, chosen)
  }
  return out
}

/** Rough pixel width of a label at 11.5 px Inter semibold. */
export const labelWidth = (text) => Math.ceil(text.length * 6.35 + 22)
