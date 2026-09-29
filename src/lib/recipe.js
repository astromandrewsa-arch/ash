// Reading a fire's recipe for the spread bar: the wind at an hour, and the events so far.
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export const compass = (deg) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]

/** The recipe segment in force at `hour`. */
export function windAt(fire, hour) {
  const segs = fire.shape.segments
  let seg = segs[0]
  for (const s of segs) if (s.fromHour <= hour) seg = s
  return seg
}

/** Events sorted by hour, each flagged as a wind shift or a spotting event. */
export function recipeEvents(fire) {
  const shifts = new Set(fire.shape.segments.filter((s) => s.fromHour > 0).map((s) => s.fromHour))
  return [...fire.shape.events]
    .sort((a, b) => a.hour - b.hour)
    .map((e) => ({ ...e, shift: shifts.has(e.hour) || /wind (shift|swings|veers|eases)|frontal|north-west wind/i.test(e.text), spot: /spot/i.test(e.text) }))
}

/** The last event at or before `hour` (null before ignition). */
export function eventAt(fire, hour) {
  if (hour === null) return null
  let out = null
  for (const e of recipeEvents(fire)) if (e.hour <= hour) out = e
  return out
}

/** Index of the step at which an event hour has been reached. */
export function stepOfHour(fire, hour) {
  const i = fire.steps.findIndex((s) => s.hour >= hour)
  return i === -1 ? fire.steps.length - 1 : i
}
