import { fireById, historicalFires, issueDate, processes } from './data.js'
import { dayMonth, daysBetween } from './dates.js'
import { formatPct } from './format.js'
import { timelineEntries } from './agent.js'

export const FEED_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'identified', label: 'Identified' },
  { id: 'negotiation', label: 'In negotiation' },
  { id: 'agreed', label: 'Agreed' },
  { id: 'declined', label: 'Declined' },
  { id: 'prevented', label: 'Prevented' },
]

const STATUS_WORDS = {
  identified: 'identified',
  engaged: 'agent engaged',
  negotiation: 'in negotiation',
  agreed: 'work agreed',
  complete: 'work complete',
  prevented: 'fire prevented',
  declined: 'declined',
}

const ago = (date) => {
  const n = daysBetween(date, issueDate)
  return n === 0 ? 'today' : n === 1 ? 'yesterday' : `${n} days ago`
}

/** One card per agent process, reflecting any hand-off made in this session. Newest first. */
export function feedItems(handedOff) {
  return processes
    .map((p) => {
      const passed = handedOff.has(p.fireId)
      const entries = timelineEntries(p, passed)
      const done = entries.filter((e) => !e.planned)
      const last = done[done.length - 1]
      const next = entries.find((e) => e.planned) ?? null
      const stage = p.stage === 'identified' && passed ? 'engaged' : p.stage
      const group = p.stage === 'identified' && passed ? 'negotiation' : p.feedGroup
      const body = p.primaryCounterpart.includes('County') ? 'county' : 'TAMFS'

      const probability = (fireById[p.fireId] ?? historicalFires.find((h) => h.id === p.fireId)).probability
      const parts = [p.fireId, p.place]
      if (p.current) {
        parts.push(`dated at ${formatPct(probability)}, ${p.daysOut} days out`)
        if (p.engagedOn) parts.push(`agent engaged ${body} ${ago(p.engagedOn)}`)
        else parts.push(passed ? 'passed to agent today' : 'awaiting agent')
      } else {
        const burned = entries.find((e) => e.type === 'burned')
        const closed = entries.find((e) => e.type === 'prevented')
        parts.push(`dated at ${formatPct(probability)}`)
        if (burned) parts.push(`burned ${dayMonth(burned.date)}`)
        else if (closed) parts.push(`window closed ${dayMonth(closed.date)}`)
      }
      parts.push(`status: ${STATUS_WORDS[stage]}`)

      return { process: p, stage, group, headline: parts.join(' — '), last, next, passed }
    })
    .sort((a, b) => (a.last.date < b.last.date ? 1 : a.last.date > b.last.date ? -1 : 0))
}
