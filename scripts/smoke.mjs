#!/usr/bin/env node
// Smoke test (CLAUDE.md §21). Builds nothing: run `npm run build` first.
//
//   node scripts/smoke.mjs --pass 3            screenshots to screenshots/3-<screen>.png
//   node scripts/smoke.mjs --pass 11 --tour    also drives the tour end to end
//
// Starts `vite preview` on port 4173 (or attaches to one already running), opens the app at
// 1440×900, clicks every rail item, opens PH-01 from the search box, plays the spread, opens
// More info, runs the Simulation toggle and screenshots each screen. Exits non-zero on any
// console error, warning, page error or missing element. Steps whose feature arrives in a later
// pass are reported as skipped until that pass.

import { spawn } from 'node:child_process'
import { X509Certificate, createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHOTS = join(ROOT, 'screenshots')
const PORT = 4173

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const option = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}
const PASS_LABEL = option('pass', 'dev')
const PASS = /^\d+$/.test(PASS_LABEL) ? Number(PASS_LABEL) : 99 // "final" runs every step
const WANT_TOUR = flag('tour')
const HEADED = flag('headed')

// ---------------------------------------------------------------------------
// Preview server
// ---------------------------------------------------------------------------

function basePath() {
  const cfg = readFileSync(join(ROOT, 'vite.config.js'), 'utf8')
  const m = cfg.match(/base:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : '/'
}

const APP_URL = `http://localhost:${PORT}${basePath()}`

async function reachable(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch {
    return false
  }
}

async function ensurePreview() {
  if (await reachable(APP_URL)) return { attached: true, stop: () => {} }
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) throw new Error('dist/ is missing: run `npm run build` first')
  const child = spawn(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (d) => (log += d))
  child.stderr.on('data', (d) => (log += d))
  for (let i = 0; i < 60; i++) {
    if (await reachable(APP_URL)) return { attached: false, stop: () => child.kill('SIGTERM') }
    await sleep(500)
  }
  child.kill('SIGTERM')
  throw new Error(`vite preview did not start:\n${log}`)
}

// ---------------------------------------------------------------------------
// Browser (routes through the session proxy when one is configured)
// ---------------------------------------------------------------------------

function proxyArgs() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy
  if (!proxy) return []
  const out = [`--proxy-server=${proxy}`]
  // Trust the proxy's own CA (by public-key pin) instead of turning certificate checks off.
  const ca = '/root/.ccr/agent-proxy-ca.crt'
  if (existsSync(ca)) {
    const spki = new X509Certificate(readFileSync(ca)).publicKey.export({ type: 'spki', format: 'der' })
    out.push(`--ignore-certificate-errors-spki-list=${createHash('sha256').update(spki).digest('base64')}`)
  }
  return out
}

// Hosts whose failures are network conditions of the machine running the test, not app faults.
const EXTERNAL_HOSTS = /server\.arcgisonline\.com|fonts\.(googleapis|gstatic)\.com/

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/** PH-01 once the v2 map and search are in (pass 3); before that, the first v1 fire. */
function firstFireId() {
  if (PASS >= 3) return 'PH-01'
  const v1 = join(ROOT, 'src', 'data', 'v1', 'fires.json')
  if (existsSync(v1)) return JSON.parse(readFileSync(v1, 'utf8'))[0].id
  return 'PH-01'
}

async function shot(page, name) {
  const file = join(SHOTS, `${PASS_LABEL}-${name}.png`)
  await page.screenshot({ path: file })
  shots.push(file)
}

async function railTo(page, id) {
  await page.click(`.rail [data-view="${id}"]`)
  await page.mouse.move(760, 500) // park the pointer so rail tooltips stay out of screenshots
  await sleep(800)
}

async function waitForTiles(page, ms = 6000) {
  await page
    .waitForFunction(() => {
      const tiles = [...document.querySelectorAll('.leaflet-tile')]
      return tiles.length > 0 && tiles.every((t) => t.complete)
    }, null, { timeout: ms })
    .catch(() => {})
}

const shots = []
const fireId = firstFireId()

