// Small drawing kit over jsPDF for the Pyrome reports: page chrome, headings, key-value grids and
// tables in the dark-on-light print palette. Text passes through `clean` because the standard PDF
// fonts cannot draw the true minus, arrows or Σ.
import { jsPDF } from 'jspdf'

export const PAGE = { w: 210, h: 297, m: 16 }
export const INK = [28, 28, 28]
export const MUTED = [110, 108, 104]
export const HAIR = [222, 219, 212]
export const ORANGE = [226, 86, 27]
export const RED = [215, 38, 61]
export const GREEN = [30, 158, 90]
export const AMBER = [242, 163, 58]
export const BLUE = [43, 108, 176]

export const clean = (s) =>
  String(s ?? '')
    .replace(/−/g, '-')
    .replace(/→/g, '->')
    .replace(/≈/g, '~')
    .replace(/Σ/g, 'Sum of')
    .replace(/ | /g, ' ')

export function newDoc() {
  return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
}

export function kit(doc, { title, stamp }) {
  let y = PAGE.m
  const k = {
    get y() {
      return y
    },
    set y(v) {
      y = v
    },
    page(heading) {
      doc.addPage()
      y = PAGE.m
      k.chrome()
      if (heading) k.h1(heading)
    },
    chrome() {
      doc.setFillColor(...ORANGE)
      doc.rect(0, 0, PAGE.w, 2.2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(clean(`PYROME · ${title}`), PAGE.m, 8)
      doc.setFont('helvetica', 'normal')
      doc.text(clean(stamp), PAGE.w - PAGE.m, 8, { align: 'right' })
      y = 16
    },
    h1(text) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(...INK)
      doc.text(clean(text), PAGE.m, y + 6)
      y += 12
    },
    h2(text) {
      k.need(12)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      doc.text(clean(text).toUpperCase(), PAGE.m, y + 4)
      doc.setDrawColor(...HAIR)
      doc.line(PAGE.m, y + 6, PAGE.w - PAGE.m, y + 6)
      y += 10
    },
    para(text, { size = 9.5, color = INK, bold = false } = {}) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(clean(text), PAGE.w - PAGE.m * 2)
      k.need(lines.length * size * 0.42 + 2)
      doc.text(lines, PAGE.m, y + size * 0.36)
      y += lines.length * size * 0.42 + 2.5
    },
    need(mm) {
      if (y + mm > PAGE.h - 14) k.page()
    },
    /** Label/value tiles in `cols` columns. */
    grid(items, cols = 3) {
      const w = (PAGE.w - PAGE.m * 2) / cols
      const rows = Math.ceil(items.length / cols)
      k.need(rows * 14)
      items.forEach((it, i) => {
        const x = PAGE.m + (i % cols) * w
        const yy = y + Math.floor(i / cols) * 14
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.text(clean(it.label).toUpperCase(), x, yy + 3)
        doc.setFontSize(12)
        doc.setTextColor(...(it.color || INK))
        doc.text(clean(it.value), x, yy + 9)
      })
      y += rows * 14 + 2
    },
    /** A simple table: cols [{ label, w (mm), align }], rows [[...cells]]. */
    table(cols, rows, { size = 8 } = {}) {
      const line = size * 0.42
      const head = () => {
        k.need(10)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(size - 1)
        doc.setTextColor(...MUTED)
        let x = PAGE.m
        for (const c of cols) {
          doc.text(clean(c.label).toUpperCase(), c.align === 'right' ? x + c.w - 1 : x, y + 4, { align: c.align === 'right' ? 'right' : 'left' })
          x += c.w
        }
        doc.setDrawColor(...HAIR)
        doc.line(PAGE.m, y + 6, PAGE.w - PAGE.m, y + 6)
        y += 8
      }
      head()
      for (const r of rows) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(size)
        const wrapped = r.map((cell, i) => doc.splitTextToSize(clean(cell), cols[i].w - 2))
        const h = Math.max(...wrapped.map((w) => w.length)) * line + 2.5
        if (y + h > PAGE.h - 14) {
          k.page()
          head()
        }
        let x = PAGE.m
        wrapped.forEach((lines, i) => {
          const c = cols[i]
          doc.setTextColor(...(c.color ? c.color(r) : INK))
          doc.setFont('helvetica', c.bold ? 'bold' : 'normal')
          doc.text(lines, c.align === 'right' ? x + c.w - 1 : x, y + line, { align: c.align === 'right' ? 'right' : 'left' })
          x += c.w
        })
        y += h
        doc.setDrawColor(...HAIR)
        doc.line(PAGE.m, y - 1, PAGE.w - PAGE.m, y - 1)
      }
      y += 3
    },
  }
  return k
}

/** Remember a dark cover page so the page footer skips it. */
export function markCover(doc) {
  doc.__covers = doc.__covers || new Set()
  doc.__covers.add(doc.getNumberOfPages())
}

/** "Page n of N" and the mock-data line on every page but the covers. */
export function footers(doc) {
  const n = doc.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    if (doc.__covers?.has(i)) continue
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(`Page ${i} of ${n}`, PAGE.w - PAGE.m, PAGE.h - 8, { align: 'right' })
    doc.text('Mock data for a demonstration of the Pyrome insurer portal. Street-style addresses are invented.', PAGE.m, PAGE.h - 8)
  }
}
