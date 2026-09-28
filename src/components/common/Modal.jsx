import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

/** Centred dialog over a dimmed backdrop. Escape or the backdrop closes it. */
export default function Modal({ title, icon: Icon, onClose, children, footer, width = 520 }) {
  const titleId = useId()
  const dialog = useRef(null)

  useEffect(() => {
    dialog.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialog} style={{ width }}>
        <header className="modal-head">
          {Icon && (
            <span className="modal-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
          )}
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  )
}
