import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { dayMonth } from '../../lib/dates.js'
import { palette } from '../../styles/palette.js'
import FuelChartTip from './FuelChartTip.jsx'

const WIDTH = 424
const HEIGHT = 184

/**
 * Live fuel moisture and 100-h dead fuel moisture over the last 30 days, projected to the window
 * (dashed), with the thresholds and the day each is crossed marked (§10 Forecast tab).
 */
export default function FuelChart({ fire }) {
  const c = palette()
  const { series, projection, thresholds } = fire.fuel
  const rows = [
    ...series.map((s) => ({ day: s.day, label: dayMonth(s.day), liveFm: s.liveFm, dead100h: s.dead100h })),
    ...projection.map((s) => ({ day: s.day, label: dayMonth(s.day), liveProj: s.liveFm, deadProj: s.dead100h })),
  ]
  // Join the measured and projected lines at the issue date.
  const last = rows[series.length - 1]
  last.liveProj = last.liveFm
  last.deadProj = last.dead100h
  const live = thresholds.find((t) => /live/i.test(t.name))
  const dead = thresholds.find((t) => /100-h/i.test(t.name))
  const at = (iso) => rows.find((r) => r.day === iso)?.label
  const tick = { fill: 'rgba(243, 241, 236, 0.5)', fontSize: 10.5 }
  return (
    <LineChart width={WIDTH} height={HEIGHT} data={rows} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
      <CartesianGrid stroke="rgba(243, 241, 236, 0.07)" vertical={false} />
      <XAxis dataKey="label" tick={tick} interval={Math.ceil(rows.length / 6)} axisLine={false} tickLine={false} />
      <YAxis yAxisId="live" domain={[60, 140]} ticks={[60, 80, 100, 120, 140]} tick={tick} axisLine={false} tickLine={false} unit="%" width={42} />
      <YAxis yAxisId="dead" orientation="right" domain={[6, 20]} ticks={[6, 10, 13, 16, 20]} tick={tick} axisLine={false} tickLine={false} unit="%" width={34} />
      <ReferenceLine yAxisId="live" y={live?.value ?? 80} stroke={c.orange} strokeOpacity={0.55} strokeDasharray="4 4" label={{ value: `Live ${live?.value ?? 80}%`, position: 'insideTopLeft', fill: c.orange, fontSize: 10 }} />
      <ReferenceLine yAxisId="dead" y={dead?.value ?? 13} stroke={c.blueSoft} strokeOpacity={0.55} strokeDasharray="4 4" label={{ value: `100-h ${dead?.value ?? 13}%`, position: 'insideBottomLeft', fill: c.blueSoft, fontSize: 10 }} />
      <ReferenceLine yAxisId="live" x={last.label} stroke="rgba(243, 241, 236, 0.35)" label={{ value: 'Issued', position: 'insideTopRight', fill: 'rgba(243, 241, 236, 0.55)', fontSize: 10 }} />
      <Line yAxisId="live" dataKey="liveFm" stroke={c.orange} strokeWidth={2.2} dot={false} isAnimationActive={false} />
      <Line yAxisId="live" dataKey="liveProj" stroke={c.orange} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
      <Line yAxisId="dead" dataKey="dead100h" stroke={c.blueSoft} strokeWidth={2.2} dot={false} isAnimationActive={false} />
      <Line yAxisId="dead" dataKey="deadProj" stroke={c.blueSoft} strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
      {live && at(live.crossedOn) && <ReferenceDot yAxisId="live" x={at(live.crossedOn)} y={live.value} r={4.5} fill={c.orange} stroke="#fff" strokeWidth={1.5} />}
      {dead && at(dead.crossedOn) && <ReferenceDot yAxisId="dead" x={at(dead.crossedOn)} y={dead.value} r={4.5} fill={c.blueSoft} stroke="#fff" strokeWidth={1.5} />}
      <Tooltip content={<FuelChartTip />} cursor={{ stroke: 'rgba(243, 241, 236, 0.25)' }} isAnimationActive={false} />
    </LineChart>
  )
}
