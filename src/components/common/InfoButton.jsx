import { Info } from 'lucide-react'
import useApp from '../../state/useApp.js'

/** A small info icon that opens Help at one topic. */
export default function InfoButton({ topic, label, className = '' }) {
  const { openHelp } = useApp()
  return (
    <button type="button" className={`info-btn ${className}`} onClick={() => openHelp(topic)} aria-label={`Help: ${label}`} title={`Help: ${label}`}>
      <Info size={13} aria-hidden="true" />
    </button>
  )
}