const STEPS = [
  {
    name: 'load app and wait for the map',
    since: 1,
    run: async (page) => {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.leaflet-container', { timeout: 20000 })
      await page.waitForSelector('.rail [data-view="map"]', { timeout: 20000 })
      // Dismiss the first-visit welcome if it is showing (tour arrives in pass 11).
      const notNow = page.getByRole('button', { name: 'Not now' })
      if (await notNow.isVisible().catch(() => false)) await notNow.click()
      await waitForTiles(page)
      await sleep(600)
      await shot(page, 'map')
    },
  },
  {
    name: 'slider to 0 reveals the dated fires',
    since: 1,
    run: async (page) => {
      const slider = page.locator('input[aria-label="Days until fire"]')
      await slider.focus()
      await page.keyboard.press('End')
      await sleep(900)
      const shown = await page.locator('.dslider-count').innerText()
      if (!/^\s*(\d+) of \1\b/.test(shown)) throw new Error(`slider at 0 should show every fire, got "${shown}"`)
      await shot(page, 'map-fires')
    },
  },
  {
    name: 'click each rail item',
    since: 1,
    run: async (page) => {
      const ids = await page.$$eval('.rail [data-view]', (els) => els.map((e) => e.dataset.view))
      const expected = ['map', 'locations', 'simulation', 'premium', 'negotiation', 'accuracy', 'reports', 'help']
      const missing = expected.filter((id) => !ids.includes(id))
      if (missing.length) throw new Error(`rail is missing: ${missing.join(', ')}`)
      for (const id of expected) {
        await railTo(page, id)
        if (id !== 'map') await shot(page, id)
        if (id === 'help') {
          await page.keyboard.press('Escape')
          await sleep(300)
        }
      }
      await railTo(page, 'map')
    },
  },
  {
    name: `open ${fireId} via the search box`,
    since: 1,
    run: async (page) => {
      const box = page.locator('input[aria-label="Search a place, fire ID, asset or bundle"]')
      await box.click()
      await box.fill(fireId)
      await sleep(250)
      await box.press('Enter')
      await page.waitForSelector('.side-drawer.is-open', { timeout: 8000 })
      await sleep(1800)
      await waitForTiles(page, 4000)
      await shot(page, 'fire')
    },
  },
  {
    name: 'play the spread',
    since: 1,
    run: async (page) => {
      // From pass 4 the spread autoplays on open: reset it first, then play from ignition.
      const reset = page.locator('button[aria-label="Reset spread"]').first()
      if ((await reset.count()) && (await reset.isEnabled().catch(() => false))) {
        await reset.click()
        await sleep(300)
      }
      const play = page.locator('button[aria-label="Play spread"], button[aria-label="Play"]').first()
      await play.waitFor({ state: 'visible', timeout: 5000 })
      await play.click()
      await sleep(5000)
      await shot(page, 'spread')
    },
  },
  {
    name: 'open More info',
    since: 5,
    run: async (page) => {
      await page.getByRole('button', { name: 'More info' }).first().click()
      await page.waitForSelector('.more-info.is-open', { timeout: 5000 })
      await sleep(600)
      await shot(page, 'more-info')
      await page.keyboard.press('Escape')
      await sleep(300)
    },
  },
  {
    name: 'run the Simulation toggle',
    since: 7,
    run: async (page) => {
      await railTo(page, 'simulation')
      await sleep(400)
      for (const label of ['No intervention', 'Every plan fails', 'As negotiated']) {
        await page.getByRole('button', { name: label, exact: true }).first().click()
        await sleep(700)
      }
      await shot(page, 'simulation-toggle')
    },
  },
  {
    name: 'Premium Intelligence: bundle, science panel, sources, rate gap and 2027 on the map',
    since: 8,
    run: async (page) => {
      await railTo(page, 'premium')
      const rows = page.locator('.bundle-table tbody tr')
      await rows.first().waitFor({ state: 'visible', timeout: 5000 })
      if ((await rows.count()) < 8) throw new Error(`expected at least eight bundles, got ${await rows.count()}`)
      await rows.nth(1).click()
      await page.waitForSelector('.sci-panel .sci-sensitivity', { timeout: 3000 })
      await sleep(400)
      await shot(page, 'premium-bundle')
      // The technical premium and the season block sit below the fold.
      await page.evaluate(() => document.querySelector('.page-host')?.scrollTo(0, 10000))
      await sleep(400)
      await shot(page, 'premium-lower')
      await page.evaluate(() => document.querySelector('.page-host')?.scrollTo(0, 0))
      await sleep(200)
      await page.locator('.ctx-info').first().click()
      await page.waitForSelector('#help-sources', { timeout: 3000 })
      await sleep(500)
      await shot(page, 'premium-sources')
      await page.keyboard.press('Escape')
      await sleep(300)
      await page.locator('.sci-map').click()
      await page.waitForSelector('.bundle-label', { timeout: 8000 })
      await sleep(1800)
      await page.getByRole('radio', { name: '2027', exact: true }).click()
      await sleep(800)
      await waitForTiles(page, 4000)
      await shot(page, 'rate-gap-2027')
      await page.getByRole('radio', { name: 'Today', exact: true }).click()
      await page.keyboard.press('Escape')
      await page.locator('.qv-chip', { hasText: 'Rate gap' }).click()
      await sleep(400)
    },
  },
  {
    name: 'Historical Accuracy: exhibit, chart, twelve fires, ruled-out calls, before/after',
    since: 9,
    run: async (page) => {
      await railTo(page, 'accuracy')
      await page.waitForSelector('.exhibit tbody tr', { timeout: 5000 })
      const count = (sel) => page.locator(sel).count()
      if ((await count('.exhibit tbody tr')) !== 8) throw new Error('the model exhibit should have eight rows')
      if ((await count('.hist-table tbody tr')) !== 12) throw new Error('expected twelve historical fires')
      if ((await count('.ruled tbody tr')) !== 4) throw new Error('expected four ruled-out rows')
      if (!(await count('.hit .recharts-line'))) throw new Error('the hit-rate chart is missing')
      const footer = (await page.locator('.acc-footer').innerText()).replace(/[’']/g, "'").trim()
      if (footer !== "Named models' mechanics and horizons are sourced. Per-fire figures are an illustrative back-test.") throw new Error(`footer differs from §16: "${footer}"`)
      await page.locator('.hist-table').scrollIntoViewIfNeeded()
      await sleep(300)
      await shot(page, 'accuracy-fires')
      await page.locator('.ba2-frame').scrollIntoViewIfNeeded()
      await sleep(1200)
      const box = await page.locator('.ba2-divider').boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2, { steps: 8 })
      await page.mouse.up()
      await waitForTiles(page, 4000)
      await sleep(400)
      await shot(page, 'accuracy-lower')
    },
  },
  {
    name: 'tour end to end',
    since: 11,
    optionalFlag: 'tour',
    run: async (page) => {
      const { runTour } = await import('./lib/tourDriver.mjs')
      await runTour(page, { shot: (name) => shot(page, name), sleep })
    },
  },
]

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  mkdirSync(SHOTS, { recursive: true })
  const server = await ensurePreview()
  const browser = await chromium.launch({ headless: !HEADED, args: proxyArgs() })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, acceptDownloads: true })
  const page = await context.newPage()

  const consoleErrors = []
  const consoleWarnings = []
  const networkNotes = []
  page.on('console', (msg) => {
    const where = msg.location()?.url || ''
    const text = `${msg.text()}${where ? ` (${where})` : ''}`
    if (msg.type() === 'error') (EXTERNAL_HOSTS.test(text) ? networkNotes : consoleErrors).push(text)
    else if (msg.type() === 'warning') consoleWarnings.push(text)
  })
  page.on('pageerror', (err) => consoleErrors.push(`page error: ${err.message}`))
  page.on('requestfailed', (req) => {
    const note = `${req.failure()?.errorText ?? 'failed'} ${req.url()}`
    if (EXTERNAL_HOSTS.test(req.url())) networkNotes.push(note)
    else if (!/net::ERR_ABORTED/.test(note)) consoleErrors.push(`request failed: ${note}`)
  })

  const results = []
  for (const step of STEPS) {
    if (step.optionalFlag && !flag(step.optionalFlag)) {
      results.push({ step, status: 'skipped', note: `pass --${step.optionalFlag} to run` })
      continue
    }
    const required = step.since <= PASS
    const t0 = Date.now()
    try {
      await step.run(page)
      results.push({ step, status: 'ok', ms: Date.now() - t0 })
    } catch (err) {
      results.push({ step, status: required ? 'failed' : 'skipped', note: required ? err.message.split('\n')[0] : `arrives in pass ${step.since}` })
      // Leave the app in a known state for the next step.
      await page.keyboard.press('Escape').catch(() => {})
    }
  }

  await browser.close()
  server.stop()

  const failed = results.filter((r) => r.status === 'failed')
  console.log(`\nSmoke test — pass ${PASS_LABEL} — ${APP_URL}${server.attached ? ' (attached)' : ''}`)
  for (const r of results) {
    const mark = r.status === 'ok' ? '✓' : r.status === 'failed' ? '✗' : '·'
    console.log(`  ${mark} ${r.step.name}${r.ms ? ` (${r.ms} ms)` : ''}${r.note ? ` — ${r.note}` : ''}`)
  }
  console.log(`\nScreenshots (${shots.length}):`)
  for (const s of shots) console.log(`  ${s.replace(`${ROOT}/`, '')}`)
  if (networkNotes.length) console.log(`\nExternal network notes (not counted): ${networkNotes.length}, e.g. ${networkNotes[0]}`)
  if (consoleWarnings.length) {
    console.log(`\nConsole warnings (${consoleWarnings.length}):`)
    for (const w of [...new Set(consoleWarnings)].slice(0, 20)) console.log(`  ! ${w}`)
  }
  if (consoleErrors.length) {
    console.log(`\nConsole errors (${consoleErrors.length}):`)
    for (const e of [...new Set(consoleErrors)].slice(0, 20)) console.log(`  ✗ ${e}`)
  }
  const ok = failed.length === 0 && consoleErrors.length === 0 && consoleWarnings.length === 0
  console.log(`\n${ok ? 'PASS' : 'FAIL'}: ${failed.length} failed steps, ${consoleErrors.length} console errors, ${consoleWarnings.length} warnings`)
  process.exit(ok ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
