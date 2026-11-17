const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const zip = process.argv[2] || '33134', radius = process.argv[3] || '50';
  const b = await chromium.launch({ proxy: { server: 'http://127.0.0.1:46823' } });
  const p = await (await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' })).newPage();
  const log = [];
  p.on('request', r => { if (r.url().includes('/rde/') || r.url().includes('maps.googleapis.com/maps/api/place') || r.url().includes('geocode')) log.push('REQ ' + r.method() + ' ' + r.url() + ' ' + (r.postData() || '')); });
  p.on('response', async r => { if (r.url().includes('/rde/findAPro') && !r.url().includes('categories')) { try { log.push('RESP ' + (await r.text()).slice(0, 2500)); } catch (e) {} } });
  await p.goto('https://www.resideo.com/us/en/find-a-pro/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(8000);
  try { await p.click('#onetrust-reject-all-handler', { timeout: 3000 }); } catch (e) {}
  try { await p.getByText('DECLINE ALL', { exact: true }).click({ timeout: 3000 }); } catch (e) {}
  await p.click('#ZipCode'); await p.type('#ZipCode', zip, { delay: 120 });
  await p.waitForTimeout(2500);
  const pac = await p.$$eval('.pac-item', xs => xs.map(x => x.innerText));
  console.log('pac', JSON.stringify(pac));
  if (pac.length) { await p.click('.pac-item >> nth=0'); await p.waitForTimeout(1500); }
  await p.click('#radius-dropdown-menu'); await p.click(`a.radius-selector-anchor[data-value="${radius}"]`);
  await p.click('#service-type-dropdown-menu'); await p.click('a.service-type-selector-anchor[data-value="98551"]');
  await p.click('#go-button');
  await p.waitForTimeout(10000);
  const txt = await p.evaluate(() => document.querySelector('#sidebar') ? document.querySelector('#sidebar').innerText : '');
  const summ = await p.evaluate(() => (document.querySelector('.service-type-results') || {}).innerText);
  console.log('SUMMARY', summ);
  fs.writeFileSync('../raw/resideo_fap2_res.txt', txt.replace(/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g, '[phone removed]'));
  fs.writeFileSync('../raw/resideo_fap2_res.html', (await p.content()).replace(/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g, '[phone removed]'));
  console.log(log.join('\n').replace(/\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g, '[phone removed]').slice(0, 6000));
  await b.close();
})();
