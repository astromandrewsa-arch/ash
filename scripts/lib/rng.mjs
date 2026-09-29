// Seeded randomness. Every draw in the generator comes from a stream named by a label,
// so adding a new stream never shifts the numbers of an existing one.

export const SEED = 20260929

function hashString(str) {
  let h = 2166136261 ^ SEED
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

export function makeRng(label) {
  let a = hashString(label)
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const between = (lo, hi) => lo + (hi - lo) * next()
  const normal = () => {
    const u = Math.max(next(), 1e-12)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next())
  }
  return {
    next,
    between,
    normal,
    int: (lo, hi) => Math.floor(between(lo, hi + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    /** Log-normal around `median` with log-sd `sigma`. */
    lognormal: (median, sigma) => median * Math.exp(sigma * normal()),
    weighted: (pairs) => {
      let r = next() * pairs.reduce((s, [, w]) => s + w, 0)
      for (const [value, w] of pairs) if ((r -= w) <= 0) return value
      return pairs[pairs.length - 1][0]
    },
    shuffle: (arr) => {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}
