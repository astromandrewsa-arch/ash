import { FileText } from 'lucide-react'
import { formatUSDCompact } from '../../lib/format.js'

/** Agreed cost, saving, status and the documents on file. */
export default function LedgerCard({ ledger }) {
  return (
    <div className="ledger-card">
      <dl className="ledger-figures">
        <div>
          <dt>Cost agreed</dt>
          <dd>{ledger.cost ? formatUSDCompact(ledger.cost) : 'None yet'}</dd>
        </div>
        <div>
          <dt>Saving</dt>
          <dd className={ledger.saving ? 'tone-green' : undefined}>{ledger.saving ? formatUSDCompact(ledger.saving) : 'None yet'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{ledger.status}</dd>
        </div>
      </dl>
      <ul className="documents">
        {ledger.documents.map((d) => (
          <li key={d}>
            <FileText size={14} aria-hidden="true" />
            {d}
          </li>
        ))}
      </ul>
    </div>
  )
}
