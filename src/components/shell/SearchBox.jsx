import { useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { resolveSearch, searchSuggestions } from '../../lib/search.js'

const MAX_RESULTS = 8

/** Search a place, fire ID, asset or bundle; suggestions open under the box. */
export default function SearchBox() {
  const { openFire, flyToHome } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [miss, setMiss] = useState(false)
  const input = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return searchSuggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
  }, [query])

  const go = (text) => {
    const hit = resolveSearch(text)
    if (!hit) {
      setMiss(true)
      setOpen(true)
      return
    }
    setMiss(false)
    setOpen(false)
    setQuery('')
    input.current?.blur()
    if (hit.type === 'fire') openFire(hit.id)
    else flyToHome(hit.id)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(resolveSearch(query) || !results[active] ? query : results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      input.current?.blur()
    }
  }

  return (
    <div className="search" role="search">
      <Search size={15} aria-hidden="true" />
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setMiss(false)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        placeholder="Search a place, fire ID, asset or bundle"
        aria-label="Search a place, fire ID, asset or bundle"
        autoComplete="off"
        spellCheck={false}
      />
      {open && query.trim() && (
        <ul className="search-results glass" role="listbox">
          {results.map((r, i) => (
            <li key={r}>
              <button
                type="button"
                className={`search-result${i === active ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r)}
                role="option"
                aria-selected={i === active}
              >
                {r}
              </button>
            </li>
          ))}
          {(miss || results.length === 0) && <li className="search-empty">No fire, place, asset or bundle matches “{query.trim()}”.</li>}
        </ul>
      )}
    </div>
  )
}
