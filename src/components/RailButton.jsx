export default function RailButton({ view, active, onSelect }) {
  const Icon = view.icon
  return (
    <button
      type="button"
      className={`rail-item${active ? ' is-active' : ''}`}
      onClick={onSelect}
      title={view.label}
      aria-label={view.label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={20} strokeWidth={1.9} />
      <span className="rail-item-label">{view.shortLabel}</span>
    </button>
  )
}
