#!/usr/bin/env node
// Regenerates every v2 data file in src/data (CLAUDE.md §5) from a fixed seed.
//
//   node scripts/generateData.mjs        (or: npm run data, which also runs checkData.mjs)
//
// Deterministic: all randomness comes from named seeded streams (scripts/lib/rng.mjs) and the
// real geography is read from the files vendored in scripts/geo. Hand edits to src/data are lost.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeRng, SEED } from './lib/rng.mjs'
import * as turf from '@turf/turf'
import { blobPolygon, destination, featureAreaHa, haversineKm, pointInRing, polyFeature, projector, round, round5, roundRing, scaleRingToArea, sum } from './lib/geo.mjs'
import { buildWorld, MARKET_RATE, nameClusters, relocateCluster } from './lib/world.mjs'
import { buildFire, computeExposure, finishFire, fitClusters, FIRES } from './lib/fires.mjs'
import { ASSET_DR, CONSTRUCTION_DR, DEDUCTIBLE, LOCATION_LIMIT, homeDamageRatio, outcomes, returnPeriod, lossAt, tvar } from './lib/loss.mjs'
import { buildHelp } from './config/help.mjs'
import { addDays, dayMonth, daysBetween, money, windowLabel } from './lib/text.mjs'
import { ISSUE, WATCHLIST } from './config/fires.mjs'
import { AGENTS, LAST_MONTH, NEGOTIATIONS, PLANS } from './config/plans.mjs'
import { AAL_PER_1000, BUNDLE_RATES, CONTEXT_TILES, FILED_2027, FILED_DEFAULT, PRICING, SCIENCE } from './config/market.mjs'
import { HISTORICAL, MODELS, RULED_OUT, SEASON } from './config/history.mjs'
import { BUNDLES } from './config/places.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')
const readGeo = (name) => JSON.parse(readFileSync(join(ROOT, 'scripts', 'geo', `${name}.geojson`), 'utf8'))
const t0 = Date.now()
const log = (msg) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`)

// ---------------------------------------------------------------------------
// 1. World
// ---------------------------------------------------------------------------

const geo = { water: readGeo('water').features, rivers: readGeo('rivers').features, freeways: readGeo('freeways').features }
const world = buildWorld({ water: geo.water, turbines: readGeo('turbines') })
world.log.forEach((l) => log(l))
const assetsByKey = Object.fromEntries(world.assets.map((a) => [a.id.slice(2), a]))
const ctx = { ...world, assetsByKey, geo }
ctx.homes = world.homes
ctx.areas = world.areas

// ---------------------------------------------------------------------------
// 2. Fires: simulate, fit the in-path clusters to the §7 table, then exposure and losses
// ---------------------------------------------------------------------------

const built = FIRES.map((def) => {
  const b = buildFire(def, ctx)
  log(`${def.id} simulated (${['p90', 'p50', 'p25'].map((k) => b.sim[k].ms).join('/')} ms)`)
  return b
})
for (const b of built) {
  fitClusters(b, ctx, (id, c) => relocateCluster(world, id, c))
  for (const line of b.fitLog || []) log(`${b.def.id} fit ${line}`)
}
nameClusters(world)
const fires = []
const fireItems = {}
for (const b of built) {
  computeExposure(b, ctx)
  const { record, p50Items } = finishFire(b, ctx)
  fireItems[record.id] = p50Items
  fires.push(record)
}
log('fires: exposure and losses done')

// Type of exposure per fire (§13): the classes carrying the P50 loss, largest first.
const EXPOSURE_CLASS = (kind) => (kind === 'home' ? 'Homes' : ['forage', 'fencing', 'livestock', 'structures', 'outbuilding'].includes(kind) ? 'Rangeland' : 'Utility')
for (const f of fires) {
  const byClass = {}
  for (const it of fireItems[f.id]) byClass[EXPOSURE_CLASS(it.kind)] = (byClass[EXPOSURE_CLASS(it.kind)] || 0) + it.loss
  const total = Object.values(byClass).reduce((a, b) => a + b, 0) || 1
  const ranked = Object.entries(byClass).sort((a, b) => b[1] - a[1])
  f.exposureTypes = ranked.filter(([, v]) => v / total >= 0.1).map(([k]) => k)
  f.exposureType = ranked[0][0]
}

const homeById = new Map(world.homes.map((h) => [h.id, h]))
const areaById = new Map(world.areas.map((a) => [a.id, a]))
const assetById = new Map(world.assets.map((a) => [a.id, a]))
const ranchById = new Map(world.ranches.map((r) => [r.id, r]))

// Areas touched by each fire, and each fire's footprint in each area.
for (const f of fires) {
  const ids = new Set()
  for (const h of f.homesInPath) ids.add(homeById.get(h.homeId).areaId)
  for (const a of f.assetsInPath) if (a.band !== 'watch') ids.add(assetById.get(a.assetId).areaId)
  for (const r of f.ranches) ids.add(ranchById.get(r.ranchId).areaId)
  f.areaIds = [...ids]
}

// ---------------------------------------------------------------------------
// 3. Book EP curve, return periods
// ---------------------------------------------------------------------------

const EP_TXOK = [
  { rp: 2, loss: 12e6 }, { rp: 5, loss: 38e6 }, { rp: 10, loss: 70e6 }, { rp: 25, loss: 125e6 }, { rp: 50, loss: 185e6 },
  { rp: 100, loss: 260e6 }, { rp: 250, loss: 390e6 }, { rp: 500, loss: 510e6 }, { rp: 1000, loss: 650e6 },
]
const TX_SHARE = 0.86
const EP_TX = EP_TXOK.map((p) => ({ rp: p.rp, loss: Math.round(p.loss * TX_SHARE) }))
for (const f of fires) f.returnPeriodYears = returnPeriod(EP_TXOK, f.lossPoint)

// ---------------------------------------------------------------------------
// 4. Plans
// ---------------------------------------------------------------------------

const NWS = { 'PH-01': 'NWS Amarillo', 'AU-02': 'NWS Austin/San Antonio', 'BA-03': 'NWS Austin/San Antonio', 'CT-04': 'NWS Fort Worth', 'HC-05': 'NWS Austin/San Antonio', 'PK-06': 'NWS Fort Worth', 'RP-07': 'NWS Lubbock', 'PB-08': 'NWS Midland', 'OK-09': 'NWS Tulsa', 'OK-10': 'NWS Norman' }

const plans = fires.map((f) => {
  const cfg = PLANS[f.id]
  const cost = sum(cfg.actions, (x) => x.cost)
  const payerSplit = { utility: 0, state: 0, landowner: 0, operator: 0, carrier: 0, county: 0 }
  for (const x of cfg.actions) payerSplit[x.payer] += x.cost
  // Rank the P50 homes by TIV × damage ratio; the plan protects the top of the list.
  const p50Homes = f.homesInPath.filter((h) => h.band !== 'p25').map((h) => homeById.get(h.homeId))
  const ranked = [...p50Homes].sort((x, y) => y.tiv * homeDamageRatio(y) - x.tiv * homeDamageRatio(x) || x.id.localeCompare(y.id))
  let protectedIds = []
  if (cfg.protect?.all) protectedIds = ranked.map((h) => h.id)
  else if (cfg.protect?.count) {
    const pool = cfg.protect.areaIds ? ranked.filter((h) => cfg.protect.areaIds.includes(h.areaId)) : ranked
    protectedIds = pool.slice(0, cfg.protect.count).map((h) => h.id)
  }
  const protectedSet = new Set(protectedIds)
  const warnedIds = f.homesInPath.map((h) => h.homeId).filter((id) => !protectedSet.has(id))
  const p50Ha = f.bands.p50.hectares
  let scopeRule = null
  const avoided = cfg.pPrevent == null ? 0 : f.lossPoint - (cfg.pPrevent * cfg.lossIfHolds + (1 - cfg.pPrevent) * cfg.lossIfFails)
  if (p50Ha > 2000 || cfg.verdict === 'Targeted') {
    const why = p50Ha > 2000 ? `P50 footprint ${Math.round(p50Ha).toLocaleString('en-US')} ha exceeds 2,000 ha` : `protecting all ${p50Homes.length} homes would cost ${money(p50Homes.length * 12000)}, ${Math.round(((p50Homes.length * 12000) / Math.max(1, avoided * 0.08)) * 100)}% of the structure loss it avoids`
    const tail = f.homesInPath.length - p50Homes.length
    const tailText = tail ? ` and the ${tail.toLocaleString('en-US')} in the tail band` : ''
    if (protectedIds.length && protectedIds.length < p50Homes.length) {
      scopeRule = `Scope rule applied: ${why}. Structure work narrows to the ${protectedIds.length} homes ranked highest by TIV × damage ratio; the other ${(p50Homes.length - protectedIds.length).toLocaleString('en-US')} homes in the P50 path${tailText} get pre-warning.`
    } else if (protectedIds.length) {
      scopeRule = `Scope rule checked: ${why}. The plan still covers all ${protectedIds.length} homes in the P50 path${tail ? `; the ${tail.toLocaleString('en-US')} in the tail band get pre-warning` : ''}.`
    } else {
      scopeRule = `Scope rule applied: ${why}. The plan works on fuel, lines and the state response rather than on every structure.`
    }
  }
  const summaryCounts = { protected: protectedIds.length, warnedP50: p50Homes.length - protectedIds.length, tail: f.homesInPath.length - p50Homes.length }
  const ws = f.windowStart
  const county = f.county
  const warnings = []
  const trigger = f.fuel.thresholds.find((t) => t.name.startsWith('100-h')) || f.fuel.thresholds[0]
  warnings.push({ day: addDays(ws, -10), text: `Pyrome pre-notice to the ${county} emergency manager (trigger: ${trigger.name.toLowerCase()} crossed ${dayMonth(trigger.crossedOn)})`, by: 'Pyrome' })
  const liveT = f.fuel.thresholds.find((t) => t.name.startsWith('Live'))
  // By the alert day a crossing projected before it has happened.
  const alertDay = addDays(ws, -6)
  warnings.push({ day: alertDay, text: `Sensor alert: ${liveT.name.toLowerCase()} ${liveT.crossedOn <= alertDay ? 'crossed' : 'projected'} ${dayMonth(liveT.crossedOn)}; curing ${f.fuel.curing}%`, by: 'PRIMER sensors' })
  if (cfg.actions.some((x) => x.payer === 'utility' && /PSPS|De-energise|de-energis/i.test(x.text))) warnings.push({ day: addDays(ws, -2), text: 'PSPS window notice to customers on the affected feeder', by: cfg.actions.find((x) => x.payer === 'utility').owner })
  if (f.homesInPath.length) warnings.push({ day: addDays(ws, -3), text: `Evacuation pre-notice to ${f.homesInPath.length.toLocaleString('en-US')} households in the path`, by: `${county} Emergency Management` })
  warnings.push({ day: ws, text: 'Red Flag Warning for the burn window', by: NWS[f.id] })
  warnings.sort((x, y) => x.day.localeCompare(y.day))
  return {
    id: f.planId,
    fireId: f.id,
    verdict: cfg.verdict,
    statePlan: !!cfg.statePlan,
    statePlanNote: cfg.statePlan ? 'This area cannot be mitigated in the window. A state agency plan is in place; expected loss is reduced by pre-positioning, not prevented.' : null,
    summary: typeof cfg.summary === 'function' ? cfg.summary(summaryCounts) : cfg.summary,
    actions: cfg.actions.map(({ text, owner, payer, cost: c, start, end, unit }) => ({ text, owner, payer, cost: c, start, end, unit })),
    cost,
    payerSplit,
    pPrevent: cfg.pPrevent,
    pFireAfterPlan: cfg.pFireAfterPlan,
    lossIfHolds: cfg.lossIfHolds,
    lossIfFails: cfg.lossIfFails,
    scopeRule,
    protectedHomeIds: protectedIds,
    warnedHomeIds: warnedIds,
    warnings,
    mitigationCredit: cfg.credit,
  }
})
const planByFire = Object.fromEntries(plans.map((p) => [p.fireId, p]))
for (const p of plans) {
  for (const id of p.protectedHomeIds) homeById.get(id).protectedState = 'protected'
  for (const id of p.warnedHomeIds) if (!homeById.get(id).protectedState) homeById.get(id).protectedState = 'warned'
}

// Simulation arithmetic (§14) per fire, kept on the plan for the UI and checkData.
for (const f of fires) {
  const p = planByFire[f.id]
  const o = outcomes(f, p)
  p.expected = { none: Math.round(o.none), asNegotiated: Math.round(o.asNegotiated), fails: Math.round(o.fails) }
}

// ---------------------------------------------------------------------------
// 5. Negotiations
// ---------------------------------------------------------------------------

const STATUS = { Identified: 'Identified', 'Agent engaged': 'In negotiation', 'Government in negotiation': 'In negotiation', 'Work agreed': 'Agreed', 'Work complete': 'Complete', 'Fire prevented': 'Prevented', Partial: 'Partial', 'State plan': 'State plan' }
// Negotiation Channel filter chips (§12).
const FEED_GROUP = { Identified: 'Identified', 'Agent engaged': 'In negotiation', 'Government in negotiation': 'In negotiation', 'Work agreed': 'Agreed', 'Work complete': 'Agreed', 'Fire prevented': 'Prevented', Partial: 'Partial', 'State plan': 'State plan' }
const ago = (iso) => {
  const d = daysBetween(iso, ISSUE.date)
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? `${d} days ago` : `on ${dayMonth(iso)}`
}
// §12 headline: "PH-01 — Stinnett — dated at 92%, 15 days out — agent engaged Xcel and Hutchinson County 2 days ago — status: in negotiation"
function feedHeadline({ id, short, probability, leadDays, counterpartyShort, engagedOn, engagedText, status }) {
  const engaged = engagedOn ? `agent engaged ${counterpartyShort} ${ago(engagedOn)}` : engagedText
  return `${id} — ${short} — dated at ${Math.round(probability * 100)}%, ${leadDays} days out — ${engaged} — status: ${status.toLowerCase()}`
}
const lastEntry = (entries) => [...entries].sort((a, b) => a.day.localeCompare(b.day)).pop()
const negotiations = fires.map((f) => {
  const cfg = NEGOTIATIONS[f.id]
  const p = planByFire[f.id]
  const agreed = ['Work agreed', 'Work complete', 'Fire prevented', 'Partial', 'State plan'].includes(cfg.stage)
  const saving = agreed ? Math.max(0, p.expected.none - p.expected.asNegotiated) : 0
  return {
    id: f.negotiationId,
    fireId: f.id,
    agent: AGENTS[cfg.agent],
    stage: cfg.stage,
    counterparty: cfg.counterparty,
    counterpartyType: cfg.counterpartyType,
    decisionDue: cfg.decisionDue,
    payerAgreed: agreed ? p.payerSplit : Object.fromEntries(Object.keys(p.payerSplit).map((k) => [k, 0])),
    payerInPrinciple: agreed ? null : cfg.inPrinciple || null,
    entries: cfg.entries,
    ledger: { cost: agreed ? p.cost : 0, saving: Math.round(saving), status: STATUS[cfg.stage], documents: cfg.documents },
    feed: {
      headline: feedHeadline({ id: f.id, short: cfg.short, probability: f.probability, leadDays: f.leadDays, counterpartyShort: cfg.counterpartyShort, engagedOn: cfg.engagedOn, engagedText: cfg.engagedText, status: STATUS[cfg.stage] }),
      group: FEED_GROUP[cfg.stage],
      engagedOn: cfg.engagedOn,
      lastAction: lastEntry(cfg.entries),
      nextAction: cfg.next,
      payers: Object.entries(p.payerSplit).filter(([, v]) => v > 0).map(([k]) => k),
    },
  }
})
for (const n of LAST_MONTH) {
  negotiations.push({
    id: n.id,
    fireId: n.fire.id,
    fire: n.fire,
    lastMonth: true,
    agent: AGENTS[n.agent],
    stage: n.stage,
    counterparty: n.counterparty,
    counterpartyType: n.counterpartyType,
    decisionDue: n.decisionDue,
    payerAgreed: null,
    entries: n.entries,
    outcome: n.declinedOutcome || null,
    ledger: { cost: n.cost, saving: n.saving, status: n.declinedOutcome ? 'Declined' : STATUS[n.stage], documents: n.documents },
    feed: {
      headline: feedHeadline({ id: n.fire.id, short: n.fire.name, probability: n.probability, leadDays: n.leadDays, counterpartyShort: n.counterpartyShort, engagedOn: n.engagedOn, status: n.declinedOutcome ? 'Declined' : STATUS[n.stage] }),
      group: n.declinedOutcome ? 'Declined' : FEED_GROUP[n.stage],
      engagedOn: n.engagedOn,
      lastAction: lastEntry(n.entries),
      nextAction: n.next,
      payers: n.payers,
    },
  })
}

// ---------------------------------------------------------------------------
// 6. Watchlist
// ---------------------------------------------------------------------------

const watchlist = WATCHLIST.map((w) => {
  const areaId = world.areas.find((a) => a.placeKey === w.areaKey && (w.cluster == null || a.id.endsWith(`-${w.cluster + 1}`)))?.id
  const area = areaById.get(areaId)
  return { id: w.id, areaId, place: w.place, probability: w.probability, windowDays: w.windowDays, narrowingRate: w.narrowingRate, note: w.note, center: area.centroid }
})

// ---------------------------------------------------------------------------
// 7. Bundles (§15)
// ---------------------------------------------------------------------------

const lossByArea = new Map()
for (const f of fires) {
  for (const it of fireItems[f.id]) {
    let areaId = null
    if (it.kind === 'home') areaId = homeById.get(it.ref).areaId
    else if (assetById.has(it.ref)) areaId = assetById.get(it.ref).areaId
    else if (ranchById.has(it.ref)) areaId = ranchById.get(it.ref).areaId
    if (!areaId) continue
    lossByArea.set(areaId, (lossByArea.get(areaId) || 0) + it.loss * f.probability)
  }
}
const bundles = Object.entries(BUNDLES).map(([id, meta]) => {
  const areasIn = world.areas.filter((a) => a.bundleId === id)
  const homesAreas = areasIn.filter((a) => a.type === 'homes')
  const insured = id === 'osage-rangeland' ? areasIn.filter((a) => a.type === 'rangeland') : homesAreas
  const policies = id === 'osage-rangeland' ? 40 : sum(homesAreas, (a) => a.homes)
  const tiv = sum(insured, (a) => a.tiv)
  const premium = sum(insured, (a) => a.premium)
  const market = round((premium / tiv) * 1000, 1)
  const rates = BUNDLE_RATES[id]
  const adequacy = round(market / rates.primer - 1, 3)
  const sc = SCIENCE[id]
  const aal = Math.round((AAL_PER_1000[id] * tiv) / 1000)
  const seasonEL = Math.round(sum(insured, (a) => lossByArea.get(a.id) || 0))
  const expenseRatio = PRICING.variableExpense + (PRICING.fixedExpensePerPolicy * policies) / Math.max(premium, 1)
  const lossRatio = round(seasonEL / premium, 3)
  // Technical premium at PRIMER's rate, and what the written premium falls short of it (or exceeds it by).
  const technicalPremium = Math.round((rates.primer * tiv) / 1000)
  return {
    id,
    name: meta.name,
    state: areasIn[0].state,
    kind: id === 'osage-rangeland' ? 'rangeland' : 'homes',
    areaIds: areasIn.map((a) => a.id),
    insuredAreaIds: insured.map((a) => a.id),
    places: [...new Set([...insured].sort((a, b) => b.tiv - a.tiv).map((a) => a.place))],
    policies,
    tiv,
    premium,
    marketRatePer1000: market,
    primerRatePer1000: rates.primer,
    adequacy,
    underPriced: adequacy < 0,
    technicalPremium,
    premiumGap: technicalPremium - premium,
    recommendation2027: rates.rec2027,
    recommendationText: rates.recText,
    filed2027: FILED_2027[id] ?? FILED_DEFAULT,
    science: {
      fuelLoadVsMean: sc.fuelLoad,
      fuelLoadText: `+${Math.round(sc.fuelLoad * 100)}% fuel load against the five-year mean after the wet spring`,
      liveFmTrend: -sc.liveTrend,
      liveFmText: `Live fuel falling ${sc.liveTrend} pts/day; crosses 80% on ${dayMonth(sc.liveCross)}`,
      liveFmCrossesOn: sc.liveCross,
      liveFmThreshold: 80,
      deadFmVsLastYear: -sc.dead100,
      dead1000hVsLastYear: -sc.dead1000,
      deadFmText: `100-h dead fuel ${sc.dead100} pts and 1000-h ${sc.dead1000} pts below this date last year`,
      rosVsLastSeason: sc.ros,
      rosText: `Rate of spread +${Math.round(sc.ros * 100)}% against last season`,
      intensityClassShift: sc.shift,
      intensityText: `Intensity one class hotter: ${sc.shift}`,
      sensitivityLine: `If afternoon temperatures run 1°C above forecast, or live fuel dries 2 points a day instead of ${sc.liveTrend} for the next 30 days, this bundle crosses the extreme threshold in the following month and the technical rate rises another 9%.`,
    },
    aal,
    primerSeasonExpectedLoss: seasonEL,
    adequacyRatio: round(seasonEL / Math.max(aal, 1), 2),
    lossRatio,
    combinedRatio: round(lossRatio + expenseRatio, 3),
    expenseRatio: round(expenseRatio, 3),
  }
})

// ---------------------------------------------------------------------------
// 8. Historical, models, season stats
// ---------------------------------------------------------------------------

const historical = {
  fires: HISTORICAL.map((h) => {
    const p = h.primer
    let sentence
    if (h.outcomeType === 'prevented') sentence = `Dated ${p.leadDays} days prior → intervened → cost ${money(h.cost)} → premium saved ${money(h.premiumSaved)} → prevented.`
    else if (h.outcomeType === 'declined-burned') sentence = `Dated at ${Math.round(p.probability * 100)}% → intervention declined → burned on the predicted date, ${dayMonth(p.burnedOnDay)} → loss ${money(h.realisedLoss)}.`
    else sentence = `Back-test: all seven missed the date; PRIMER dated it ${p.leadDays} days out.`
    return { ...h, primerSaid: `Dated ${p.leadDays} days out at ${Math.round(p.probability * 100)}%, window ${windowLabel(p.windowFrom, p.windowTo)}`, sentence }
  }),
  ruledOut: RULED_OUT,
}
// Crabapple before/after (§16): an illustrative burn scar the size of the 2025 fire and PRIMER's
// back-test perimeter, drawn over real imagery at the fire's location.
function crabappleExhibit(c) {
  const rng = makeRng('crabapple')
  const ha = c.acres * 0.404686
  const scar = scaleRingToArea(blobPolygon(rng, c.center, 3000, { vertices: 72, roughness: 0.16, aspect: 2.1, axisDeg: 40 }), ha)
  const shifted = projector(c.center).toLatLng([600, -300])
  const predicted = scaleRingToArea(blobPolygon(rng, shifted, 3000, { vertices: 72, roughness: 0.1, aspect: 2.3, axisDeg: 48 }), ha * 1.05)
  const inter = turf.intersect(turf.featureCollection([polyFeature(scar), polyFeature(predicted)]))
  const all = [...scar, ...predicted]
  const lats = all.map((q) => q[0])
  const lngs = all.map((q) => q[1])
  return {
    ...c,
    hectares: Math.round(ha),
    burnScar: roundRing(scar),
    predicted: roundRing(predicted),
    overlapPct: Math.round((featureAreaHa(inter) / ha) * 100),
    bounds: [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ],
  }
}

const seasonStats = {
  ...SEASON,
  crabapple: crabappleExhibit(SEASON.crabapple),
  tiles: [
    { id: 'dated', label: 'Fires dated last season', value: SEASON.datedFires, format: 'number', note: `${SEASON.season} season` },
    { id: 'prevented', label: 'Prevented', value: SEASON.prevented, format: 'number', note: `of ${SEASON.datedFires} dated`, tone: 'saving' },
    { id: 'saved', label: 'Premium saved', value: SEASON.premiumSaved, format: 'money', note: 'on the prevented fires', tone: 'saving' },
    { id: 'declined', label: 'Realised loss on declined interventions', value: SEASON.declinedLoss, format: 'money', note: 'burned on the predicted date', tone: 'loss' },
    { id: 'brier', label: 'Brier score', value: SEASON.brier, format: 'decimal', note: 'at 14 days; lower is better' },
    { id: 'hit14', label: 'Hit rate at 14 days', value: SEASON.hitRate14, format: 'pct', note: 'fires inside the called window' },
  ],
}

// ---------------------------------------------------------------------------
// 9. Portfolio (two books)
// ---------------------------------------------------------------------------

function portfolioFor(id, name, short, view, states, curve) {
  const areas = world.areas.filter((a) => states.includes(a.state))
  const areaIds = new Set(areas.map((a) => a.id))
  const homes = world.homes.filter((h) => areaIds.has(h.areaId))
  const assets = world.assets.filter((a) => areaIds.has(a.areaId))
  const tiv = sum(areas, (a) => a.tiv)
  const premium = sum(areas, (a) => a.premium)
  // AAL: area under the exceedance curve (trapezoids between return periods, plus the body below 1-in-2).
  let aal = curve[0].loss * 0.35
  for (let i = 0; i + 1 < curve.length; i++) aal += ((1 / curve[i].rp - 1 / curve[i + 1].rp) * (curve[i].loss + curve[i + 1].loss)) / 2
  aal = Math.round(aal)
  // Data quality from the records: pre-1967 homes carry parcel-level geocodes in the source files;
  // insurance-to-value flags homes insured below 60% of their cluster's average rebuild value.
  const share = (fn) => homes.filter(fn).length / homes.length
  const geocodeBuildingPct = share((h) => h.yearBuilt >= 1967)
  const avgByArea = new Map(areas.map((a) => [a.id, a.avgTiv]))
  const itvFlagged = homes.filter((h) => h.tiv < 0.6 * avgByArea.get(h.areaId)).length
  const isLinear = (a) => a.type === 'utility' && ['line', 'pipeline'].includes(assetById.get(a.assetIds?.[0])?.kind)
  const concentrations = areas
    .map((a) => ({ areaId: a.id, name: a.name, type: a.type, tiv: a.tiv, linear: isLinear(a) }))
    .sort((x, y) => y.tiv - x.tiv)
    .slice(0, 10)
  // Exposed concentration (§13): TIV inside the dated fires' P50 paths, by area.
  const exposedByArea = new Map()
  for (const f of fires) {
    if (!states.includes(f.state)) continue
    for (const it of fireItems[f.id]) {
      const areaId = it.kind === 'home' ? it.areaId : assetById.get(it.ref)?.areaId || ranchById.get(it.ref)?.areaId || null
      if (!areaId || !areaIds.has(areaId)) continue
      const e = exposedByArea.get(areaId) || { tiv: 0, loss: 0, fires: new Set() }
      e.tiv += it.tiv
      e.loss += it.loss
      e.fires.add(f.id)
      exposedByArea.set(areaId, e)
    }
  }
  const exposedConcentrations = [...exposedByArea.entries()]
    .map(([areaId, e]) => {
      const a = areaById.get(areaId)
      return { areaId, name: a.name, type: a.type, exposedTiv: Math.round(e.tiv), pointLoss: Math.round(e.loss), fireIds: [...e.fires], linear: isLinear(a) }
    })
    .sort((x, y) => y.exposedTiv - x.exposedTiv)
    .slice(0, 10)
  return {
    id, name, short, view,
    states,
    areas: areas.length,
    totals: {
      tiv,
      homes: homes.length,
      assets: assets.length,
      poles: sum(assets, (a) => a.poles?.length || 0),
      lineKm: round(sum(assets.filter((a) => a.kind === 'line'), (a) => a.km), 1),
      ranchAcres: sum(world.ranches.filter((r) => areaIds.has(r.areaId)), (r) => r.acres),
      hectaresUnderForecast: sum(areas, (a) => a.hectares),
      premium,
    },
    aal,
    aalPer1000: round((aal / tiv) * 1000, 2),
    oep100: lossAt(curve, 100),
    oep250: lossAt(curve, 250),
    tvar100: Math.round(tvar(curve, 100)),
    epCurve: curve,
    exposedConcentrations,
    concentrations,
    dataQuality: {
      geocodeBuildingPct: round(geocodeBuildingPct, 4),
      itvFlagged,
      roofClassAPct: round(share((h) => h.roofClass === 'A'), 3),
      defensibleSpace10Pct: round(share((h) => h.defensibleSpaceM >= 10), 3),
      medianYearBuilt: [...homes.map((h) => h.yearBuilt)].sort((x, y) => x - y)[Math.floor(homes.length / 2)],
      constructionKnownPct: 1,
    },
  }
}
const portfolio = {
  defaultId: 'txok',
  initialView: { center: [31.3, -99.5], zoom: 6 },
  // Gross loss terms (§8): a 2% deductible and a per-location limit.
  terms: { deductible: DEDUCTIBLE, locationLimit: LOCATION_LIMIT },
  portfolios: [
    portfolioFor('tx', 'Demo Carrier — Texas HO book', 'Texas HO book', { center: [31.3, -99.5], zoom: 6 }, ['TX'], EP_TX),
    portfolioFor('txok', 'Demo Carrier — Texas + Oklahoma', 'Texas + Oklahoma', { center: [33.5, -98.8], zoom: 6 }, ['TX', 'OK'], EP_TXOK),
  ],
  pricing: PRICING,
  contextTiles: CONTEXT_TILES,
}

// Book outcomes on the EP curve (Simulation page).
const bookTotals = {
  none: sum(plans, (p) => p.expected.none),
  asNegotiated: sum(plans, (p) => p.expected.asNegotiated),
  fails: sum(plans, (p) => p.expected.fails),
  carrier: sum(plans, (p) => p.payerSplit.carrier),
}
portfolio.simulation = {
  ...bookTotals,
  returnPeriods: { none: returnPeriod(EP_TXOK, bookTotals.none), asNegotiated: returnPeriod(EP_TXOK, bookTotals.asNegotiated), fails: returnPeriod(EP_TXOK, bookTotals.fails) },
  premiumAtRisk: Math.round(sum(fires.flatMap((f) => f.homesInPath), (h) => homeById.get(h.homeId).premium)),
}

// ---------------------------------------------------------------------------
// 10. Fuel grid (Quick Views): 200 m cells, coarser over the big ranches
// ---------------------------------------------------------------------------

const fireCenters = fires.map((f) => ({ f, c: f.ignitionZone.ignitions[0].pos }))
function fuelAt(pt, rng) {
  let best = null
  for (const fc of fireCenters) {
    const d = haversineKm(pt, fc.c)
    if (!best || d < best.d) best = { d, f: fc.f }
  }
  const d = best.d
  const fu = best.f.fuel
  const n = () => rng.between(-1, 1)
  const k = Math.min(d, 90)
  return [
    Math.round(Math.min(135, fu.liveFm + 0.55 * k + 2.5 * n())),
    Math.round(Math.min(160, (fu.dead10h + 0.045 * k + 0.25 * n()) * 10)),
    Math.round(Math.max(55, fu.curing - 0.32 * k + 1.5 * n())),
    Math.round(Math.max(18, fu.erc - 0.3 * k + 1.2 * n())),
  ]
}
const fuelGrid = {
  variants: [
    { id: 'live', label: 'Live fuel moisture', unit: '%', scale: 1, stops: [[80, '#B3121F'], [95, '#E2561B'], [110, '#F5A623'], [130, '#FFE8B0']], reverse: true },
    { id: 'dead10', label: '10-h dead fuel moisture', unit: '%', scale: 10, stops: [[5, '#B3121F'], [7, '#E2561B'], [9, '#F5A623'], [12, '#FFE8B0']], reverse: true },
    { id: 'curing', label: 'Curing', unit: '%', scale: 1, stops: [[60, '#FFE8B0'], [75, '#F5A623'], [85, '#E2561B'], [95, '#B3121F']] },
    { id: 'erc', label: 'Energy release component', unit: '', scale: 1, stops: [[25, '#FFE8B0'], [38, '#F5A623'], [46, '#E2561B'], [56, '#B3121F']] },
  ],
  areas: [],
}
for (const area of world.areas) {
  const rng = makeRng(`fuel:${area.id}`)
  const lats = area.ring.map((p) => p[0])
  const lngs = area.ring.map((p) => p[1])
  const n = Math.max(...lats)
  const w = Math.min(...lngs)
  const spanKm = Math.max(haversineKm([n, w], [Math.min(...lats), w]), haversineKm([n, w], [n, Math.max(...lngs)]))
  const cellM = area.type === 'rangeland' ? Math.max(200, Math.round((spanKm * 1000) / 55 / 100) * 100) : 200
  const pr = projector([n, w])
  const [, yS] = pr.toXY([Math.min(...lats), w])
  const [xE] = pr.toXY([n, Math.max(...lngs)])
  const rows = Math.ceil(-yS / cellM)
  const cols = Math.ceil(xE / cellM)
  const dLat = cellM / 111320
  const dLng = cellM / (111320 * Math.cos((n * Math.PI) / 180))
  const cells = []
  const values = [[], [], [], []]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const center = [n - (r + 0.5) * dLat, w + (c + 0.5) * dLng]
      if (!pointInRing(center, area.ring)) continue
      cells.push(r, c)
      fuelAt(center, rng).forEach((v, i) => values[i].push(v))
    }
  }
  fuelGrid.areas.push({ areaId: area.id, origin: [round5(n), round5(w)], dLat: round(dLat, 7), dLng: round(dLng, 7), cellM, rows, cols, cells, live: values[0], dead10: values[1], curing: values[2], erc: values[3] })
}

// ---------------------------------------------------------------------------
// 11. Write
// ---------------------------------------------------------------------------

const areasOut = world.areas.map((a) => ({
  id: a.id,
  name: a.name,
  place: a.place,
  state: a.state,
  type: a.type,
  group: a.group,
  bundleId: a.bundleId,
  county: a.county,
  centroid: a.centroid,
  polygon: a.ring.map(([x, y]) => [round5(x), round5(y)]),
  hectares: a.hectares,
  homes: a.homes || 0,
  tiv: a.tiv,
  premium: a.premium,
  avgTiv: a.type === 'homes' ? a.avgTiv : null,
  realHook: a.realHook,
  fireHistory: a.fireHistory,
  assetIds: a.assetIds || [],
  ranchId: a.ranchId || null,
  patchBurn: a.patchBurn || false,
  sensors: a.sensors,
}))
const ranchesOut = world.ranches.map(({ _fencePts, _herds, valueScale, ...r }) => r)
const meta = {
  model: 'PRIMER',
  seed: SEED,
  issued: `${ISSUE.date}T${ISSUE.time}:00-05:00`,
  issueDate: ISSUE.date,
  issuedLabel: ISSUE.label,
  user: { name: 'Jordan Ellis', initials: 'JE', role: 'Cat Risk Lead, Demo Carrier' },
  forecastDefinition: 'PRIMER dates a hectare on the first day its accumulated fire probability inside a window of 14 days or less reaches 90%.',
  rescoreHours: 6,
  watchlistBelow: 0.8,
}

const pretty = (name, value) => writeFileSync(join(DATA, name), `${JSON.stringify(value, null, 1)}\n`)
const compact = (name, value) => writeFileSync(join(DATA, name), `${JSON.stringify(value)}\n`)
compact('areas.json', areasOut)
compact('homes.json', world.homes)
compact('assets.json', world.assets)
pretty('ranches.json', ranchesOut)
compact('fires.json', fires)
pretty('watchlist.json', watchlist)
pretty('plans.json', plans)
pretty('negotiations.json', negotiations)
pretty('bundles.json', bundles)
pretty('historical.json', historical)
pretty('models.json', MODELS)
pretty('seasonStats.json', seasonStats)
pretty('portfolio.json', portfolio)
compact('fuelGrid.json', fuelGrid)
pretty('meta.json', meta)

// Help (§17, §19): definitions with this book's figures filled in.
{
  const splitTotals = {}
  for (const p of plans) for (const [k, v] of Object.entries(p.payerSplit)) splitTotals[k] = (splitTotals[k] || 0) + v
  const all = sum(Object.values(splitTotals)) || 1
  const ex = fires.find((f) => f.id === 'PH-01')
  const help = buildHelp({
    meta,
    pricing: PRICING,
    deductible: DEDUCTIBLE,
    locationLimit: LOCATION_LIMIT,
    constructionDR: CONSTRUCTION_DR,
    assetDR: ASSET_DR,
    rangelandDR: fires.find((f) => f.id === 'RP-07').bands.p50.damageRatio,
    inclusions: ex.inclusions,
    exclusions: ex.exclusions,
    contextTiles: CONTEXT_TILES,
    example: { id: ex.id, called: dayMonth(ex.called), leadDays: ex.leadDays, window: ex.windowLabel, from: ex.windowNarrowedFrom, to: ex.windowDays },
    bookSplit: {
      publicShare: (splitTotals.utility + splitTotals.state + splitTotals.county) / all,
      privateShare: (splitTotals.landowner + splitTotals.operator) / all,
      carrierShare: splitTotals.carrier / all,
    },
  })
  pretty('help.json', help)
}
log(`wrote src/data (${fires.length} fires, ${world.homes.length} homes, book: none ${money(bookTotals.none)}, as negotiated ${money(bookTotals.asNegotiated)}, fails ${money(bookTotals.fails)}, carrier ${money(bookTotals.carrier)})`)
