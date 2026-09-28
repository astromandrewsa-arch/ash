import { useCallback, useEffect, useMemo, useState } from 'react'
import { SpreadContext } from './SpreadContext.js'
import useApp from './useApp.js'
import { fireById } from '../lib/data.js'
import { UI } from '../config/ui.js'

/**
 * Spread animation for the selected fire. step -1 shows nothing yet; step i shows perimeters 0..i.
 * Kept apart from AppContext so the ticking animation only re-renders what draws it.
 */
export default function SpreadProvider({ children }) {
  const { selection } = useApp()
  const fire = selection ? fireById[selection.fireId] : null
  const fireId = fire?.id ?? null
  const lastStep = fire ? fire.spread.steps.length - 1 : -1

  const [state, setState] = useState({ fireId: null, step: -1, playing: false })

  // A newly opened fire starts from nothing and autoplays once after the fly-in.
  if (state.fireId !== fireId) setState({ fireId, step: -1, playing: false })

  useEffect(() => {
    if (!fireId) return undefined
    const t = setTimeout(() => setState((s) => (s.fireId === fireId ? { ...s, playing: true } : s)), UI.autoplayDelayMs)
    return () => clearTimeout(t)
  }, [fireId])

  useEffect(() => {
    if (!state.playing) return undefined
    const id = setInterval(() => {
      setState((s) => {
        const step = Math.min(s.step + 1, lastStep)
        return { ...s, step, playing: step < lastStep }
      })
    }, UI.spreadStepMs)
    return () => clearInterval(id)
  }, [state.playing, lastStep])

  const play = useCallback(() => {
    setState((s) => ({ ...s, step: s.step >= lastStep ? -1 : s.step, playing: true }))
  }, [lastStep])
  const pause = useCallback(() => setState((s) => ({ ...s, playing: false })), [])
  const stepForward = useCallback(() => {
    setState((s) => ({ ...s, step: Math.min(s.step + 1, lastStep), playing: false }))
  }, [lastStep])
  const reset = useCallback(() => setState((s) => ({ ...s, step: -1, playing: false })), [])

  const value = useMemo(
    () => ({ fire, step: state.step, playing: state.playing, lastStep, play, pause, stepForward, reset }),
    [fire, state.step, state.playing, lastStep, play, pause, stepForward, reset],
  )

  return <SpreadContext.Provider value={value}>{children}</SpreadContext.Provider>
}
