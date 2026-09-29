import { Flame } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { VIEWS } from '../../config/views.js'
import RailButton from './RailButton.jsx'

export default function Rail() {
  const { activeView, setActiveView, helpOpen, setHelpOpen } = useApp()
  const top = VIEWS.filter((view) => !view.bottom)
  const bottom = VIEWS.filter((view) => view.bottom)

  const renderItem = (view) => (
    <RailButton
      key={view.id}
      view={view}
      active={view.modal ? helpOpen : activeView === view.id}
      onSelect={() => (view.modal ? setHelpOpen(true) : setActiveView(view.id))}
    />
  )

  return (
    <nav className="rail" aria-label="Main">
      <div className="rail-logo" aria-hidden="true">
        <Flame size={22} strokeWidth={2.2} />
      </div>
      <div className="rail-items">{top.map(renderItem)}</div>
      <div className="rail-items rail-items-bottom">{bottom.map(renderItem)}</div>
    </nav>
  )
}
