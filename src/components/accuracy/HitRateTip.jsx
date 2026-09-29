/** Tooltip for the hit-rate chart: every model with a figure at this lead time, PRIMER first. */
export default function HitRateTip({ active, payload, label, models }) {
  if (!active || !payload?.length) return null
  const byId = new Map(models.map((m) => [m.id, m]))
  const rows = payload
    .filter((p) => p.value != null)
    .map((p) => ({ m: byId.get(p.dataKey), value: p.value, color: p.stroke || p.color }))
    .filter((r) => r.m)
    .sort((a, b) => (a.m.family === 'primer' ? -1 : b.m.family === 'primer' ? 1 : b.value - a.value))
  return (
    <div className="chart-tip hit-tip">
      <strong>{label} days ahead</strong>
      {rows.map((r) => (
        <span key={r.m.id}>
          <i style={{ background: r.color }} />
          {r.m.shortName}
          {r.m.family === 'cat' ? ' (long run, no date)' : ''} <b>{r.value}%</b>
        </span>
      ))}
    </div>
  )
}
