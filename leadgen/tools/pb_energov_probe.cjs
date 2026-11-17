// Probe an EnerGov CSS public search: open the search hash URL and log API requests/responses.
const { chromium } = require('playwright');
const fs = require('fs');
const [url, outPrefix, waitMs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  const log = [];
  p.on('request', r => { if (/\/api\//.test(r.url())) { log.push({type:'req', method:r.method(), url:r.url(), headers:r.headers(), post:r.postData()}); } });
  p.on('response', async r => { if (/\/api\//.test(r.url())) { let t=''; try { t = await r.text(); } catch(e){} log.push({type:'resp', status:r.status(), url:r.url(), body:t.slice(0,3000)}); } });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e=>console.log('goto err', e.message));
  await p.waitForTimeout(parseInt(waitMs||'10000'));
  console.log('URL', p.url());
  fs.writeFileSync(outPrefix + '_net.json', JSON.stringify(log, null, 1));
  fs.writeFileSync(outPrefix + '_text.txt', await p.evaluate(()=>document.body.innerText));
  await b.close();
})();
