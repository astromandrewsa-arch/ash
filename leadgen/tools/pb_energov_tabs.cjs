// Open an EnerGov CSS permit detail page, click a named tab (e.g. Attachments, Inspections), log API calls and visible text.
const { chromium } = require('playwright');
const fs = require('fs');
const [url, tab, outPrefix] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1400, height: 1000 } });
  const log = [];
  p.on('request', r => { if (/\/api\/energov\//.test(r.url())) log.push({ t: 'req', m: r.method(), u: r.url(), post: r.postData() }); });
  p.on('response', async r => { if (/\/api\/energov\//.test(r.url())) { let t = ''; try { t = await r.text(); } catch (e) { } log.push({ t: 'resp', s: r.status(), u: r.url(), body: t.slice(0, 2500) }); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto err', e.message));
  await p.waitForTimeout(6000);
  const n = log.length;
  try { await p.click(`text=${tab}`, { timeout: 10000 }); } catch (e) { console.log('tab click err', e.message); }
  await p.waitForTimeout(7000);
  fs.writeFileSync(outPrefix + '_net.json', JSON.stringify(log.slice(n), null, 1));
  fs.writeFileSync(outPrefix + '_text.txt', await p.evaluate(() => document.body.innerText));
  await b.close();
})();
