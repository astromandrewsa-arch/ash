// Generic read-only probe: open URL, log JSON API responses (url + first chars), save visible text to <outPrefix>_text.txt.
const { chromium } = require('playwright');
const fs = require('fs');
const [url, outPrefix, waitMs, filter] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1500, height: 1100 } });
  const re = new RegExp(filter || 'api', 'i');
  const log = [];
  p.on('request', r => { if (re.test(r.url()) && r.method() === 'POST') log.push({ t: 'post', u: r.url(), body: (r.postData() || '').slice(0, 2000) }); });
  p.on('response', async r => { const ct = r.headers()['content-type'] || ''; if (re.test(r.url()) && /json/.test(ct)) { let t = ''; try { t = await r.text(); } catch (e) { } log.push({ t: 'resp', s: r.status(), u: r.url(), body: t.slice(0, 4000) }); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto err', e.message));
  await p.waitForTimeout(parseInt(waitMs || '8000'));
  fs.writeFileSync(outPrefix + '_net.json', JSON.stringify(log, null, 1));
  fs.writeFileSync(outPrefix + '_text.txt', await p.evaluate(() => document.body.innerText));
  for (const x of log) console.log(x.t, x.s || '', x.u.slice(0, 200));
  await b.close();
})();
