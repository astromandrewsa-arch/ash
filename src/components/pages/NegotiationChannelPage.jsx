import { useState } from 'react'
import { Handshake } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { FEED_FILTERS, feedItems } from '../../lib/feed.js'
import PageHeader from '../common/PageHeader.jsx'
import NegotiationCard from './NegotiationCard.jsx'

/** CLAUDE.md §8: live feed of every fire a Pyrome agent is working, newest first. */
export default function NegotiationChannelPage() {
  const { handedOff, openFire } = useApp()
  const [filter, setFilter] = useState('all')
  const items = feedItems(handedOff)
  const shown = filter === 'all' ? items : items.filter((i) => i.group === filter)
  const count = (id) => (id === 'all' ? items.length : items.filter((i) => i.group === id).length)

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHeader
        icon={Handshake}
        title="Pyrome Negotiation Channel"
        summary="Every fire your Pyrome agents are working with government and landowners."
        aside={
          <span className="live-badge">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
        }
      />
      <div className="chips" role="group" aria-label="Filter by status">
        {FEED_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip${filter === f.id ? ' is-active' : ''}`}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="chip-count">{count(f.id)}</span>
          </button>
        ))}
      </div>
      <div className="feed">
        {shown.map((item) => (
          <NegotiationCard key={item.process.fireId} item={item} onOpen={() => openFire(item.process.fireId, 'agent')} />
        ))}
        {shown.length === 0 && <p className="feed-empty">No fires at this stage right now.</p>}
      </div>
    </section>
  )
}
