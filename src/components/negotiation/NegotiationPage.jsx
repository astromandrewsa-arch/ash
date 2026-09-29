import { useMemo, useState } from 'react'
import useApp from '../../state/useApp.js'
import { applyFeedFilters, FEED_DEFAULTS, feedItems, feedSummary } from '../../lib/negotiationFeed.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import KpiTile from '../common/KpiTile.jsx'
import FeedFilters from './FeedFilters.jsx'
import FeedCard from './FeedCard.jsx'

/** Negotiation Channel (§12): every fire a Pyrome agent is working, newest action first. */
export default function NegotiationPage() {
  const { portfolioId, select } = useApp()
  const [filters, setFilters] = useState(FEED_DEFAULTS)
  const items = useMemo(() => feedItems(portfolioId), [portfolioId])
  const shown = useMemo(() => applyFeedFilters(items, filters), [items, filters])
  const s = feedSummary(items)
  return (
    <section className="page2 negotiation" aria-labelledby="neg-title">
      <header className="page2-head">
        <div>
          <h1 id="neg-title">
            Negotiation Channel
            <span className="live-pill">
              <i aria-hidden="true" />
              Live
            </span>
          </h1>
          <p>Every fire your Pyrome agents are working with the state, counties, utilities and landowners, newest action first.</p>
        </div>
      </header>
      <div className="kpi-row">
        <KpiTile label="Fires with an agent" value={formatNumber(s.live)} note="dated in the next 30 days" />
        <KpiTile label="Work agreed" value={formatUSDCompact(s.agreedCost)} note={`on ${s.agreedCount} fires`} />
        <KpiTile label="Saving at agreed plans" value={formatUSDCompact(s.agreedSaving)} note="expected loss avoided" tone="saving" />
        <KpiTile label="Decisions due this week" value={formatNumber(s.dueThisWeek)} note="still in negotiation" />
        <KpiTile label="Declines logged" value={formatNumber(s.declined)} note="budget, cost or timing" tone="loss" />
      </div>
      <FeedFilters items={items} filters={filters} onChange={setFilters} shown={shown.length} />
      <div className="feed2">
        {shown.map((n) => (
          <FeedCard key={n.id} item={n} onOpen={(fireId) => select('fire', fireId, { tab: 'negotiation' })} />
        ))}
        {shown.length === 0 && (
          <div className="empty glass">
            <strong>No negotiations match these filters.</strong>
            <button type="button" className="btn" onClick={() => setFilters(FEED_DEFAULTS)}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
