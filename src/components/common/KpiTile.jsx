/** A headline figure with its label and an optional note under it (v2 pages). */
export default function KpiTile({ label, value, note, tone }) {
  return (
    <div className={`kpi glass${tone ? ` tone-${tone}` : ''}`}>
      <span className="label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {note && <span className="kpi-note">{note}</span>}
    </div>
  )
}
