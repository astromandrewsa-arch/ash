// usage: node probe_page.cjs URL OUTFILE [waitms]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', viewport: {width: 1366, height: 900} });
  const p = await ctx.newPage();
  const reqs = [];
  p.on('request', r => { if (['xhr','fetch'].includes(r.resourceType())) reqs.push(r.method() + ' ' + r.url()); });
  let status = null;
  try { const resp = await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 }); status = resp && resp.status(); } catch (e) { console.log('ERR', e.message); }
  await p.waitForTimeout(parseInt(process.argv[4] || '4000'));
  const html = await p.content();
  require('fs').writeFileSync(process.argv[3], html);
  console.log('status', status, 'len', html.length, 'title', await p.title());
  console.log(reqs.slice(0, 40).join('\n'));
  await b.close();
})();
