// td_pw_batch.cjs: visit public URLs sequentially in one headless Chromium session, save HTML + text.
// usage: node td_pw_batch.cjs URLFILE OUTDIR [delayMs=6000]
// Stops (does not retry or work around) if a page returns a challenge/block.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [urlFile, outDir, delayArg] = process.argv.slice(2);
  const delay = parseInt(delayArg || '6000');
  const urls = fs.readFileSync(urlFile, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  const p = await ctx.newPage();
  let blocked = 0;
  for (const u of urls) {
    const slug = u.replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 150);
    const fn = path.join(outDir, slug);
    if (fs.existsSync(fn + '.html')) { console.log('SKIP', u); continue; }
    try {
      const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(2500);
      const st = r ? r.status() : null;
      const title = await p.title();
      console.log(st, u, title.slice(0, 80));
      if (st === 403 || st === 429 || /Just a moment|Attention Required|Access denied/i.test(title)) {
        blocked++; console.log('BLOCKED', u);
        if (blocked >= 2) { console.log('STOPPING after repeated blocks'); break; }
      } else {
        fs.writeFileSync(fn + '.html', await p.content());
        fs.writeFileSync(fn + '.txt', await p.evaluate(() => document.title + '\n' + (document.body ? document.body.innerText : '')));
      }
    } catch (e) { console.log('ERR', u, e.message.slice(0, 200)); }
    await p.waitForTimeout(delay);
  }
  await b.close();
})();
