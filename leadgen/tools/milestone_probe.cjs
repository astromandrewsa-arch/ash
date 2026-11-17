const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  p.on('request', r => { const u = r.url(); if (/impartner/.test(u) && /locator\/v1|query|search/.test(u)) console.log('REQ', r.method(), decodeURIComponent(u), r.postData() || ''); });
  await p.goto('https://www.milestonesys.com/where-to-buy-reseller-and-distributor/', { waitUntil: 'networkidle', timeout: 90000 }).catch(e => console.log('goto', e.message));
  await p.waitForTimeout(3000);
  // try to find inputs inside the locator
  const inputs = await p.evaluate(() => Array.from(document.querySelectorAll('input,select,button')).map(e => [e.tagName, e.type, e.name, e.id, e.placeholder, (e.innerText||'').slice(0,40), e.className.toString().slice(0,60)]).filter(x => x.join('').length));
  console.log(JSON.stringify(inputs.slice(0, 80)));
  await b.close();
})();
