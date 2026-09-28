import { useState } from 'react'
import { CalendarClock, ChevronDown, Search } from 'lucide-react'
import forecast from '../../data/forecast.json'
import user from '../../data/user.json'
import useApp from '../../state/useApp.js'
import { resolveSearch, searchSuggestions } from '../../lib/search.js'

export default function TopBar() {
  const { openFire, flyToHome } = useApp()
  const [forecastId, setForecastId] = useState(forecast.options[0].id)
  const [query, setQuery] = useState('')
  const [miss, setMiss] = useState(null)

  const onSubmit = (e) => {
    e.preventDefault()
    const hit = resolveSearch(query)
    if (!hit) {
      setMiss(query.trim() ? `No fire, place or policy matches “${query.trim()}”` : null)
      return
    }
    setMiss(null)
    e.currentTarget.querySelector('input')?.blur()
    if (hit.type === 'fire') openFire(hit.id)
    else flyToHome(hit.id)
  }

  return (
    <header className="topbar">
      <div className="wordmark">
        <span className="wordmark-name">Pyrome</span>
        <span className="wordmark-tag">Insurer Portal</span>
      </div>

      <label className="select-control forecast-select">
        <CalendarClock size={16} className="select-control-icon" aria-hidden="true" />
        <select value={forecastId} onChange={(e) => setForecastId(e.target.value)} aria-label="Forecast">
          {forecast.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="select-control-caret" aria-hidden="true" />
      </label>

      <form className="search" role="search" onSubmit={onSubmit}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          list="search-suggestions"
          onChange={(e) => {
            setQuery(e.target.value)
            setMiss(null)
          }}
          placeholder="Search a place, policy, or fire ID"
          aria-label="Search a place, policy, or fire ID"
        />
        <datalist id="search-suggestions">
          {searchSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {miss && (
          <span className="search-miss" role="status">
            {miss}
          </span>
        )}
      </form>

      <div className="avatar" title={`${user.name} — ${user.role}`}>
        {user.initials}
      </div>
    </header>
  )
}
