import { FileDown, FileText } from 'lucide-react'

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

/** Export (§17): what the per-fire report holds. The generator itself arrives in pass 11. */
export default function ExportTab({ fire }) {
  return (
    <div className="mi-export">
      <div className="export-card">
        <FileText size={22} aria-hidden="true" />
        <div>
          <strong>Fire report · {fire.id} {fire.name}</strong>
          <span>pyrome-{fire.id}-{fire.called}.pdf</span>
        </div>
      </div>
      <ol className="export-pages">
        {PAGES.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      <button type="button" className="btn btn-primary" disabled aria-disabled="true">
        <FileDown size={16} aria-hidden="true" />
        PDF export arrives in pass 11
      </button>
    </div>
  )
}
