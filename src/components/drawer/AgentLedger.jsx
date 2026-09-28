import { FileText } from 'lucide-react'
import { isAgreed } from '../../lib/agent.js'
import { formatUSDCompact } from '../../lib/format.js'

/** Ledger line: cost, saving, status and the documents attached to the process. */
export default function AgentLedger({ process }) {
  const l = process.ledger
  const burned = l.realisedLoss !== undefined
  const agreed = isAgreed(process)
  const saving = burned ? null : l.premiumSaved5yr + l.lossAvoided

  const cells = burned
    ? [
        { label: 'Proposed cost', value: formatUSDCompact(l.proposedCost) },
        { label: 'Realised loss', value: formatUSDCompact(l.realisedLoss), tone: 'loss' },
      ]
    : [
        { label: agreed ? 'Cost' : 'Proposed cost', value: formatUSDCompact(l.cost) },
        { label: agreed ? 'Saving' : 'Potential saving', value: formatUSDCompact(saving), tone: 'saving' },
      ]

  return (
    <section className="ledger">
      <h3 className="timeline-title">Ledger</h3>
      <div className="ledger-line">
        {cells.map((c) => (
          <div key={c.label} className={c.tone ? `is-${c.tone}` : ''}>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
        <div>
          <span>Status</span>
          <strong>{l.status}</strong>
        </div>
      </div>
      <ul className="documents" aria-label="Documents attached">
        {l.documents.map((d) => (
          <li key={d.name}>
            <FileText size={15} aria-hidden="true" />
            <span className="documents-name">{d.name}</span>
            <span className="documents-size">{d.sizeKb >= 1000 ? `${(d.sizeKb / 1000).toFixed(1)} MB` : `${d.sizeKb} KB`}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
