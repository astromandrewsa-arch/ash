// Book exceedance curve helpers (CLAUDE.md §8, §19), mirroring scripts/lib/loss.mjs.

/** Return period (years) of a loss on an EP curve given as [{ rp, loss }] ascending in rp. */
export function returnPeriod(curve, loss) {
  if (loss <= curve[0].loss) return Math.max(1, curve[0].rp * (loss / curve[0].loss))
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1]
    const b = curve[i]
    if (loss <= b.loss) {
      const t = (loss - a.loss) / (b.loss - a.loss)
      return Math.exp(Math.log(a.rp) + t * (Math.log(b.rp) - Math.log(a.rp)))
    }
  }
  return curve[curve.length - 1].rp
}
