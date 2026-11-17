const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ proxy: { server: 'http://127.0.0.1:46823' } });
  const p = await (await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' })).newPage();
  const log = [];
  p.on('request', r => { if (r.url().includes('/rde/')) log.push(r.method() + ' ' + r.url() + ' ' + (r.postData() || '')); });
  await p.goto('https://www.resideo.com/us/en/find-a-pro/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(8000);
  const sels = await p.$$eval('select', ss => ss.map(s => ({ id: s.id, name: s.name, opts: [...s.options].map(o => o.value + '=' + o.text) })));
  console.log(JSON.stringify(sels));
  const inputs = await p.$$eval('input', ss => ss.filter(s => s.type !== 'hidden').map(s => ({ id: s.id, name: s.name, ph: s.placeholder, type: s.type })));
  console.log(JSON.stringify(inputs));
  fs.writeFileSync('../raw/resideo_fap2_form.html', await p.content());
  await b.close();
  console.log(log.join('\n'));
})();
