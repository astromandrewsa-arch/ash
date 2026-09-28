import { ChevronRight } from 'lucide-react'
import { stages } from '../../lib/data.js'
import { isAgreed } from '../../lib/agent.js'
import { dayMonth } from '../../lib/dates.js'
import { formatUSDCompact } from '../../lib/format.js'
import Avatar from '../common/Avatar.jsx'
import RagPill from '../common/RagPill.jsx'

const RAG_FOR = { identified: 'red', engaged: 'amber', negotiation: 'amber', agreed: 'green', complete: 'green', prevented: 'green', declined: 'red' }

export default function NegotiationCard({ item, onOpen }) {
  const { process: p, stage, headline, last, next } = item
  const label = stage === 'declined' ? 'Declined' : stages.find((s) => s.id === stage).label
  const l = p.ledger

  return (
    <article className="card feed-card" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <header className="feed-card-head">
        <h2 className="feed-headline">{headline}</h2>
        <RagPill rag={RAG_FOR[stage]} label={label} />
      </header>
      <div className="feed-card-body">
        <div className="feed-people">
          <Avatar name={p.agent.name} size="sm" />
          <div>
            <strong>{p.agent.name}</strong>
            <span>with {p.primaryCounterpart}</span>
          </div>
        </div>
        <dl className="feed-actions">
          <div>
            <dt>Last action · {dayMonth(last.date)}</dt>
            <dd className={last.refusal ? 'is-refusal' : ''}>{last.text}</dd>
          </div>
          <div>
            <dt>Next action{next ? ` · ${dayMonth(next.date)}` : ''}</dt>
            <dd className="is-next">{next ? next.text : 'None — process closed'}</dd>
          </div>
        </dl>
        <div className="feed-money">
          {isAgreed(p) && (
            <>
              <span>
                Cost <strong>{formatUSDCompact(l.cost)}</strong>
              </span>
              <span className="is-saving">
                Saving <strong>{formatUSDCompact(l.premiumSaved5yr + l.lossAvoided)}</strong>
              </span>
            </>
          )}
          {l.realisedLoss !== undefined && (
            <span className="is-loss">
              Realised loss <strong>{formatUSDCompact(l.realisedLoss)}</strong>
            </span>
          )}
          <ChevronRight size={18} className="feed-open" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
