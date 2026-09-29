import { Compass } from 'lucide-react'
import { meta } from '../../lib/shellData.js'
import ForecastStamp from './ForecastStamp.jsx'
import PortfolioSwitch from './PortfolioSwitch.jsx'
import SearchBox from './SearchBox.jsx'

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="wordmark">
        <span className="wordmark-name">Pyrome</span>
        <span className="wordmark-tag">Insurer Portal</span>
      </div>
      <ForecastStamp />
      <PortfolioSwitch />
      <SearchBox />
      <button type="button" className="btn btn-ghost tour-button" aria-label="Take a tour">
        <Compass size={16} aria-hidden="true" />
        Take a tour
      </button>
      <div className="avatar" title={`${meta.user.name} — ${meta.user.role}`}>
        {meta.user.initials}
      </div>
    </header>
  )
}
