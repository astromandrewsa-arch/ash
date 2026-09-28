import { X } from 'lucide-react'
import useApp from '../state/useApp.js'

export default function DetailDrawer() {
  const { drawerOpen, selectedFireId, closeDrawer } = useApp()

  return (
    <aside
      className={`drawer${drawerOpen ? ' is-open' : ''}`}
      aria-label="Fire detail"
      aria-hidden={!drawerOpen}
      inert={!drawerOpen}
    >
      <header className="drawer-head">
        <span className="drawer-title">{selectedFireId ?? 'Fire detail'}</span>
        <button type="button" className="icon-button" onClick={closeDrawer} aria-label="Close">
          <X size={18} />
        </button>
      </header>
      <div className="drawer-body">
        <p className="drawer-empty">
          Select a dated fire on the map to see its forecast, spread and Intervention Plan.
        </p>
      </div>
    </aside>
  )
}
