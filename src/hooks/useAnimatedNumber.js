import { useEffect, useRef, useState } from 'react'
import { UI } from '../config/ui.js'

/** Tweens from the last shown value to `target` with an ease-out curve. */
export default function useAnimatedNumber(target, duration = UI.numberTweenMs) {
  const [display, setDisplay] = useState(target)
  const shown = useRef(target)

  useEffect(() => {
    const from = shown.current
    if (from === target) return undefined
    const start = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const next = from + (target - from) * (1 - (1 - t) ** 3)
      shown.current = next
      setDisplay(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
