import { issueDate, stages } from './data.js'
import { daysBetween } from './dates.js'
import user from '../data/v1/user.json'

const ORDER = stages.map((s) => s.id)
const AGREED = new Set(['agreed', 'complete', 'prevented'])

/** Index of the furthest stepper stage a process has reached (a declined process stops where it was refused). */
export function reachedStageIndex(process) {
  if (process.stage !== 'declined') return ORDER.indexOf(process.stage)
  const done = new Set(process.entries.filter((e) => !e.planned).map((e) => e.type))
  if (done.has('negotiation')) return ORDER.indexOf('negotiation')
  if (done.has('engaged')) return ORDER.indexOf('engaged')
  return 0
}

export function isAgreed(process) {
  return AGREED.has(process.stage)
}

/** Timeline entries, plus today's hand-off entry once the carrier has passed the fire to its agent. */
export function timelineEntries(process, handedOff) {
  if (!handedOff || !process.current) return process.entries
  const day = -daysBetween(issueDate, process.predictedDate)
  const handoff = {
    day,
    date: issueDate,
    type: 'handoff',
    text: `Passed to your dedicated Pyrome agent by ${user.name}, ${user.role.split(', ')[1]}.`,
    actor: user.name,
    counterpart: process.agent.name,
    live: true,
  }
  const done = process.entries.filter((e) => !e.planned)
  const planned = process.entries.filter((e) => e.planned)
  return [...done, handoff, ...planned]
}
