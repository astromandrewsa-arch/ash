import { useState } from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { dayMonth } from '../../lib/dates.js'
import { formatUSDCompact } from '../../lib/format.js'
import { stageRag } from '../../lib/selectors.js'
import NegotiationTimeline from '../fire/NegotiationTimeline.jsx'

/** One negotiation in the feed (§12). A dated fire opens in its Negotiation tab; last month's expand in place. */
export default function FeedCard({ item: n, onOpen }) {
  const [open, setOpen] = useState(false)
  const [lead, ...rest] = n.feed.headline.split(' — dated')
  const last = n.feed.lastAction
  const act = () => (n.lastMonth ? setOpen((v) => !v) : onOpen(n.fireId))
  return (
    <article className={`feed-card glass${n.lastMonth ? ' is-past' : ''}`}>
      <button type="button" className="feed-main" onClick={act} aria-expanded={n.lastMonth ? open : undefined}>
        <span className="feed-top">
          <span className={`stage-pill rag-${n.ledger.status === 'Declined' ? 'red' : stageRag(n.stage)}`}>{n.ledger.status === 'Declined' ? 'Declined' : n.stage}</span>
          {n.lastMonth && <span className="feed-tag">Last month · {dayMonth(n.fire.date)}</span>}
          <span className="feed-go" aria-hidden="true">
            {n.lastMonth ? <ChevronDown size={16} className={open ? 'is-open' : undefined} /> : <ArrowUpRight size={16} />}
          </span>
        </span>
        <span className="feed-headline">
          <strong>{lead}</strong> — dated{rest.join(' — dated')}
        </span>
        <span className="feed-meta">
          <span className="feed-agent">
            <i aria-hidden="true">{n.agent.initials}</i>
            {n.agent.name}
          </span>
          <span>
            {n.counterparty} <em>{n.counterpartyType}</em>
          </span>
          {!n.lastMonth && <span>Decision due {dayMonth(n.decisionDue)}</span>}
        </span>
        <span className={`feed-line${last.declined || n.outcome ? ' is-declined' : ''}`}>
          <b>Last action · {dayMonth(last.day)}</b>
          {n.outcome || last.text}
        </span>
        {n.feed.nextAction && (
          <span className="feed-line">
            <b>Next</b>
            {n.feed.nextAction}
          </span>
        )}
        {n.ledger.cost > 0 && (
          <span className="feed-money">
            <span>
              Agreed <strong>{formatUSDCompact(n.ledger.cost)}</strong>
            </span>
            <span>
              Expected saving <strong className="is-saving">{formatUSDCompact(n.ledger.saving)}</strong>
            </span>
          </span>
        )}
      </button>
      {n.lastMonth && open && (
        <div className="feed-more">
          <NegotiationTimeline entries={n.entries} />
          <p className="feed-docs">{n.ledger.documents.join(' · ')}</p>
        </div>
      )}
    </article>
  )
}
