import { useEffect, useRef, useState } from 'react'
import { Briefcase, Check, ChevronDown } from 'lucide-react'
import useApp from '../../state/useApp.js'
import { store } from '../../lib/store.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'

/** Portfolio switch (§4): a themed listbox instead of the browser's native select menu. */
export default function PortfolioSwitch() {
  const { portfolioId, setPortfolio } = useApp()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const button = useRef(null)
  const options = store.portfolio.portfolios
  const current = options.find((p) => p.id === portfolioId) || options[0]

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const choose = (id) => {
    setOpen(false)
    button.current?.focus()
    if (id !== portfolioId) setPortfolio(id)
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setActive(Math.max(0, options.indexOf(current)))
      setOpen(true)
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      choose(options[active].id)
    } else if (open && e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div className="portfolio" ref={root}>
      <button
        ref={button}
        type="button"
        className={`portfolio-button${open ? ' is-open' : ''}`}
        onClick={() => {
          setActive(Math.max(0, options.indexOf(current)))
          setOpen((v) => !v)
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Portfolio: ${current.name}`}
      >
        <Briefcase size={15} className="muted" aria-hidden="true" />
        <span className="portfolio-name">{current.name}</span>
        <ChevronDown size={15} className="portfolio-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="portfolio-menu glass" role="listbox" aria-label="Portfolio">
          {options.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === portfolioId}
                className={`portfolio-option${i === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(p.id)}
              >
                <span className="portfolio-option-main">
                  <span className="portfolio-option-name">{p.name}</span>
                  <span className="portfolio-option-sub">
                    {formatNumber(p.totals.homes)} homes · {formatNumber(p.totals.assets)} assets · TIV {formatUSDCompact(p.totals.tiv)}
                  </span>
                </span>
                {p.id === portfolioId && <Check size={15} className="portfolio-check" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
