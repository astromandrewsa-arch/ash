// how_netlog.cjs: open a public page and list XHR/fetch request URLs (to find the JSON endpoint the public page itself calls).
// usage: node how_netlog.cjs URL [waitMs]
const { chromium } = require('playwright');
(async () => {
  const [url, w] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
  p.on('request', r => { if (['xhr', 'fetch'].includes(r.resourceType())) console.log('REQ', r.method(), r.url().slice(0, 300), (r.postData() || '').slice(0, 200)); });
  try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(parseInt(w || '8000')); } catch (e) { console.log('ERR', e.message.slice(0, 200)); }
  await b.close();
})();
