import useApp from '../../state/useApp.js'
import { fireById } from '../../lib/data.js'
import FireDetail from './FireDetail.jsx'
import AgentView from './AgentView.jsx'

/** Right-hand drawer: the fire detail, or the agent process once handed off. */
export default function DetailDrawer() {
  const { drawerOpen, selection } = useApp()
  const fire = selection ? fireById[selection.fireId] : null
  const mode = selection?.mode === 'agent' || !fire ? 'agent' : 'detail'

  return (
    <aside className={`drawer${drawerOpen ? ' is-open' : ''}`} aria-label="Fire detail" aria-hidden={!drawerOpen} inert={!drawerOpen}>
      {selection && mode === 'detail' && <FireDetail key={fire.id} fire={fire} />}
      {selection && mode === 'agent' && <AgentView key={selection.fireId} fireId={selection.fireId} />}
    </aside>
  )
}
