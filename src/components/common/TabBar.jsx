import { useRef } from 'react'

/** Accessible tab row: arrow keys move between tabs, the active tab carries the orange underline. */
export default function TabBar({ tabs, active, onChange, label, idPrefix, className = '' }) {
  const refs = useRef({})
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === active)
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null
    if (next === null) return
    e.preventDefault()
    const t = tabs[(next + tabs.length) % tabs.length]
    onChange(t.id)
    refs.current[t.id]?.focus()
  }
  return (
    <div className={`tabbar ${className}`} role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => (
        <button
          key={t.id}
          ref={(el) => (refs.current[t.id] = el)}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${t.id}`}
          aria-controls={`${idPrefix}-panel`}
          aria-selected={t.id === active}
          tabIndex={t.id === active ? 0 : -1}
          className={`tab${t.id === active ? ' is-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
