import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * A themed single-select listbox (the browser's native select menu breaks the dark theme).
 * options: [{ value, label }]. The button reads "Label: current".
 */
export default function Dropdown({ label, value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef(null)
  const button = useRef(null)
  const current = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const choose = (v) => {
    setOpen(false)
    button.current?.focus()
    if (v !== value) onChange(v)
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
      choose(options[active].value)
    } else if (open && e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
  }

  const isDefault = value === options[0].value
  return (
    <div className={`dropdown ${className}`} ref={root}>
      <button
        ref={button}
        type="button"
        className={`dropdown-button${open ? ' is-open' : ''}${isDefault ? '' : ' is-set'}`}
        onClick={() => {
          setActive(Math.max(0, options.indexOf(current)))
          setOpen((v) => !v)
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
      >
        <span className="dropdown-label">{label}</span>
        <span className="dropdown-value">{current.label}</span>
        <ChevronDown size={14} className="dropdown-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li key={String(o.value)}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`dropdown-option${i === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o.value)}
              >
                <span>{o.label}</span>
                {o.value === value && <Check size={14} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
