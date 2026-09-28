import { useState } from 'react'
import { CalendarClock, ChevronDown, Search } from 'lucide-react'
import forecast from '../data/forecast.json'
import user from '../data/user.json'

export default function TopBar() {
  const [forecastId, setForecastId] = useState(forecast.options[0].id)
  const [query, setQuery] = useState('')

  return (
    <header className="topbar">
      <div className="wordmark">
        <span className="wordmark-name">Pyrome</span>
        <span className="wordmark-tag">Insurer Portal</span>
      </div>

      <label className="select-control forecast-select">
        <CalendarClock size={16} className="select-control-icon" aria-hidden="true" />
        <select
          value={forecastId}
          onChange={(e) => setForecastId(e.target.value)}
          aria-label="Forecast"
        >
          {forecast.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select-control-caret" aria-hidden="true" />
      </label>

      <label className="search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a place, policy, or fire ID"
          aria-label="Search a place, policy, or fire ID"
        />
      </label>

      <div className="avatar" title={`${user.name} — ${user.role}`}>
        {user.initials}
      </div>
    </header>
  )
}
