import { Info } from 'lucide-react'

/** One Texas market figure with an info button that opens its source in Help. */
export default function ContextTile({ tile, onInfo }) {
  return (
    <div className="ctx-tile glass">
      <div className="ctx-top">
        <span className="label">{tile.label}</span>
        <button type="button" className="ctx-info" onClick={onInfo} aria-label={`Source: ${tile.label}`} title={tile.source}>
          <Info size={14} />
        </button>
      </div>
      <strong className={`ctx-value${tile.value.length > 14 ? ' is-long' : ''}`}>{tile.value}</strong>
      <span className="ctx-note">{tile.note}</span>
    </div>
  )
}
