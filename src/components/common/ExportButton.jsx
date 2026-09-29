import { Download, LoaderCircle } from 'lucide-react'
import useApp from '../../state/useApp.js'
import usePdfExport from '../../hooks/usePdfExport.js'
import { portfolioOf } from '../../lib/selectors.js'

/** "Export fire report (PDF)": builds the §17 report for one fire and downloads it. */
export default function ExportButton({ fire, primary = true, className = '' }) {
  const { portfolioId } = useApp()
  const exp = usePdfExport()
  const onClick = () =>
    exp.run(async (progress) => {
      const { exportFireReport } = await import('../../lib/pdf/fireReport.js')
      return exportFireReport(fire, { bookName: portfolioOf(portfolioId).name, onProgress: progress })
    })
  return (
    <div className={`export-action ${className}`}>
      <button type="button" className={`btn btn-block${primary ? ' btn-primary' : ''}`} onClick={onClick} disabled={exp.busy} aria-busy={exp.busy}>
        {exp.busy ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <Download size={15} aria-hidden="true" />}
        {exp.busy ? exp.message : 'Export fire report (PDF)'}
      </button>
      {exp.result && !exp.busy && (
        <span className="export-done" role="status">
          Downloaded {exp.result.name} · {exp.result.pages} pages
        </span>
      )}
      {exp.error && (
        <span className="export-error" role="alert">
          The report could not be built: {exp.error}
        </span>
      )}
    </div>
  )
}
