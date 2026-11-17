const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' });
  p.on('request', r => { const u=r.url(); if (!/\.(png|jpg|svg|woff2?|css|webp|gif)(\?|$)/.test(u) && !/google|segment|analytics|hotjar|doubleclick|linkedin|facebook|bing/.test(u)) console.log('REQ', r.method(), u.slice(0,200)); });
  await p.goto('https://www.verkada.com/find-partners/', { waitUntil: 'networkidle', timeout: 60000 });
  const inp = await p.$('input[placeholder="Search by postal code"]');
  await inp.fill('33134');
  await inp.press('Enter');
  await p.waitForTimeout(6000);
  console.log('URL', p.url());
  const t = await p.evaluate(() => document.body.innerText);
  const i = t.indexOf('Authorized Partners');
  console.log(t.slice(Math.max(0,i-100), i+1500));
  await b.close();
})();
