import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatUSDCompact } from '../../lib/format.js'
import { palette } from '../../styles/palette.js'

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="chart-tip">
      <strong>{row.name}</strong>
      <span>{formatUSDCompact(row.value)}</span>
    </div>
  )
}

/** The three book totals with the carrier's cost as a thin fourth bar (§14). */
export default function OutcomeChart({ totals, outcome }) {
  const c = palette()
  const data = [
    { id: 'none', name: 'No intervention', value: totals.none, color: c.red },
    { id: 'asNegotiated', name: 'As negotiated', value: totals.asNegotiated, color: c.green },
    { id: 'fails', name: 'Every plan fails', value: totals.fails, color: c.amber },
    { id: 'carrier', name: 'Carrier cost', value: totals.carrier, color: c.orange, thin: true },
  ]
  const tick = { fill: 'rgba(243, 241, 236, 0.62)', fontSize: 11 }
  const Shape = (props) => {
    const { x, y, width, height, payload } = props
    const w = payload.thin ? 10 : width
    const dx = payload.thin ? (width - w) / 2 : 0
    // The chosen outcome is solid; the others are outlined in their own colour rather than faded.
    const dim = payload.id !== outcome && payload.id !== 'carrier'
    const hh = Math.max(height, 2)
    return dim ? (
      <rect x={x + dx + 0.75} y={y + 0.75} width={w - 1.5} height={Math.max(hh - 1.5, 1)} rx={4} fill={payload.color} fillOpacity={0.12} stroke={payload.color} strokeWidth={1.5} />
    ) : (
      <rect x={x + dx} y={y} width={w} height={hh} rx={4} fill={payload.color} />
    )
  }
  return (
    <section className="sim-panel glass sim-chart" aria-label="Book outcomes">
      <h2 className="label sim-panel-title">Book expected loss · 30 days</h2>
      <div className="sim-chart-box">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(243, 241, 236, 0.07)" vertical={false} />
            <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={tick} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => formatUSDCompact(v, 0)} />
            <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(243, 241, 236, 0.04)' }} isAnimationActive={false} />
            <Bar dataKey="value" shape={Shape} isAnimationActive={false} maxBarSize={64}>
              {data.map((d) => (
                <Cell key={d.id} />
              ))}
              <LabelList dataKey="value" position="top" formatter={(v) => formatUSDCompact(v)} fill="#F3F1EC" fontSize={12} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
