import { Download, FileText } from 'lucide-react'
import { fires, processes, reports, seasonStats } from '../../lib/data.js'
import { formatHa, formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import Modal from '../common/Modal.jsx'

// A one-line figure for each report section, drawn from the data files.
function sectionFigure(id) {
  const s = seasonStats
  if (id === 'dated-hectares') return `${formatHa(s.hectaresDated)} last season · ${formatHa(fires.reduce((t, f) => t + f.spread.finalHectares, 0))} in the current forecast`
  if (id === 'scored-forecasts') return `${formatNumber(s.scoredForecasts)} forecasts · Brier ${s.brierScore.primer.toFixed(3)}`
  if (id === 'intervention-ledger') return `${processes.length} agent processes · ${formatUSDCompact(s.premiumSaved)} premium saved`
  if (id === 'accuracy') return `${formatPct(s.hitRate14.primer)} hit rate at 14 days`
  return ''
}

export default function ReportModal({ onClose }) {
  const r = reports.seasonReport
  return (
    <Modal
      title="Export season report"
      icon={FileText}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            <Download size={16} aria-hidden="true" /> Download
          </button>
        </>
      }
    >
      <div className="report-file">
        <span className="report-file-icon" aria-hidden="true">
          PDF
        </span>
        <div>
          <strong>{r.fileName}</strong>
          <span>
            {r.fileSizeMb} MB · {r.pages} pages
          </span>
        </div>
      </div>
      <h3 className="modal-subhead">Contents</h3>
      <ol className="report-contents">
        {r.sections.map((sec) => (
          <li key={sec.id}>
            <strong>{sec.title}</strong>
            <span>{sec.description}</span>
            <em>{sectionFigure(sec.id)}</em>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
