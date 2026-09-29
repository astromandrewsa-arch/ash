/** A headline figure with its label and an optional note under it (v2 pages); `plain` keeps text values like "1-in-16" proportional. */
export default function KpiTile({ label, value, note, tone, plain = false }) {
  return (
    <div className={`kpi glass${tone ? ` tone-${tone}` : ''}${plain ? ' is-plain' : ''}`}>
      <span className="label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {note && <span className="kpi-note">{note}</span>}
    </div>
  )
}
