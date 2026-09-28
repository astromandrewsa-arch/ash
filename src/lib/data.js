// One place that loads the mock data and builds lookups the components share.
import areas from '../data/coverageAreas.json'
import homes from '../data/homes.json'
import fires from '../data/fires.json'
import fuelGrid from '../data/fuelGrid.json'
import sensors from '../data/sensors.json'
import timelines from '../data/agentTimelines.json'
import historicalFires from '../data/historicalFires.json'
import models from '../data/models.json'
import seasonStats from '../data/seasonStats.json'
import portfolio from '../data/portfolio.json'
import forecast from '../data/forecast.json'
import mapConfig from '../data/mapConfig.json'
import reports from '../data/reports.json'

export { areas, homes, fires, fuelGrid, sensors, historicalFires, models, seasonStats, portfolio, forecast, mapConfig, reports }

export const stages = timelines.stages
export const processes = timelines.processes
export const issueDate = forecast.issueDate

export const areaById = Object.fromEntries(areas.map((a) => [a.id, a]))
export const fireById = Object.fromEntries(fires.map((f) => [f.id, f]))
export const homeById = new Map(homes.map((h) => [h.id, h]))
export const processByFireId = Object.fromEntries(processes.map((p) => [p.fireId, p]))
export const presetById = Object.fromEntries(forecast.presets.map((p) => [p.id, p]))

export const homesByArea = areas.reduce((acc, a) => {
  acc[a.id] = homes.filter((h) => h.areaId === a.id)
  return acc
}, {})

/** homeId → { fireId, step, day, date, expectedLoss } for every home inside a final perimeter. */
export const pathByHome = new Map(fires.flatMap((f) => f.homesInPath.map((p) => [p.homeId, { ...p, fireId: f.id }])))

export function boundsOfPolygons(polys) {
  const pts = polys.flat()
  const lats = pts.map((p) => p[0])
  const lons = pts.map((p) => p[1])
  return [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ]
}

export const areasBounds = boundsOfPolygons(areas.map((a) => a.polygon))

/** Fires whose marker is revealed at this slider value (a fire dated N days out appears at –N and stays). */
export function visibleFires(sliderValue) {
  return fires.filter((f) => sliderValue >= -f.daysUntilFire)
}

/** Totals for the alert card and summary tiles. Loss avoided already includes the prevention probability. */
export function fireTotals(list) {
  return list.reduce(
    (t, f) => ({
      datedFires: t.datedFires + 1,
      homesInPath: t.homesInPath + f.exposure.homesEngulfed,
      tivInPath: t.tivInPath + f.exposure.tiv,
      expectedLoss: t.expectedLoss + f.exposure.expectedLoss,
      premiumAtRisk: t.premiumAtRisk + f.intervention.premiumSaved5yr,
      preventable: t.preventable + f.intervention.lossAvoided,
    }),
    { datedFires: 0, homesInPath: 0, tivInPath: 0, expectedLoss: 0, premiumAtRisk: 0, preventable: 0 },
  )
}
