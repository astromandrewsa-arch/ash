import useApp from '../../state/useApp.js'
import ContextTile from './ContextTile.jsx'

/** §15 Texas market context across the top of Premium Intelligence. */
export default function ContextTiles({ tiles }) {
  const { openHelp } = useApp()
  return (
    <div className="ctx-row" aria-label="Texas market context">
      {tiles.map((t) => (
        <ContextTile key={t.id} tile={t} onInfo={() => openHelp('sources')} />
      ))}
    </div>
  )
}
