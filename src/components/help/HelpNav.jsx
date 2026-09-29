/** The Help dialog's table of contents. */
export default function HelpNav({ sections, active, onGo }) {
  return (
    <nav className="help-nav" aria-label="Help topics">
      {sections.map((s) => (
        <button key={s.id} type="button" className={s.id === active ? 'is-active' : undefined} aria-current={s.id === active ? 'true' : undefined} onClick={() => onGo(s.id)}>
          {s.title}
        </button>
      ))}
    </nav>
  )
}
