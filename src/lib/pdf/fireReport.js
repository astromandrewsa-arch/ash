// Per-fire PDF report (CLAUDE.md §17): cover, forecast and fuel, spread snapshots at 1, 8, 24 and
// 48 h, exposure by band, loss with inclusions, plan and payers, negotiation, methods.
import { store } from '../store.js'
import { dayMonth, fullDate } from '../dates.js'
import { formatNumber, formatPct, formatUSDCompact, returnPeriodText } from '../format.js'
import { AMBER, GREEN, INK, MUTED, ORANGE, PAGE, RED, clean, footers, kit, markCover, newDoc } from './pdfKit.js'
import { spreadSnapshots } from './spreadSnapshots.js'

const BAND_NAMES = { p90: 'P90 core', p50: 'P50 expected', p25: 'P25 tail' }

function cover(doc, f, meta, book) {
  doc.setFillColor(28, 28, 28)
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, PAGE.w, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(243, 241, 236)
  doc.text('Pyrome', PAGE.m, 26)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(170, 168, 162)
  doc.text(clean(`PRIMER forecast · issued ${meta.issuedLabel}`), PAGE.m, 32)
  doc.setFontSize(10)
  doc.text('FIRE REPORT', PAGE.m, 96)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(243, 241, 236)
  doc.text(clean(`${f.id} · ${f.name}`), PAGE.m, 110)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(200, 198, 192)
  doc.text(clean(f.place), PAGE.m, 119)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...ORANGE)
  doc.text(clean(f.headerLine), PAGE.m, 134)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(200, 198, 192)
  doc.text(clean(`${f.severity} · ${f.intensity.class} intensity · ${f.ignitionZone.class} of ${formatNumber(f.ignitionZone.hectares)} ha`), PAGE.m, 143)
  doc.text(clean(`Loss ${formatUSDCompact(f.lossLower)} / ${formatUSDCompact(f.lossPoint)} / ${formatUSDCompact(f.lossUpper)} (lower / point / upper)`), PAGE.m, 150)
  doc.setFontSize(9)
  doc.setTextColor(150, 148, 142)
  doc.text(clean(book), PAGE.m, PAGE.h - 24)
  doc.text(clean(`Prepared for ${meta.user.name}, ${meta.user.role}`), PAGE.m, PAGE.h - 18)
}

