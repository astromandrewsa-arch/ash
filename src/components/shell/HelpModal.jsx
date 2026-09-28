import { CircleHelp } from 'lucide-react'
import { forecast } from '../../lib/data.js'
import useApp from '../../state/useApp.js'
import Modal from '../common/Modal.jsx'

/** The three forecast terms, in plain words. */
export default function HelpModal() {
  const { helpOpen, setHelpOpen } = useApp()
  if (!helpOpen) return null
  return (
    <Modal title="How PRIMER dates a fire" icon={CircleHelp} onClose={() => setHelpOpen(false)}>
      <div className="help-terms">
        {forecast.terms.map((t) => (
          <section key={t.term}>
            <h3>{t.term}</h3>
            <p>{t.text}</p>
          </section>
        ))}
      </div>
    </Modal>
  )
}
