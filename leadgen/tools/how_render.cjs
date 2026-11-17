// how_render.cjs: render public pages in headless Chromium, save redacted HTML + visible text to leadgen/raw/how/.
// usage: node how_render.cjs [--wait=MS] URL [URL ...]   (sequential, >=3.5 s between page loads)
// Phone numbers are stripped before saving (hard rule: never record phone numbers).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'raw', 'how');
const PH = /(?<![\w\/=.-])(?:\+?1[\s.-]?)?\(?\b[2-9]\d{2}\)?[\s.\-–‑]?\d{3}[\s.\-–‑]\d{4}\b(?:\s*(?:x|ext\.?)\s*\d{1,5})?/g;
const TEL = /tel:[+\d\-\.\(\)%20 ]+/g;
const redact = s => s.replace(TEL, 'tel:REDACTED').replace(PH, '[phone redacted]');
const slug = u => { let s = u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '').replace(/[^A-Za-z0-9]+/g, '_'); return 'r_' + s.slice(0, 140); };
(async () => {
  let wait = 4000; const urls = [];
  for (const a of process.argv.slice(2)) { if (a.startsWith('--wait=')) wait = parseInt(a.slice(7)); else if (a.startsWith('@')) urls.push(...fs.readFileSync(a.slice(1), 'utf8').split('\n').map(s => s.trim()).filter(Boolean)); else urls.push(a); }
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  for (const url of urls) {
    const base = path.join(OUT, slug(url));
    const t0 = Date.now();
    try {
      const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(wait);
      console.log('STATUS', r && r.status(), url, 'FINAL', p.url());
      fs.writeFileSync(base + '.html', redact(await p.content()));
      fs.writeFileSync(base + '.txt', redact(await p.evaluate(() => document.title + '\n' + (document.body ? document.body.innerText : ''))));
    } catch (e) { console.log('ERR', url, e.message.slice(0, 200)); }
    const el = Date.now() - t0; if (el < 3500) await p.waitForTimeout(3500 - el);
  }
  await b.close();
})();
