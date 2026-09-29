#!/usr/bin/env node
// Checks the generated data against CLAUDE.md §5–§8, §11–§14 and prints the Simulation book totals.
//   node scripts/checkData.mjs     (npm run data runs it after the generator)

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const load = (name) => JSON.parse(readFileSync(join(DATA, name), 'utf8'))

const areas = load('areas.json')
const homes = load('homes.json')
const assets = load('assets.json')
const fires = load('fires.json')
const plans = load('plans.json')
const negotiations = load('negotiations.json')
const bundles = load('bundles.json')
const watchlist = load('watchlist.json')
const historical = load('historical.json')
const models = load('models.json')
const portfolio = load('portfolio.json')

const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const m = (v) => `$${(v / 1e6).toFixed(1)}M`

// §6 geography
check(areas.length === 100, `expected 100 areas, got ${areas.length}`)
const byGroup = (g) => areas.filter((a) => a.group === g)
check(byGroup('austin').length === 14 && byGroup('town').length === 44 && byGroup('utility').length === 18 && byGroup('ranch').length === 8 && byGroup('oklahoma').length === 16, 'area group counts do not match §6 (14/44/18/8/16)')
check(Math.abs(homes.length - 49500) <= 500, `expected ~49,500 homes, got ${homes.length}`)
check(homes.every((h) => h.footprint.length === 4 && /^\d+ /.test(h.address)), 'every home needs a 4-point footprint and a street-style address')
check(areas.filter((a) => a.type === 'homes').every((a) => a.polygon.length >= 8), 'homes areas need irregular polygons')
check(assets.filter((a) => a.kind === 'line').every((a) => a.poles.length > 10), 'every line needs generated poles')

// §7 fires
const TABLE = {
  'PH-01': [48, 71, 96], 'AU-02': [58, 84, 112], 'BA-03': [52, 74, 98], 'CT-04': [18, 26, 35], 'HC-05': [6.1, 8.4, 11],
  'PK-06': [24, 33, 42], 'RP-07': [9, 14, 22], 'PB-08': [12, 19, 31], 'OK-09': [1.2, 2.1, 3.4], 'OK-10': [41, 57, 76],
}
check(fires.length === 10, `expected 10 fires, got ${fires.length}`)
for (const f of fires) {
  check(f.steps.length >= 9, `${f.id}: needs at least nine steps, has ${f.steps.length}`)
  check(!f.steps[0].held && f.steps[0].p50?.length, `${f.id}: first step needs perimeters`)
  for (const s of f.steps) check(s.ha.p90 <= s.ha.p50 && s.ha.p50 <= s.ha.p25, `${f.id} ${s.label}: band areas must nest (p90 ≤ p50 ≤ p25): ${s.ha.p90}/${s.ha.p50}/${s.ha.p25}`)
  check(f.lossLower < f.lossPoint && f.lossPoint < f.lossUpper, `${f.id}: loss must ascend P90 < P50 < P25`)
  const [lo, pt, up] = TABLE[f.id]
  const within = (v, t) => Math.abs(v / 1e6 - t) / t <= 0.1
  check(within(f.lossLower, lo) && within(f.lossPoint, pt) && within(f.lossUpper, up), `${f.id}: losses ${m(f.lossLower)}/${m(f.lossPoint)}/${m(f.lossUpper)} not within ±10% of $${lo}M/$${pt}M/$${up}M`)
  check(f.fuel.series.length === 30, `${f.id}: fuel series should cover 30 days`)
  check(plans.some((p) => p.fireId === f.id), `${f.id}: no plan`)
  check(negotiations.some((n) => n.fireId === f.id), `${f.id}: no negotiation`)
  check(f.ignitionZone.heat.length >= 40, `${f.id}: ignition prior needs heat points`)
}
check(negotiations.filter((n) => n.lastMonth).length === 4, 'expected four negotiations from last month')
check(negotiations.some((n) => n.entries.some((e) => e.declined)), 'expected at least one declined entry')
check(['Partial', 'State plan'].every((st) => negotiations.some((n) => n.stage === st)), 'expected Partial and State plan branch states')
check(watchlist.length === 5, 'expected 5 watchlist areas')
check(bundles.length >= 8, 'expected the §15 bundles')
check(historical.fires.length === 12 && historical.ruledOut.length === 4, 'expected 12 historical fires and 4 ruled-out rows')
check(models.length === 8, 'expected PRIMER and seven named models')
check(portfolio.portfolios.length === 2, 'expected two portfolios')

// §14 book totals, recomputed from fires.json and plans.json
let none = 0
let asNegotiated = 0
let fails = 0
let carrier = 0
const rows = []
for (const f of fires) {
  const p = plans.find((x) => x.fireId === f.id)
  const pPrevent = p.pPrevent ?? 0
  const eNone = f.probability * f.lossPoint
  const burnLoss = p.statePlan ? p.lossIfHolds : pPrevent * p.lossIfHolds + (1 - pPrevent) * p.lossIfFails
  const ePlan = p.pFireAfterPlan * burnLoss + p.cost
  const eFails = f.probability * p.lossIfFails + p.cost
  none += eNone
  asNegotiated += ePlan
  fails += eFails
  carrier += p.payerSplit.carrier
  rows.push(`  ${f.id.padEnd(6)} none ${m(eNone).padStart(7)}  as negotiated ${m(ePlan).padStart(7)}  fails ${m(eFails).padStart(7)}  carrier ${m(p.payerSplit.carrier)}`)
}

console.log('Simulation (CLAUDE.md §14), expected loss over 30 days:')
console.log(rows.join('\n'))
console.log(`  BOOK   No intervention ${m(none)} · As negotiated ${m(asNegotiated)} · Every plan fails ${m(fails)} · carrier pays ${m(carrier)}`)
console.log('         (spec guide: $349M · $98M · $159M · $1.2M)')
console.log(`\nAreas ${areas.length} · homes ${homes.length.toLocaleString('en-US')} · assets ${assets.length} · fires ${fires.length} · plans ${plans.length} · negotiations ${negotiations.length}`)

if (failures.length) {
  console.error(`\nFAIL (${failures.length}):\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`)
  process.exit(1)
}
console.log('\nPASS: every check holds.')
