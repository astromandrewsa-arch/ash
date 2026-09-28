export default function StatTile({ label, value, note, tone }) {
  return (
    <div className={`card stat-tile${tone ? ` tone-${tone}` : ''}`}>
      <span className="stat-tile-label">{label}</span>
      <strong className="stat-tile-value">{value}</strong>
      {note && <span className="stat-tile-note">{note}</span>}
    </div>
  )
}