export async function buildFireReport(f, { doc = newDoc(), first = true, bookName = '', onProgress = () => {} } = {}) {
  const { meta } = store
  const plan = store.planByFire.get(f.id)
  const neg = store.negotiationByFire.get(f.id)
  const k = kit(doc, { title: `${f.id} fire report`, stamp: `Issued ${meta.issuedLabel}` })
  if (!first) doc.addPage()
  cover(doc, f, meta, bookName)
  markCover(doc)

  // Forecast and fuel state
  k.page('Forecast and fuel state')
  k.para(meta.forecastDefinition, { bold: true })
  k.para(`Called ${fullDate(f.called)}, ${f.leadDays} days ahead; the window narrowed from ${f.windowNarrowedFrom} to ${f.windowDays} days and burns ${f.windowLabel} at ${formatPct(f.probability)}.`)
  k.h2('Both clocks')
  const u = f.fuel
  k.grid([
    { label: 'Live fuel moisture', value: `${u.liveFm}% (${u.liveTrendPtsPerDay} pts/day)` },
    { label: 'Curing', value: `${u.curing}%` },
    { label: 'ERC', value: `${u.erc} (Texas 90th ${u.ercPercentile})` },
    { label: '1-h dead fuel', value: `${u.dead1h}%` },
    { label: '10-h dead fuel', value: `${u.dead10h}%` },
    { label: '100-h dead fuel', value: `${u.dead100h}%` },
    { label: '1000-h dead fuel', value: `${u.dead1000h}%` },
    { label: 'KBDI', value: `${u.kbdi}` },
    { label: 'Days since rain', value: `${u.daysSinceRain}` },
  ])
  k.h2('Thresholds behind the date')
  k.table(
    [
      { label: 'Threshold', w: 90 },
      { label: 'Crossed', w: 40 },
      { label: 'Status', w: 48 },
    ],
    u.thresholds.map((t) => [t.name, dayMonth(t.crossedOn), t.projected ? 'projected' : 'crossed']),
  )
  k.h2('Ensemble narrowing')
  k.table(
    [
      { label: 'Issued', w: 40 },
      { label: 'Window', w: 70 },
      { label: 'Days', w: 30, align: 'right' },
      { label: 'Probability', w: 38, align: 'right' },
    ],
    f.narrowing.map((n) => [dayMonth(n.issued), `${dayMonth(n.windowStart)} to ${dayMonth(n.windowEnd)}`, String(n.windowDays), formatPct(n.probability)]),
  )

  // Spread snapshots
  onProgress('Drawing the spread maps')
  const shots = await spreadSnapshots(f, [1, 8, 24, 48])
  k.page('Spread at 1, 8, 24 and 48 hours')
  const w = (PAGE.w - PAGE.m * 2 - 6) / 2
  const h = w * 0.75
  shots.forEach((s, i) => {
    const x = PAGE.m + (i % 2) * (w + 6)
    const y = k.y + Math.floor(i / 2) * (h + 12)
    doc.addImage(s.dataUrl, 'JPEG', x, y, w, h)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...INK)
    doc.text(clean(`${s.hour} h · ${formatNumber(s.ha)} ha in P50`), x, y + h + 5)
  })
  k.y += 2 * (h + 12)
  k.para(`P90 core, P50 expected and P25 tail perimeters over the homes in the path. ${shots.every((s) => s.imagery) ? 'Imagery © Esri, Maxar, Earthstar Geographics.' : 'Imagery could not be read back in this browser; perimeters are drawn on a plain background.'}`, { size: 8, color: MUTED })
  if (f.shape?.events?.length) {
    k.h2('Wind and events')
    k.table(
      [
        { label: 'Hour', w: 20, align: 'right' },
        { label: 'Event', w: 158 },
      ],
      f.shape.events.map((e) => [`h${e.hour}`, e.text]),
    )
  }

  // Exposure by band
  k.page('Exposure by band')
  k.table(
    [
      { label: 'Band', w: 34, bold: true },
      { label: 'Homes', w: 22, align: 'right' },
      { label: 'Assets', w: 20, align: 'right' },
      { label: 'Exposed TIV', w: 34, align: 'right' },
      { label: 'Damage ratio', w: 30, align: 'right' },
      { label: 'Loss', w: 38, align: 'right' },
    ],
    ['p90', 'p50', 'p25'].map((b) => [BAND_NAMES[b], formatNumber(f.bands[b].homes), formatNumber(f.bands[b].assets), formatUSDCompact(f.bands[b].tiv), f.bands[b].damageRatio.toFixed(2), formatUSDCompact(f.bands[b].loss)]),
  )
  k.para(f.exposureText)
  k.h2('Loss')
  k.grid([
    { label: 'Lower (P90)', value: formatUSDCompact(f.lossLower) },
    { label: 'Point (P50)', value: formatUSDCompact(f.lossPoint), color: RED },
    { label: 'Upper (P25)', value: formatUSDCompact(f.lossUpper) },
    { label: 'Ground-up', value: formatUSDCompact(f.groundUpLoss) },
    { label: 'Gross', value: formatUSDCompact(f.grossLoss) },
    { label: 'Return period', value: returnPeriodText(f.returnPeriodYears).replace(' for this book', '') },
  ])
  k.para(`Includes ${f.inclusions.join(', ')}. Excludes ${f.exclusions.join(' and ')}. Analogue: ${f.analogue.name} ${f.analogue.year}, ${formatNumber(f.analogue.acres)} acres.`)

  // Plan and payers
  if (plan) {
    k.page('Intervention plan')
    k.para(`${plan.verdict}. ${plan.summary}`, { bold: true })
    k.table(
      [
        { label: 'Action', w: 72 },
        { label: 'Owner', w: 36 },
        { label: 'Payer', w: 22 },
        { label: 'Cost', w: 20, align: 'right' },
        { label: 'Dates', w: 28 },
      ],
      plan.actions.map((a) => [a.text, a.owner, a.payer, formatUSDCompact(a.cost), `${dayMonth(a.start)}–${dayMonth(a.end)}`]),
    )
    k.h2('Who pays')
    k.grid(
      Object.entries(plan.payerSplit)
        .filter(([, v]) => v > 0)
        .map(([p, v]) => ({ label: p, value: formatUSDCompact(v) })),
      4,
    )
    if (plan.scopeRule) k.para(plan.scopeRule, { size: 8.5 })
    if (plan.statePlanNote) k.para(plan.statePlanNote, { size: 8.5, color: AMBER })
    k.para(plan.mitigationCredit || '', { size: 8.5, color: GREEN })
  }

  // Negotiation
  if (neg) {
    k.h2('Negotiation')
    k.grid([
      { label: 'Stage', value: neg.stage },
      { label: 'Counterparty', value: neg.counterpartyType },
      { label: 'Decision due', value: dayMonth(neg.decisionDue) },
    ])
    k.table(
      [
        { label: 'Day', w: 22 },
        { label: 'Entry', w: 116 },
        { label: 'By', w: 40 },
      ],
      neg.entries.map((e) => [dayMonth(e.day), e.text, e.by]),
      { size: 7.5 },
    )
  }

  // Methods
  k.page('Methods and disclaimer')
  k.para('PRIMER measures live and dead fuel moisture on the ground and dates a hectare on the first day its accumulated fire probability inside a window of 14 days or less reaches 90%. Spread is grown with a Huygens wavelet model on the forecast wind, with night slowdown, wind shifts, fingers, spotting and barriers; P90, P50 and P25 are ensemble bands. Loss applies mean damage ratios by construction and asset to the exposed TIV inside each band.')
  k.para('This report is generated from mock data for a demonstration of the Pyrome insurer portal. Street-style addresses are invented; no figure describes a real policyholder.', { color: MUTED })
  return doc
}

/** Build, number and download one fire's report: pyrome-<fireId>-<date>.pdf. */
export async function exportFireReport(f, { bookName = '', onProgress } = {}) {
  const doc = await buildFireReport(f, { bookName, onProgress })
  footers(doc)
  const name = `pyrome-${f.id}-${store.meta.issueDate}.pdf`
  doc.save(name)
  return { name, pages: doc.getNumberOfPages() }
}
