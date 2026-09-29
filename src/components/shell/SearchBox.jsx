import { useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { SEARCH_KIND_LABEL, searchIndex } from '../../lib/search.js'
import { inBook } from '../../lib/selectors.js'
import { store } from '../../lib/store.js'

/** Search a place, fire ID, asset or bundle; the pick flies the map there and opens its card (§4). */
export default function SearchBox() {
  const { select, portfolioId, setPortfolio } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const input = useRef(null)
  const results = useMemo(() => searchIndex(query), [query])

  const go = (hit) => {
    if (!hit) return
    setOpen(false)
    setQuery('')
    input.current?.blur()
    // Something outside the current book switches to the book that holds it.
    if (hit.state && !inBook(hit.state, portfolioId)) {
      const other = store.portfolio.portfolios.find((p) => p.states.includes(hit.state))
      if (other) setPortfolio(other.id, { fly: false })
    }
    select(hit.kind === 'watch' ? 'area' : hit.kind, hit.id)
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
      go(results[active] || results[0])
    } else if (e.key === 'Escape') {
      e.stopPropagation()
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
            <li key={`${r.kind}:${r.id}:${r.label}`}>
              <button
                type="button"
                className={`search-result${i === active ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
                role="option"
                aria-selected={i === active}
              >
                <span className="search-result-main">
                  <span className="search-result-label">{r.label}</span>
                  <span className="search-result-sub">{r.sub}</span>
                </span>
                <span className="search-result-kind">{SEARCH_KIND_LABEL[r.kind]}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="search-empty">No fire, place, asset or bundle matches “{query.trim()}”.</li>}
        </ul>
      )}
    </div>
  )
}
