// Premium Intelligence inputs (CLAUDE.md §15). Policies, TIV and premium are computed from the
// generated homes and ranches; the rates, adequacy and recommendations below are the §15 table.
// Austin North is not in the table: its rates are set here and logged in DECISIONS.md.

export const BUNDLE_RATES = {
  'austin-lake': { primer: 7.5, rec2027: 0.18, recText: '+18%' },
  'austin-north': { primer: 6.4, rec2027: 0.08, recText: '+8%' },
  'panhandle-north': { primer: 12.4, rec2027: 0.31, recText: '+31%, corridor homes to a surcharge class' },
  'hill-country-west': { primer: 7.8, rec2027: 0.14, recText: '+14%' },
  'lost-pines': { primer: 8.4, rec2027: 0.12, recText: '+12%' },
  'cross-timbers': { primer: 9.1, rec2027: 0.09, recText: '+9%' },
  'oklahoma-central': { primer: 8.6, rec2027: 0.13, recText: '+13%' },
  'permian-rolling-plains': { primer: 6.6, rec2027: -0.04, recText: '−4%, win share' },
  'osage-rangeland': { primer: 5.1, rec2027: -0.07, recText: '−7%' },
}

// Carrier's filed 2027 change (§15): +6% Austin, +4% elsewhere.
export const FILED_2027 = { 'austin-lake': 0.06, 'austin-north': 0.06 }
export const FILED_DEFAULT = 0.04

// Science panel inputs per bundle (fuel load after the wet spring, drying trends, spread shift).
export const SCIENCE = {
  'austin-lake': { fuelLoad: 0.31, liveTrend: 1.4, liveCross: '2026-10-08', dead100: 1.2, dead1000: 0.9, ros: 0.42, shift: 'High → Very High' },
  'austin-north': { fuelLoad: 0.24, liveTrend: 1.2, liveCross: '2026-10-14', dead100: 1.0, dead1000: 0.8, ros: 0.33, shift: 'Moderate → High' },
  'panhandle-north': { fuelLoad: 0.38, liveTrend: 1.8, liveCross: '2026-10-01', dead100: 1.4, dead1000: 1.1, ros: 0.5, shift: 'Very High → Extreme' },
  'hill-country-west': { fuelLoad: 0.27, liveTrend: 1.3, liveCross: '2026-10-19', dead100: 1.1, dead1000: 0.9, ros: 0.37, shift: 'High → Very High' },
  'lost-pines': { fuelLoad: 0.22, liveTrend: 1.3, liveCross: '2026-10-16', dead100: 1.0, dead1000: 1.0, ros: 0.34, shift: 'High → Very High' },
  'cross-timbers': { fuelLoad: 0.29, liveTrend: 1.5, liveCross: '2026-10-05', dead100: 1.2, dead1000: 0.9, ros: 0.4, shift: 'High → Very High' },
  'oklahoma-central': { fuelLoad: 0.26, liveTrend: 1.6, liveCross: '2026-10-03', dead100: 1.3, dead1000: 1.0, ros: 0.44, shift: 'Very High → Extreme' },
  'permian-rolling-plains': { fuelLoad: 0.2, liveTrend: 1.9, liveCross: '2026-09-30', dead100: 1.1, dead1000: 0.8, ros: 0.31, shift: 'High → Very High' },
  'osage-rangeland': { fuelLoad: 0.21, liveTrend: 1.1, liveCross: '2026-10-21', dead100: 0.9, dead1000: 0.7, ros: 0.3, shift: 'Moderate → High' },
}

// Long-run wildfire AAL per $1,000 TIV (the cat-model view the rate was filed on).
export const AAL_PER_1000 = {
  'austin-lake': 1.05, 'austin-north': 0.82, 'panhandle-north': 1.9, 'hill-country-west': 1.12, 'lost-pines': 1.28,
  'cross-timbers': 1.34, 'oklahoma-central': 1.22, 'permian-rolling-plains': 0.92, 'osage-rangeland': 0.7,
}

// Technical premium P = (FE + E[L] × (1 + ALAE%)) / (1 − VE% − RoP%)
export const PRICING = { fixedExpensePerPolicy: 95, alae: 0.12, variableExpense: 0.24, returnOnPremium: 0.06 }

// Texas context tiles (public figures; listed in the Help sources note).
export const CONTEXT_TILES = [
  { id: 'avg-premium', label: 'Texas average homeowners premium', value: '$3,291', note: '4th highest in the US', source: 'NAIC / Insurance Information Institute, 2025 average premium' },
  { id: 'increases', label: 'Rate increases 2023–25', value: '21.1% · 18.7% · 4.3%', note: 'Average filed increases by year', source: 'Texas Department of Insurance rate filings' },
  { id: 'filings', label: 'Largest US rate filings, Q1 2026', value: '9 of 10', note: 'were Texan', source: 'S&P Global Market Intelligence, Q1 2026' },
  { id: 'non-renewal', label: 'Non-renewal rate', value: '2.62%', note: 'Texas homeowners, latest year', source: 'US Senate Budget Committee, non-renewal data by state' },
  { id: 'fair-plan', label: 'Texas FAIR Plan', value: '127,835 policies', note: '$40.4B TIV', source: 'Texas FAIR Plan Association exposure report' },
  { id: 'regime', label: 'Rate regime', value: 'File-and-use', note: 'No prior approval', source: 'Texas Insurance Code §2251' },
]
