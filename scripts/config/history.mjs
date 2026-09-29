// Historical Accuracy inputs (CLAUDE.md §16). Model mechanics and horizons are as published by
// each vendor; the per-fire rows are an illustrative back-test (the page footer says so).

const LEADS = [1, 3, 5, 7, 10, 14, 21, 30]
const byLead = (vals) => Object.fromEntries(LEADS.map((l, i) => [l, vals[i] ?? null]))

export const MODELS = [
  {
    id: 'primer', name: 'PRIMER', shortName: 'PRIMER', vendor: 'Pyrome', version: '2026.3', family: 'primer',
    outputs: 'Date, window, probability, spread and intensity per hectare', resolution: '1 ha', horizonDays: 30, horizonText: '30 days, narrowing',
    fuelTreatment: 'Measured live and dead fuel moisture on the ground', hitRateByLead: byLead([0.96, 0.95, 0.94, 0.93, 0.92, 0.9, 0.84, 0.76]), brier: 0.06,
  },
  {
    id: 'moodys', name: 'Moody’s RMS North America Wildfire HD', shortName: 'Moody’s', vendor: 'Moody’s', version: 'v2.0', family: 'cat',
    outputs: 'AAL, EP, loss cost', resolution: '30 m LANDFIRE fuels; 100,000-year event set', horizonDays: null, horizonText: 'No date',
    fuelTreatment: 'Fuel moisture from historical weather', hitRateByLead: byLead([]), longRunHitRate: 0.14, brier: null,
  },
  {
    id: 'verisk', name: 'Verisk US Wildfire and FireLine', shortName: 'Verisk', vendor: 'Verisk', version: 'v4.0', family: 'cat',
    outputs: 'AAL, EP, smoke, conflagration; FireLine score 0–30', resolution: 'Static fuel map', horizonDays: null, horizonText: 'No date',
    fuelTreatment: 'Static fuel map', hitRateByLead: byLead([]), longRunHitRate: 0.12, brier: null,
  },
  {
    id: 'kcc', name: 'KCC US Wildfire', shortName: 'KCC', vendor: 'Karen Clark & Co.', version: 'v3.0', family: 'cat',
    outputs: '850,000 physics-based events; AAL, EP', resolution: 'Event set on VPD climatology', horizonDays: null, horizonText: 'No date',
    fuelTreatment: 'Vapour-pressure-deficit climatology', hitRateByLead: byLead([]), longRunHitRate: 0.13, brier: null,
  },
  {
    id: 'cotality', name: 'Cotality Wildfire Risk Score and US model', shortName: 'Cotality', vendor: 'Cotality', version: 'v26', family: 'cat',
    outputs: '5–100 score, conflagration, mitigation; AAL/EP', resolution: 'Parcel score', horizonDays: null, horizonText: 'No date',
    fuelTreatment: 'Static fuels with mitigation adjustments', hitRateByLead: byLead([]), longRunHitRate: 0.16, brier: null,
  },
  {
    id: 'technosylva', name: 'Technosylva FireSight / FireRisk', shortName: 'Technosylva', vendor: 'Technosylva', version: '2026', family: 'short',
    outputs: 'Daily simulations, buildings threatened', resolution: '2 km weather', horizonDays: 3, horizonText: '3 days',
    fuelTreatment: 'Modelled live fuel', hitRateByLead: byLead([0.71, 0.58]), brier: null,
  },
  {
    id: 'ecmwf', name: 'ECMWF Probability of Fire', shortName: 'ECMWF', vendor: 'ECMWF', version: 'PoF 2025', family: 'short',
    outputs: 'Probability of a satellite detection in a 9 km cell', resolution: '9 km', horizonDays: 10, horizonText: '10 days',
    fuelTreatment: 'Modelled fuel; grass R ≈ 0.65', hitRateByLead: byLead([0.62, 0.55, 0.47, 0.39, 0.3]), brier: 0.19,
  },
  {
    id: 'nfdrs', name: 'NFDRS / Texas A&M ERC', shortName: 'NFDRS', vendor: 'USFS / Texas A&M Forest Service', version: 'NFDRS 2016', family: 'short',
    outputs: 'Danger rating per station', resolution: 'Weather station', horizonDays: 7, horizonText: '7 days',
    fuelTreatment: 'Modelled dead fuel moisture', hitRateByLead: byLead([0.34, 0.3, 0.27, 0.24]), brier: null,
  },
]

const others = (moodys, verisk, kcc, cotality, technosylva, ecmwf, nfdrs) => ({ moodys, verisk, kcc, cotality, technosylva, ecmwf, nfdrs })

