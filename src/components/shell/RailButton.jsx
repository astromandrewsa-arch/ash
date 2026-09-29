export default function RailButton({ view, active, onSelect }) {
  const Icon = view.icon
  return (
    <button
      type="button"
      className={`rail-item${active ? ' is-active' : ''}`}
      onClick={onSelect}
      aria-label={view.label}
      aria-current={active ? 'page' : undefined}
      data-view={view.id}
    >
      <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
      <span className="rail-tip" aria-hidden="true">
        {view.label}
      </span>
    </button>
  )
}
