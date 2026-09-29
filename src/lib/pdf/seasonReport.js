// Season report (CLAUDE.md §17): the same generator across every dated fire in the book, after a
// summary of the book, the 30-day outcomes and the Historical Accuracy tiles.
import { store } from '../store.js'
import { bookFires } from '../selectors.js'
import { bookSimulation } from '../simulation.js'
import { dayMonth } from '../dates.js'
import { formatNumber, formatPct, formatUSDCompact } from '../format.js'
import { GREEN, MUTED, ORANGE, PAGE, RED, clean, footers, kit, markCover, newDoc } from './pdfKit.js'
import { buildFireReport } from './fireReport.js'

const TILE_FORMAT = { number: formatNumber, money: (v) => formatUSDCompact(v), decimal: (v) => v.toFixed(2), pct: (v) => formatPct(v) }

export async function buildSeasonReport(portfolioId, { onProgress = () => {} } = {}) {
  const { meta, seasonStats: s } = store
  const book = store.portfolio.portfolios.find((p) => p.id === portfolioId)
  const fires = bookFires(portfolioId)
  const sim = bookSimulation(portfolioId)
  const doc = newDoc()
  const k = kit(doc, { title: 'Season report', stamp: `Issued ${meta.issuedLabel}` })

  // Cover
  doc.setFillColor(28, 28, 28)
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, PAGE.w, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(243, 241, 236)
  doc.text('Pyrome', PAGE.m, 26)
  doc.setFontSize(30)
  doc.text('Season report', PAGE.m, 110)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(200, 198, 192)
  doc.text(clean(`${book.name} · ${s.season} season and the next 30 days`), PAGE.m, 120)
  doc.text(clean(`PRIMER forecast issued ${meta.issuedLabel}`), PAGE.m, 128)
  markCover(doc)

  // Book and the next 30 days
  k.page('The book and the next 30 days')
  k.grid([
    { label: 'Total insured value', value: formatUSDCompact(book.totals.tiv) },
    { label: 'Homes covered', value: formatNumber(book.totals.homes) },
    { label: 'Premium in force', value: formatUSDCompact(book.totals.premium) },
    { label: 'Fires dated', value: formatNumber(fires.length) },
    { label: 'No intervention', value: formatUSDCompact(sim.totals.none), color: RED },
    { label: 'As negotiated', value: formatUSDCompact(sim.totals.asNegotiated), color: GREEN },
  ])
  k.table(
    [
      { label: 'Fire', w: 20, bold: true },
      { label: 'Place', w: 50 },
      { label: 'Window', w: 30 },
      { label: 'Prob.', w: 14, align: 'right' },
      { label: 'Point loss', w: 24, align: 'right' },
      { label: 'Band', w: 40, align: 'right' },
    ],
    fires.map((f) => [f.id, f.name, f.windowLabel, formatPct(f.probability), formatUSDCompact(f.lossPoint), `${formatUSDCompact(f.lossLower)} to ${formatUSDCompact(f.lossUpper)}`]),
  )

  // Historical Accuracy
  k.page(`Historical accuracy · ${s.season}`)
  k.grid(s.tiles.map((t) => ({ label: t.label, value: TILE_FORMAT[t.format](t.value) })))
  k.table(
    [
      { label: 'Date', w: 22 },
      { label: 'Fire', w: 44 },
      { label: 'PRIMER said', w: 52 },
      { label: 'Outcome', w: 60 },
    ],
    store.historical.fires.map((h) => [dayMonth(h.date), `${h.name}, ${h.place}`, h.primerSaid, h.sentence]),
    { size: 7.5 },
  )
  k.para(s.footer, { size: 8, color: MUTED })

  // Every fire, with the per-fire generator.
  for (let i = 0; i < fires.length; i++) {
    onProgress(`Fire ${i + 1} of ${fires.length}: ${fires[i].id}`, (i + 1) / (fires.length + 1))
    await buildFireReport(fires[i], { doc, first: false, bookName: book.name })
  }
  footers(doc)
  return doc
}

/** Build and download the season report for a book: pyrome-season-<date>.pdf. */
export async function exportSeasonReport(portfolioId, { onProgress } = {}) {
  const doc = await buildSeasonReport(portfolioId, { onProgress })
  const name = `pyrome-season-${store.meta.issueDate}.pdf`
  doc.save(name)
  return { name, pages: doc.getNumberOfPages() }
}
