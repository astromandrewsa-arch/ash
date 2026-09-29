// Spread snapshots for the reports: one image per requested hour, all framed on the same extent
// (the latest requested step's tail band plus the ignition zone) so growth reads across the grid.
import { store } from '../store.js'
import { renderSnapshot } from './mapSnapshot.js'

const W = 440
const H = 330

function stepAt(fire, hour) {
  let best = fire.steps[0]
  for (const s of fire.steps) if (s.hour <= hour) best = s
  return best
}

function boundsOf(polys) {
  let s = 90
  let n = -90
  let w = 180
  let e = -180
  for (const poly of polys) for (const ring of poly) for (const [lat, lng] of ring) {
    if (lat < s) s = lat
    if (lat > n) n = lat
    if (lng < w) w = lng
    if (lng > e) e = lng
  }
  return [[s, w], [n, e]]
}

function tracePolys(ctx, project, polys) {
  ctx.beginPath()
  for (const poly of polys) {
    for (const ring of poly) {
      ring.forEach((pt, i) => {
        const [x, y] = project(pt)
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
      ctx.closePath()
    }
  }
}

export async function spreadSnapshots(fire, hours) {
  const last = stepAt(fire, Math.max(...hours))
  const bounds = boundsOf([...last.p25, [fire.ignitionZone.polygon]])
  const out = []
  for (const hour of hours) {
    const step = stepAt(fire, hour)
    const reached = new Set(fire.homesInPath.filter((h) => h.band !== 'p25' && h.hourReached <= step.hour).map((h) => h.homeId))
    const shot = await renderSnapshot({
      bounds,
      width: W,
      height: H,
      layers: (ctx, project) => {
        // Tail, expected and core bands, then the ignition zone and the homes in the path.
        const bands = [
          ['p25', 'rgba(242, 163, 58, 0.22)', 'rgba(242, 163, 58, 0.9)'],
          ['p50', 'rgba(226, 86, 27, 0.34)', 'rgba(226, 86, 27, 1)'],
          ['p90', 'rgba(179, 18, 31, 0.5)', 'rgba(215, 38, 61, 1)'],
        ]
        for (const [key, fill, stroke] of bands) {
          tracePolys(ctx, project, step[key])
          ctx.fillStyle = fill
          ctx.fill('evenodd')
          ctx.lineWidth = key === 'p50' ? 1.8 : 1.1
          ctx.strokeStyle = stroke
          ctx.stroke()
        }
        tracePolys(ctx, project, [fire.ignitionZone.polygon])
        ctx.setLineDash([4, 3])
        ctx.lineWidth = 1.4
        ctx.strokeStyle = '#E2561B'
        ctx.stroke()
        ctx.setLineDash([])
        for (const h of fire.homesInPath) {
          const home = store.homeById.get(h.homeId)
          if (!home) continue
          const [x, y] = project(home.centroid)
          ctx.fillStyle = reached.has(h.homeId) ? '#D7263D' : '#F5C518'
          ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2)
        }
        ctx.font = '700 13px Helvetica, Arial, sans-serif'
        ctx.fillStyle = 'rgba(15, 15, 16, 0.78)'
        ctx.fillRect(8, 8, 58, 22)
        ctx.fillStyle = '#F3F1EC'
        ctx.fillText(`${step.hour} h`, 16, 24)
      },
    })
    out.push({ hour: step.hour, ha: step.ha?.p50 ?? null, ...shot })
  }
  return out
}