export const HISTORICAL = [
  { id: 'HX-01', name: 'Brazos Bend', date: '2025-11-14', place: 'Palo Pinto County, TX', outcomeType: 'prevented', primer: { leadDays: 18, probability: 0.9, windowFrom: '2025-11-12', windowTo: '2025-11-16', burnedOnDay: null }, others: others('AAL $1.3 per $1,000; no date', 'FireLine 17; no date', 'no date', 'Score 71; no date', 'Flagged "high" 2 days out', 'PoF 0.22 at 7 days', 'ERC 58, 5 days out'), cost: 210000, premiumSaved: 3.1e6, realisedLoss: 0 },
  { id: 'HX-02', name: 'James River', date: '2025-12-02', place: 'Mason County, TX', outcomeType: 'prevented', primer: { leadDays: 22, probability: 0.91, windowFrom: '2025-11-30', windowTo: '2025-12-05', burnedOnDay: null }, others: others('no date', 'FireLine 12; no date', 'no date', 'Score 58; no date', 'no date', 'PoF 0.18 at 9 days', 'ERC 51, 6 days out'), cost: 140000, premiumSaved: 1.6e6, realisedLoss: 0 },
  { id: 'HX-03', name: 'Red Deer Creek', date: '2026-01-18', place: 'Roberts County, TX', outcomeType: 'declined-burned', primer: { leadDays: 16, probability: 0.9, windowFrom: '2026-01-16', windowTo: '2026-01-20', burnedOnDay: '2026-01-18' }, others: others('AAL $2.1 per $1,000; no date', 'FireLine 21; no date', 'no date', 'Score 80; no date', 'Flagged "extreme" 1 day out', 'PoF 0.41 at 5 days', 'ERC 64, 4 days out'), cost: 0, premiumSaved: 0, realisedLoss: 6.4e6 },
  { id: 'HX-04', name: 'Buck Creek', date: '2026-02-09', place: 'Childress County, TX', outcomeType: 'backtest', primer: { leadDays: 19, probability: 0.9, windowFrom: '2026-02-07', windowTo: '2026-02-11', burnedOnDay: '2026-02-09' }, others: others('no date', 'FireLine 9; no date', 'no date', 'Score 44; no date', 'no date', 'no date', 'ERC 49, 2 days out'), cost: 0, premiumSaved: 0, realisedLoss: 0 },
  { id: 'HX-05', name: 'Gageby Creek', date: '2026-02-26', place: 'Hemphill County, TX', outcomeType: 'prevented', primer: { leadDays: 24, probability: 0.92, windowFrom: '2026-02-24', windowTo: '2026-02-28', burnedOnDay: null }, others: others('AAL $1.9 per $1,000; no date', 'FireLine 20; no date', 'no date', 'Score 77; no date', 'Flagged "high" 3 days out', 'PoF 0.35 at 6 days', 'ERC 61, 5 days out'), cost: 460000, premiumSaved: 7.9e6, realisedLoss: 0 },
  { id: 'HX-06', name: 'Pecan Bayou', date: '2026-03-04', place: 'Coleman County, TX', outcomeType: 'declined-burned', primer: { leadDays: 14, probability: 0.9, windowFrom: '2026-03-02', windowTo: '2026-03-06', burnedOnDay: '2026-03-04' }, others: others('no date', 'FireLine 14; no date', 'no date', 'Score 62; no date', 'Flagged "high" 1 day out', 'PoF 0.29 at 4 days', 'ERC 56, 3 days out'), cost: 0, premiumSaved: 0, realisedLoss: 3.8e6 },
  { id: 'HX-07', name: 'Cottonwood Creek', date: '2026-03-12', place: 'Logan County, OK', outcomeType: 'prevented', primer: { leadDays: 17, probability: 0.9, windowFrom: '2026-03-10', windowTo: '2026-03-14', burnedOnDay: null }, others: others('AAL $1.2 per $1,000; no date', 'FireLine 15; no date', 'no date', 'Score 66; no date', 'Flagged "high" 2 days out', 'PoF 0.33 at 5 days', 'ERC 57, 4 days out'), cost: 320000, premiumSaved: 4.4e6, realisedLoss: 0 },
  { id: 'HX-08', name: 'Wolf Creek', date: '2026-03-21', place: 'Woodward County, OK', outcomeType: 'backtest', primer: { leadDays: 19, probability: 0.91, windowFrom: '2026-03-19', windowTo: '2026-03-23', burnedOnDay: '2026-03-21' }, others: others('no date', 'FireLine 11; no date', 'no date', 'Score 49; no date', 'no date', 'PoF 0.19 at 3 days', 'ERC 54, 2 days out'), cost: 0, premiumSaved: 0, realisedLoss: 0 },
  { id: 'HX-09', name: 'Hubbard Creek', date: '2026-04-02', place: 'Stephens County, TX', outcomeType: 'declined-burned', primer: { leadDays: 15, probability: 0.9, windowFrom: '2026-03-31', windowTo: '2026-04-04', burnedOnDay: '2026-04-02' }, others: others('no date', 'FireLine 13; no date', 'no date', 'Score 59; no date', 'Flagged "high" 1 day out', 'PoF 0.27 at 4 days', 'ERC 55, 3 days out'), cost: 0, premiumSaved: 0, realisedLoss: 9.1e6 },
  { id: 'HX-10', name: 'Hoover Point', date: '2026-04-15', place: 'Burnet County, TX', outcomeType: 'prevented', primer: { leadDays: 21, probability: 0.9, windowFrom: '2026-04-13', windowTo: '2026-04-17', burnedOnDay: null }, others: others('AAL $1.1 per $1,000; no date', 'FireLine 16; no date', 'no date', 'Score 68; no date', 'no date', 'PoF 0.21 at 8 days', 'ERC 53, 5 days out'), cost: 180000, premiumSaved: 2.7e6, realisedLoss: 0 },
  { id: 'HX-11', name: 'Turtle Creek', date: '2026-07-07', place: 'Kerr County, TX', outcomeType: 'backtest', primer: { leadDays: 19, probability: 0.9, windowFrom: '2026-07-05', windowTo: '2026-07-09', burnedOnDay: '2026-07-07' }, others: others('no date', 'FireLine 10; no date', 'no date', 'Score 52; no date', 'no date', 'no date', 'ERC 50, 1 day out'), cost: 0, premiumSaved: 0, realisedLoss: 0 },
  { id: 'HX-12', name: 'Sweetwater Creek', date: '2026-08-03', place: 'Wheeler County, TX', outcomeType: 'declined-burned', primer: { leadDays: 18, probability: 0.91, windowFrom: '2026-08-01', windowTo: '2026-08-05', burnedOnDay: '2026-08-03' }, others: others('AAL $1.6 per $1,000; no date', 'FireLine 19; no date', 'no date', 'Score 74; no date', 'Flagged "extreme" 1 day out', 'PoF 0.38 at 5 days', 'ERC 62, 4 days out'), cost: 0, premiumSaved: 0, realisedLoss: 5.2e6 },
]

