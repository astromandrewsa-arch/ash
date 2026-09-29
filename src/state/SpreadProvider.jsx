import { useCallback, useEffect, useMemo, useState } from 'react'
import { SpreadContext } from './SpreadContext.js'
import useApp from './useApp.js'
import { store } from '../lib/store.js'
import { UI } from '../config/ui.js'

/** Index of the last step that still grows (later steps are held at that perimeter). */
export function lastActiveStep(fire) {
  let last = fire.steps.length - 1
  while (last > 0 && fire.steps[last].held) last--
  return last
}

/**
 * Spread playback for the selected fire: a step index into fire.steps (−1 = ignition only), play,
 * pause, step, reset. Opening a fire resets to ignition and plays once after the fly-in (§10);
 * playback stops at the last growing step, where crews hold the fire.
 */
export default function SpreadProvider({ children }) {
  const { selection } = useApp()
  const fireId = selection?.kind === 'fire' ? selection.id : null
  const [state, setState] = useState({ fireId: null, step: -1, playing: false, auto: false })
  let current = state
  if (state.fireId !== fireId) {
    current = { fireId, step: -1, playing: false, auto: fireId !== null }
    setState(current)
  }
  const fire = current.fireId ? store.fireById.get(current.fireId) : null
  const last = fire ? fire.steps.length - 1 : -1
  const lastActive = fire ? lastActiveStep(fire) : -1

  // Autoplay once, after the map has flown to the fire.
  useEffect(() => {
    if (!state.auto) return undefined
    const t = setTimeout(() => setState((p) => (p.auto ? { ...p, auto: false, playing: true, step: -1 } : p)), UI.autoplayDelayMs)
    return () => clearTimeout(t)
  }, [state.auto, state.fireId])

  useEffect(() => {
    if (!state.playing) return undefined
    const t = setTimeout(
      () => setState((p) => (p.step >= lastActive ? { ...p, playing: false } : { ...p, step: p.step + 1, playing: p.step + 1 < lastActive })),
      state.step < 0 ? UI.spreadFirstStepMs : UI.spreadStepMs,
    )
    return () => clearTimeout(t)
  }, [state, lastActive])

  const play = useCallback(() => setState((p) => ({ ...p, auto: false, playing: true, step: p.step >= lastActive ? -1 : p.step })), [lastActive])
  const pause = useCallback(() => setState((p) => ({ ...p, auto: false, playing: false })), [])
  const stepForward = useCallback(() => setState((p) => ({ ...p, auto: false, playing: false, step: Math.min(last, p.step + 1) })), [last])
  const reset = useCallback(() => setState((p) => ({ ...p, auto: false, playing: false, step: -1 })), [])
  const setStep = useCallback((i) => setState((p) => ({ ...p, auto: false, playing: false, step: Math.max(-1, Math.min(last, i)) })), [last])

  const stepInfo = fire && current.step >= 0 ? fire.steps[current.step] : null
  const value = useMemo(
    () => ({
      fire,
      step: current.step,
      stepInfo,
      hour: stepInfo ? stepInfo.hour : null,
      playing: current.playing,
      lastStep: last,
      lastActive,
      play,
      pause,
      stepForward,
      reset,
      setStep,
    }),
    [fire, current.step, stepInfo, current.playing, last, lastActive, play, pause, stepForward, reset, setStep],
  )
  return <SpreadContext.Provider value={value}>{children}</SpreadContext.Provider>
}
