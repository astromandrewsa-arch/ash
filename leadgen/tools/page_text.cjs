// Open one public page in headless Chromium and save its visible text.
const { chromium } = require('playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' });
  try { const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); console.log('STATUS', r && r.status()); await p.waitForTimeout(2500);
    require('fs').writeFileSync(out, await p.evaluate(() => document.title + '\n' + document.body.innerText)); } catch (e) { console.log('ERR', e.message.slice(0, 200)); }
  await b.close();
})();
