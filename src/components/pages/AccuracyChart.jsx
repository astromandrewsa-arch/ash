import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { models, seasonStats } from '../../lib/data.js'
import { palette } from '../../styles/palette.js'

const HEIGHT = 290

/** Hit rate by lead time: PRIMER in orange, comparison models in shades of Comparison Blue. */
export default function AccuracyChart() {
  const c = palette()
  const blues = [c.blue, c.blue2, c.blue3]
  const others = models.models.filter((m) => !m.isPrimer)
  const colour = (m) => (m.isPrimer ? c.orange : blues[others.indexOf(m)])
  const data = models.leadTimes.map((lead) => ({
    lead: `${lead} days`,
    ...Object.fromEntries(models.models.map((m) => [m.id, Math.round(m.hitRate[lead] * 100)])),
  }))
  const brierBest = Math.min(...Object.values(seasonStats.brierScore))

  return (
    <article className="card chart-card">
      <header className="card-head">
        <h2>Hit rate by lead time</h2>
        <span>Share of observed fires dated inside the window, by how far ahead the call was made</span>
      </header>
      <ResponsiveContainer width="100%" height={HEIGHT} initialDimension={{ width: 560, height: HEIGHT }}>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={c.border} vertical={false} />
          <XAxis dataKey="lead" tick={{ fontSize: 12, fill: c.muted }} tickLine={false} axisLine={{ stroke: c.border }} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: c.muted }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v, name) => [`${v}%`, name]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            itemSorter={(item) => models.models.findIndex((m) => m.id === item.dataKey)}
          />
          {models.models.map((m) => (
            <Line
              key={m.id}
              dataKey={m.id}
              name={m.name}
              stroke={colour(m)}
              strokeWidth={m.isPrimer ? 3.5 : 2}
              strokeDasharray={m.isPrimer ? undefined : '6 4'}
              dot={{ r: m.isPrimer ? 5 : 3.5, fill: colour(m), strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="brier-row" aria-label="Brier scores, lower is better">
        <span className="brier-title">Brier score (lower is better)</span>
        {models.models.map((m) => (
          <span key={m.id} className={`brier-item${seasonStats.brierScore[m.id] === brierBest ? ' is-best' : ''}`}>
            <span className="brier-swatch" style={{ background: colour(m) }} aria-hidden="true" />
            {m.name} <strong>{seasonStats.brierScore[m.id].toFixed(3)}</strong>
          </span>
        ))}
      </div>
    </article>
  )
}
