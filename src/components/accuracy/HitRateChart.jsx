import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { palette } from '../../styles/palette.js'
import HitRateTip from './HitRateTip.jsx'

const HEIGHT = 300

/**
 * Hit rate by lead time (§16): PRIMER in orange across its 30-day horizon; the short-range models
 * in blue only inside their horizons, each ending on a "horizon ends" marker; the cat models as
 * flat long-run lines, because they carry no lead time at all.
 */
export default function HitRateChart({ models, leads }) {
  const c = palette()
  const primer = models.find((m) => m.family === 'primer')
  const short = models.filter((m) => m.family === 'short')
  const cat = models.filter((m) => m.family === 'cat')
  const blues = [c.blue, c.blueSoft, '#9DBDEB']
  const colour = new Map(short.map((m, i) => [m.id, blues[i % blues.length]]))
  const rows = leads.map((lead) => {
    const row = { lead }
    for (const m of [primer, ...short]) {
      const v = m.hitRateByLead[lead]
      row[m.id] = v == null ? null : Math.round(v * 100)
    }
    for (const m of cat) row[m.id] = Math.round(m.longRunHitRate * 100)
    return row
  })
  const tick = { fill: 'rgba(243, 241, 236, 0.55)', fontSize: 11 }
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <LineChart data={rows} margin={{ top: 16, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="rgba(243, 241, 236, 0.07)" vertical={false} />
        <XAxis dataKey="lead" type="number" domain={[0, 31]} ticks={leads} tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} d`} />
        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={tick} axisLine={false} tickLine={false} unit="%" width={44} />
        <Tooltip content={<HitRateTip models={models} />} cursor={{ stroke: 'rgba(243, 241, 236, 0.25)' }} isAnimationActive={false} />
        {cat.map((m) => (
          <Line key={m.id} dataKey={m.id} name={m.name} stroke="rgba(143, 180, 234, 0.45)" strokeWidth={1.2} strokeDasharray="2 4" dot={false} isAnimationActive={false} />
        ))}
        <ReferenceLine
          y={Math.round(Math.max(...cat.map((m) => m.longRunHitRate)) * 100) + 5}
          stroke="none"
          label={{ value: 'Cat models: long-run rate, no date', position: 'insideTopRight', fill: 'rgba(169, 199, 240, 0.85)', fontSize: 10.5 }}
        />
        {short.map((m) => (
          <Line key={m.id} dataKey={m.id} name={m.name} stroke={colour.get(m.id)} strokeWidth={2} dot={{ r: 3, fill: colour.get(m.id), strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />
        ))}
        {short.map((m) => (
          <ReferenceDot
            key={`${m.id}-end`}
            x={m.horizonDays}
            y={Math.round(m.hitRateByLead[m.horizonDays] * 100)}
            r={6}
            fill="none"
            stroke={colour.get(m.id)}
            strokeWidth={1.5}
            label={{ value: `${m.shortName} horizon ends`, position: 'right', offset: 10, fill: colour.get(m.id), fontSize: 10.5 }}
          />
        ))}
        <Line dataKey={primer.id} name={primer.name} stroke={c.orange} strokeWidth={3} dot={{ r: 4, fill: c.orange, strokeWidth: 0 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
