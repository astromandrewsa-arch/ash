// Render a public Power BI "publish to web" report and dump visible text + screenshot (read-only).
const { chromium } = require('playwright');
const fs = require('fs');
const [url, outPrefix, waitMs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1600, height: 1100 } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 120000 }).catch(e => console.log('goto err', e.message));
  await p.waitForTimeout(parseInt(waitMs || '15000'));
  const txt = await p.evaluate(() => document.body.innerText);
  fs.writeFileSync(outPrefix + '_text.txt', txt);
  const pages = await p.evaluate(() => Array.from(document.querySelectorAll('[role="tab"], .sectionItem, button')).map(e => (e.getAttribute('aria-label') || e.innerText || '').trim()).filter(Boolean).slice(0, 80));
  console.log(JSON.stringify(pages));
  await p.screenshot({ path: outPrefix + '.png' });
  await b.close();
})();
