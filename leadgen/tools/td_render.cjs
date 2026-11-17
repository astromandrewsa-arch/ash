// td_render.cjs: open one public page in plain headless Chromium, save HTML + visible text.
// usage: node td_render.cjs URL OUTBASE [waitMs]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [url, outBase, waitMs] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  try {
    const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(parseInt(waitMs || '4000'));
    console.log('STATUS', r && r.status(), 'FINAL', p.url());
    fs.writeFileSync(outBase + '.html', await p.content());
    fs.writeFileSync(outBase + '.txt', await p.evaluate(() => document.title + '\n' + (document.body ? document.body.innerText : '')));
  } catch (e) { console.log('ERR', e.message.slice(0, 300)); }
  await b.close();
})();
