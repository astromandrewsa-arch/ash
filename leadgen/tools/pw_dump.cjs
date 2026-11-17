// Usage: node pw_dump.cjs <url> <outprefix> [waitms]
// Opens a public page in headless Chromium, saves rendered HTML, visible text, and XHR/fetch request log.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [url, out, waitms] = process.argv.slice(2);
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  const log = [];
  p.on('request', r => { const t = r.resourceType(); if (t === 'xhr' || t === 'fetch' || t === 'document' || t === 'script') log.push(`${t} ${r.method()} ${r.url()}${r.postData() ? ' BODY ' + r.postData().slice(0, 500) : ''}`); });
  let status = null;
  try { const resp = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); status = resp && resp.status(); } catch (e) { console.log('goto error', e.message); }
  await p.waitForTimeout(parseInt(waitms || '6000'));
  fs.writeFileSync(out + '.html', await p.content());
  fs.writeFileSync(out + '.txt', await p.evaluate(() => document.body ? document.body.innerText : ''));
  fs.writeFileSync(out + '.net.txt', log.join('\n'));
  console.log('status', status, 'title', await p.title());
  await b.close();
})();
