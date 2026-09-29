import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

/** Centred glass dialog over a dimmed backdrop (v2). Escape, the close button or the backdrop closes it. */
export default function Dialog({ title, icon: Icon, onClose, children, width = 640, bodyRef, className = '' }) {
  const titleId = useId()
  const dialog = useRef(null)
  useEffect(() => {
    dialog.current?.focus()
  }, [])
  return (
    <div className="dlg-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        className={`dlg ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ width }}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.stopPropagation()
          onClose()
        }}
      >
        <header className="dlg-head">
          {Icon && (
            <span className="dlg-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
          )}
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="dlg-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="dlg-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>
  )
}
