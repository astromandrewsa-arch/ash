import { useCallback, useEffect, useMemo, useState } from 'react'
import { SpreadContext } from './SpreadContext.js'
import useApp from './useApp.js'
import { store } from '../lib/store.js'
import { UI } from '../config/ui.js'

/**
 * Spread playback for the selected fire: a step index into fire.steps (−1 = ignition only),
 * play / pause / step / reset. Changing fire resets to ignition.
 */
export default function SpreadProvider({ children }) {
  const { selection } = useApp()
  const fireId = selection?.kind === 'fire' ? selection.id : null
  const [state, setState] = useState({ fireId: null, step: -1, playing: false })
  let current = state
  if (state.fireId !== fireId) {
    current = { fireId, step: -1, playing: false }
    setState(current)
  }
  const fire = current.fireId ? store.fireById.get(current.fireId) : null
  const last = fire ? fire.steps.length - 1 : -1

  useEffect(() => {
    if (!state.playing) return undefined
    const t = setTimeout(
      () => setState((p) => (p.step >= last ? { ...p, playing: false } : { ...p, step: p.step + 1, playing: p.step + 1 < last })),
      state.step < 0 ? UI.spreadFirstStepMs : UI.spreadStepMs,
    )
    return () => clearTimeout(t)
  }, [state, last])

  const play = useCallback(() => setState((p) => ({ ...p, playing: true, step: p.step >= last ? -1 : p.step })), [last])
  const pause = useCallback(() => setState((p) => ({ ...p, playing: false })), [])
  const stepForward = useCallback(() => setState((p) => ({ ...p, playing: false, step: Math.min(last, p.step + 1) })), [last])
  const reset = useCallback(() => setState((p) => ({ ...p, playing: false, step: -1 })), [])
  const setStep = useCallback((i) => setState((p) => ({ ...p, playing: false, step: Math.max(-1, Math.min(last, i)) })), [last])

  const stepInfo = fire && current.step >= 0 ? fire.steps[current.step] : null
  const value = useMemo(
    () => ({ fire, step: current.step, stepInfo, hour: stepInfo ? stepInfo.hour : null, playing: current.playing, lastStep: last, play, pause, stepForward, reset, setStep }),
    [fire, current.step, stepInfo, current.playing, last, play, pause, stepForward, reset, setStep],
  )
  return <SpreadContext.Provider value={value}>{children}</SpreadContext.Provider>
}
