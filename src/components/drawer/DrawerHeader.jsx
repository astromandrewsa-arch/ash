import { X } from 'lucide-react'

/** Title block shared by every drawer card: icon, kicker, title, subtitle and the close button. */
export default function DrawerHeader({ icon, kicker, title, subtitle, onClose, children }) {
  return (
    <header className="dh">
      <div className="dh-row">
        {icon && <span className="dh-icon">{icon}</span>}
        <div className="dh-titles">
          {kicker && <span className="label dh-kicker">{kicker}</span>}
          <h2 className="dh-title">{title}</h2>
          {subtitle && <p className="dh-sub">{subtitle}</p>}
        </div>
        <button type="button" className="icon-btn dh-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      {children}
    </header>
  )
}
