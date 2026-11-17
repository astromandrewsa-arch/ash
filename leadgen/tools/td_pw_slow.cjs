// td_pw_slow.cjs: very slow polite crawl across domains (one browser), per-domain stop after 2 blocks.
// usage: node td_pw_slow.cjs URLFILE OUTDIR [globalDelayMs=30000]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [urlFile, outDir, d] = process.argv.slice(2);
  const delay = parseInt(d || '30000');
  const urls = fs.readFileSync(urlFile, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  const p = await ctx.newPage();
  const blocks = {};
  for (const u of urls) {
    const host = new URL(u).host;
    if ((blocks[host] || 0) >= 2) { console.log('SKIP-BLOCKED-HOST', u); continue; }
    const fn = path.join(outDir, u.replace(/^https?:\/\//, '').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 150));
    if (fs.existsSync(fn + '.html')) { console.log('SKIP', u); continue; }
    try {
      const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(2500);
      const st = r ? r.status() : null; const title = await p.title();
      console.log(new Date().toISOString(), st, u, title.slice(0, 70));
      if (st === 403 || st === 429 || /Just a moment|Attention Required|Access denied/i.test(title)) {
        blocks[host] = (blocks[host] || 0) + 1; console.log('BLOCKED', host, blocks[host]);
      } else {
        fs.writeFileSync(fn + '.html', await p.content());
        fs.writeFileSync(fn + '.txt', await p.evaluate(() => document.title + '\n' + (document.body ? document.body.innerText : '')));
      }
    } catch (e) { console.log('ERR', u, e.message.slice(0, 200)); }
    await p.waitForTimeout(delay);
  }
  await b.close();
  console.log('DONE');
})();
