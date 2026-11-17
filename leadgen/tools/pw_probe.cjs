// Generic probe: open a URL, log XHR/fetch requests, save rendered text + screenshot.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [url, out] = [process.argv[2], process.argv[3]];
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:46823' } });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1366, height: 900} });
  const p = await ctx.newPage();
  const log = [];
  p.on('request', r => { if (['xhr','fetch'].includes(r.resourceType())) log.push(r.method()+' '+r.url()+' '+(r.postData()||'').slice(0,500)); });
  try { await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch(e) { console.log('goto err', e.message); }
  await p.waitForTimeout(4000);
  fs.writeFileSync(out + '.txt', await p.evaluate(() => document.body ? document.body.innerText : ''));
  fs.writeFileSync(out + '.html', await p.content());
  fs.writeFileSync(out + '.net.txt', log.join('\n'));
  await p.screenshot({ path: out + '.png', fullPage: false });
  console.log('final url', p.url());
  await b.close();
})();
