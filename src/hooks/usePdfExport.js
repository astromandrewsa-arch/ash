import { useCallback, useState } from 'react'

/**
 * Run a PDF export with a progress state: { busy, message, progress, result, error, run }.
 * The report modules load on first use, so jsPDF stays out of the first page load.
 */
export default function usePdfExport() {
  const [state, setState] = useState({ busy: false, message: '', progress: 0, result: null, error: null })
  const run = useCallback(async (job) => {
    setState({ busy: true, message: 'Preparing the report', progress: 0.05, result: null, error: null })
    try {
      const result = await job((message, progress) => setState((s) => ({ ...s, message, progress: progress ?? s.progress })))
      setState({ busy: false, message: '', progress: 1, result, error: null })
      return result
    } catch (err) {
      setState({ busy: false, message: '', progress: 0, result: null, error: err.message || String(err) })
      return null
    }
  }, [])
  return { ...state, run }
}
