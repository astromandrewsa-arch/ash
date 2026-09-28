import { Flame, X } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { presetById, processByFireId } from '../../lib/data.js'
import { dateRange, dayMonth, fullDate } from '../../lib/dates.js'
import RagPill from '../common/RagPill.jsx'

export default function FireHeader({ fire }) {
  const { closeDrawer, preset } = useApp()
  const process = processByFireId[fire.id]
  const { window: w, wideWindow } = fire

  return (
    <header className="drawer-head fire-head">
      <div className="fire-head-top">
        <span className="fire-head-icon" aria-hidden="true">
          <Flame size={18} />
        </span>
        <div className="fire-head-title">
          <h2>
            {fire.id}
            <span className="fire-head-place">
              {fire.place}, {fire.county}
            </span>
          </h2>
        </div>
        <button type="button" className="icon-button" onClick={closeDrawer} aria-label="Close and return to portfolio">
          <X size={18} />
        </button>
      </div>
      <div className="fire-head-meta">
        <span className="fire-head-date">Predicted {fullDate(fire.predictedDate)}</span>
        {process && <RagPill rag={process.rag} label={process.stageLabel} />}
      </div>
      <p className="fire-head-window">
        Burns {dateRange(w.start, w.end)}, {w.days} days
      </p>
      <p className="fire-head-lead">
        Called {dayMonth(fire.calledOn)}, {fire.leadTimeDays} days ahead; window narrowed from {wideWindow.days} to {w.days}{' '}
        days · <span className="fire-head-preset">{presetById[preset].label}</span>
      </p>
    </header>
  )
}
