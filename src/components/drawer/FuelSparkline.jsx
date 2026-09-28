import { useMemo } from 'react'
import { Line, LineChart, ReferenceDot, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { dayMonth } from '../../lib/dates.js'
import { palette } from '../../styles/palette.js'

const WIDTH = 380
const HEIGHT = 120
const DAYS = 30

/** Live fuel moisture over the 30 days to the predicted date, with the 90% crossing marked. */
export default function FuelSparkline({ fire }) {
  const c = palette()
  const f = fire.fuelState
  const data = useMemo(
    () =>
      f.trajectory
        .filter((d) => d.date <= fire.predictedDate)
        .slice(-DAYS)
        .map((d) => ({ ...d, label: dayMonth(d.date) })),
    [f, fire.predictedDate],
  )
  const crossing = data.find((d) => d.date === f.probabilityCrosses90On)
  const liveThreshold = f.thresholds.find((t) => t.fuel === 'Live fuel moisture').threshold
  const values = data.map((d) => d.live)

  return (
    <div className="sparkline">
      <LineChart width={WIDTH} height={HEIGHT} data={data} margin={{ top: 16, right: 34, bottom: 0, left: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} interval={DAYS - 2} />
        <YAxis
          width={34}
          domain={[Math.floor(Math.min(...values, liveThreshold) - 4), Math.ceil(Math.max(...values) + 2)]}
          tick={{ fontSize: 10, fill: c.muted }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Live fuel moisture']}
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />
        <ReferenceLine
          y={liveThreshold}
          stroke={c.muted}
          strokeDasharray="4 3"
          label={{ value: `${liveThreshold}% threshold`, position: 'insideBottomLeft', fontSize: 10, fill: c.muted }}
        />
        <Line type="monotone" dataKey="live" stroke={c.orange} strokeWidth={2} dot={false} isAnimationActive={false} />
        {crossing && (
          <ReferenceDot
            x={crossing.label}
            y={crossing.live}
            r={5}
            fill={c.red}
            stroke="#fff"
            strokeWidth={2}
            label={{ value: '90%', position: 'top', fontSize: 11, fontWeight: 700, fill: c.red }}
          />
        )}
      </LineChart>
    </div>
  )
}
