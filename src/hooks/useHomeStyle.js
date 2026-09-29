import { useCallback, useMemo } from 'react'
import { store } from '../lib/store.js'
import { inBook } from '../lib/selectors.js'
import useApp from '../state/useApp.js'
import useSpread from '../state/useSpread.js'

const COVERED = { fill: 'covered', ring: null }
const ENGULFED = { fill: 'engulfed', ring: null }
const IN_P50 = new Set(['p90', 'p50'])

/**
 * How each home draws right now: yellow when covered; red once the selected fire's P50 perimeter
 * reaches it at the current spread step; a green (protected) or amber (warned) ring when the
 * Intervention status view is on or the fire's plan has been viewed (§10). Null hides the home.
 */
export default function useHomeStyle() {
  const { portfolioId, views, plansViewed } = useApp()
  const { fire, hour } = useSpread()
  const areaSet = useMemo(() => new Set(store.areas.filter((a) => a.type === 'homes' && inBook(a.state, portfolioId)).map((a) => a.id)), [portfolioId])
  const fireId = fire?.id ?? null
  const rings = views.intervention || (fireId !== null && plansViewed.has(fireId))
  return useCallback(
    (h) => {
      if (!areaSet.has(h.areaId)) return null
      let fill = 'covered'
      if (fireId !== null && hour !== null) {
        const p = store.pathByHome.get(h.id)
        if (p && p.fireId === fireId && IN_P50.has(p.band) && p.hourReached <= hour) fill = 'engulfed'
      }
      const ring = rings && h.protectedState ? h.protectedState : null
      if (!ring) return fill === 'covered' ? COVERED : ENGULFED
      return { fill, ring }
    },
    [areaSet, fireId, hour, rings],
  )
}
