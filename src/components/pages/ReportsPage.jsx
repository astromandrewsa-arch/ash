import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { reports, seasonStats } from '../../lib/data.js'
import PageHeader from '../common/PageHeader.jsx'
import ReportModal from './ReportModal.jsx'

/** CLAUDE.md §10: one button that opens the season report export. */
export default function ReportsPage() {
  const [open, setOpen] = useState(false)
  const r = reports.seasonReport

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHeader icon={FileText} title="Reports" summary="Season reporting for underwriting, reinsurance and your board." />
      <div className="card report-hero">
        <div className="report-hero-text">
          <h2>{r.title}</h2>
          <p>
            Dated hectares, scored forecasts, the intervention ledger and accuracy against other models for the {seasonStats.season}{' '}
            season, in one PDF.
          </p>
        </div>
        <button type="button" className="export-button" onClick={() => setOpen(true)}>
          <Download size={20} aria-hidden="true" />
          Export season report (PDF)
        </button>
      </div>
      {open && <ReportModal onClose={() => setOpen(false)} />}
    </section>
  )
}
