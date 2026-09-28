import { Flame } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { VIEWS } from '../../config/views.js'
import RailButton from './RailButton.jsx'

export default function IconRail() {
  const { activeView, setActiveView } = useApp()
  const top = VIEWS.filter((view) => !view.bottom)
  const bottom = VIEWS.filter((view) => view.bottom)

  const renderItem = (view) => (
    <RailButton
      key={view.id}
      view={view}
      active={activeView === view.id}
      onSelect={() => setActiveView(view.id)}
    />
  )

  return (
    <nav className="rail" aria-label="Main">
      <div className="rail-logo" aria-hidden="true">
        <Flame size={26} strokeWidth={2.25} />
      </div>
      <div className="rail-items">{top.map(renderItem)}</div>
      <div className="rail-items rail-items-bottom">{bottom.map(renderItem)}</div>
    </nav>
  )
}
