// Negotiation Channel (CLAUDE.md §12): the feed, its filters and the headline tiles.
import { store } from './store.js'
import { inBook } from './selectors.js'
import { addDays } from './dates.js'

export const STATUS_FILTERS = ['All', 'Identified', 'In negotiation', 'Agreed', 'Partial', 'Declined', 'State plan', 'Prevented']
export const COUNTERPARTY_TYPES = ['All', 'State agency', 'County', 'Utility', 'Landowner', 'Operator']
export const FEED_DEFAULTS = { status: 'All', type: 'All', payer: 'all' }

/** A negotiation's state: its fire's, or the last-month fire's place suffix. */
function stateOf(n) {
  if (n.lastMonth) return n.fire.place.slice(-2)
  return store.fireById.get(n.fireId)?.state
}

/** The book's negotiations, newest action first. */
export function feedItems(portfolioId) {
  return store.negotiations
    .filter((n) => inBook(stateOf(n), portfolioId))
    .map((n) => ({ ...n, fire: n.lastMonth ? n.fire : store.fireById.get(n.fireId) }))
    .sort((a, b) => b.feed.lastAction.day.localeCompare(a.feed.lastAction.day) || (a.lastMonth ? 1 : 0) - (b.lastMonth ? 1 : 0) || a.id.localeCompare(b.id))
}

export function applyFeedFilters(items, f) {
  return items.filter((n) => (f.status === 'All' || n.feed.group === f.status) && (f.type === 'All' || n.counterpartyType === f.type) && (f.payer === 'all' || n.feed.payers.includes(f.payer)))
}

/** Headline tiles for the page: fires with an agent, agreed work, saving at agreed plans, decisions due this week. */
export function feedSummary(items) {
  const live = items.filter((n) => !n.lastMonth)
  const issue = store.meta.issueDate
  const week = addDays(issue, 7)
  const open = new Set(['Identified', 'In negotiation'])
  return {
    live: live.length,
    agreedCost: live.reduce((s, n) => s + n.ledger.cost, 0),
    agreedSaving: live.reduce((s, n) => s + n.ledger.saving, 0),
    agreedCount: live.filter((n) => n.ledger.cost > 0).length,
    dueThisWeek: live.filter((n) => open.has(n.feed.group) && n.decisionDue >= issue && n.decisionDue <= week).length,
    declined: items.reduce((s, n) => s + n.entries.filter((e) => e.declined).length, 0),
  }
}
