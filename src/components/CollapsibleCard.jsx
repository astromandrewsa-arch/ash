import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CollapsibleCard({ title, icon: Icon, children, className = '' }) {
  const [open, setOpen] = useState(true)
  const bodyId = useId()

  return (
    <section className={`card collapsible ${className}`}>
      <button
        type="button"
        className="collapsible-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        {Icon && <Icon size={16} className="collapsible-icon" aria-hidden="true" />}
        <span className="collapsible-title">{title}</span>
        <ChevronDown
          size={16}
          className={`collapsible-caret${open ? '' : ' is-collapsed'}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="collapsible-body" id={bodyId}>
          {children}
        </div>
      )}
    </section>
  )
}
