// Open an EnerGov CSS permit page, open Attachments tab, click a named attachment and capture the request/response it makes (download test).
const { chromium } = require('playwright');
const fs = require('fs');
const [url, fileName, outPrefix] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ acceptDownloads: true, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1400, height: 1000 } });
  const p = await ctx.newPage();
  const log = [];
  p.on('request', r => { if (/\/api\//.test(r.url()) && !/resource|tenantSettings|Home\/|calendar/.test(r.url())) log.push({ t: 'req', m: r.method(), u: r.url(), post: r.postData(), h: r.headers() }); });
  p.on('response', async r => { if (/\/api\//.test(r.url()) && !/resource|tenantSettings|Home\/|calendar/.test(r.url())) { let t = ''; const ct = r.headers()['content-type'] || ''; try { if (/json|text/.test(ct)) t = (await r.text()).slice(0, 1500); else t = '[binary ' + ct + ']'; } catch (e) { } log.push({ t: 'resp', s: r.status(), u: r.url(), ct, body: t }); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto err', e.message));
  await p.waitForTimeout(5000);
  try { await p.click('text=Attachments', { timeout: 10000 }); } catch (e) { console.log('tab err', e.message); }
  await p.waitForTimeout(5000);
  const n = log.length;
  const dlP = p.waitForEvent('download', { timeout: 20000 }).catch(() => null);
  try { await p.click(`text=${fileName}`, { timeout: 10000 }); } catch (e) { console.log('file click err', e.message); }
  const dl = await dlP;
  if (dl) { const path = outPrefix + '_' + dl.suggestedFilename(); await dl.saveAs(path); console.log('downloaded', path); }
  await p.waitForTimeout(4000);
  fs.writeFileSync(outPrefix + '_net.json', JSON.stringify(log.slice(n), null, 1));
  console.log('pages', ctx.pages().length);
  await b.close();
})();
