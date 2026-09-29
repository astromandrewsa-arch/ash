import { FileText } from 'lucide-react'
import { store } from '../../lib/store.js'
import ExportButton from '../common/ExportButton.jsx'

const PAGES = [
  'Cover: fire, header line, severity, issued stamp',
  'Forecast and fuel state, both clocks',
  'Spread maps at 1, 8, 24 and 48 h',
  'Exposure by band',
  'Loss with inclusions and exclusions',
  'Plan and payers',
  'Negotiation status',
  'Methods and disclaimer',
]

/** Export (§17): what the per-fire report holds, and the button that builds and downloads it. */
export default function ExportTab({ fire }) {
  return (
    <div className="mi-export">
      <div className="export-card">
        <FileText size={22} aria-hidden="true" />
        <div>
          <strong>Fire report · {fire.id} {fire.name}</strong>
          <span>pyrome-{fire.id}-{store.meta.issueDate}.pdf</span>
        </div>
      </div>
      <ol className="export-pages">
        {PAGES.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      <ExportButton fire={fire} className="mi-export-action" />
    </div>
  )
}