export const RULED_OUT = [
  { place: 'Circuit 14, Hill Country feeder', theyCalled: 'Utility wildfire plan flagged 9 km of clearance, $1.4M', primerSaw: '1000-h fuel stayed above 15%, curing never passed 65%', outcome: 'No fire, $1.4M saved', saved: 1.4e6 },
  { place: 'Lago Vista blocks', theyCalled: 'Cotality score 78 prompted a non-renewal review of 310 policies', primerSaw: 'Sensors below every threshold, grazed continuity 40%', outcome: 'Policies kept, no loss', saved: 0 },
  { place: 'Osage north', theyCalled: 'State proposed a 6,000 ac burn, $180k', primerSaw: 'Patch-burn mosaic already caps spread', outcome: 'Withdrawn', saved: 180000 },
  { place: 'Steiner Ranch draw', theyCalled: 'No model flagged, FireLine 2', primerSaw: 'PRIMER dated it 22 days out', outcome: 'Break cut, $9.6M avoided', saved: 9.6e6 },
]

export const SEASON = {
  season: '2025–26',
  datedFires: 128,
  prevented: 41,
  premiumSaved: 38.6e6,
  declinedLoss: 61.2e6,
  brier: 0.06,
  hitRate14: 0.9,
  reliability: [
    { forecast: 0.6, observed: 0.57 },
    { forecast: 0.7, observed: 0.68 },
    { forecast: 0.8, observed: 0.79 },
    { forecast: 0.9, observed: 0.89 },
  ],
  brierByModel: [
    { model: 'PRIMER', range: '1–5 days', value: 0.05 },
    { model: 'PRIMER', range: '14 days', value: 0.06 },
    { model: 'ECMWF', range: '1–5 days', value: 0.19 },
  ],
  la2025: {
    title: 'LA 2025: flash estimates vs the final',
    final: '~$40B',
    finalValue: 40e9,
    estimates: [
      { model: 'Moody’s', value: '$20–30B', low: 20e9, high: 30e9 },
      { model: 'Verisk', value: '$28–35B', low: 28e9, high: 35e9 },
      { model: 'KCC', value: '~$28B', low: 28e9, high: 28e9 },
    ],
    note: 'Cotality found ~75% of Eaton losses sat in "low-to-moderate" risk classes.',
  },
  crabapple: { center: [30.392, -98.783], name: 'Crabapple', year: 2025, acres: 9858 },
  footer: 'Named models’ mechanics and horizons are sourced. Per-fire figures are an illustrative back-test.',
}
