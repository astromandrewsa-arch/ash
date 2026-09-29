// Outline of a union of discs: each circle's arcs that no other disc covers. Used where several
// areas of one bundle merge into one shaded blob and a per-disc stroke would criss-cross.
const TAU = Math.PI * 2

/** Angular spans of disc `a`'s rim covered by the other discs; null when another disc swallows it. */
function coveredSpans(discs, i) {
  const a = discs[i]
  const spans = []
  for (let j = 0; j < discs.length; j++) {
    if (j === i) continue
    const b = discs[j]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy)
    if (d >= a.r + b.r) continue
    // Identical discs: the later one draws the rim.
    if (d + a.r <= b.r && !(d === 0 && a.r === b.r && j > i)) return null
    if (d + b.r <= a.r) continue
    const half = Math.acos(Math.max(-1, Math.min(1, (d * d + a.r * a.r - b.r * b.r) / (2 * d * a.r))))
    const start = (((Math.atan2(dy, dx) - half) % TAU) + TAU) % TAU
    const end = start + 2 * half
    if (end > TAU) spans.push([start, TAU], [0, end - TAU])
    else spans.push([start, end])
  }
  spans.sort((p, q) => p[0] - q[0])
  const merged = []
  for (const s of spans) {
    const last = merged[merged.length - 1]
    if (last && s[0] <= last[1]) last[1] = Math.max(last[1], s[1])
    else merged.push([...s])
  }
  return merged
}

/** Add the union's outline to the current path (discs: [{ x, y, r }] in canvas pixels). */
export function traceDiscUnionOutline(ctx, discs) {
  discs.forEach((a, i) => {
    const covered = coveredSpans(discs, i)
    if (covered === null) return
    let from = 0
    for (const [s, e] of [...covered, [TAU, TAU]]) {
      if (s - from > 1e-3) {
        ctx.moveTo(a.x + a.r * Math.cos(from), a.y + a.r * Math.sin(from))
        ctx.arc(a.x, a.y, a.r, from, s)
      }
      from = Math.max(from, e)
    }
  })
}
