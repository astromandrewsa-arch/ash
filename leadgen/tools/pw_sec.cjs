const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ proxy: { server: 'http://127.0.0.1:46823' } });
  const p = await b.newPage();
  for (const u of process.argv.slice(2)) {
    try { const r = await p.goto(u, {timeout: 45000}); const s = await r.securityDetails(); console.log(u, r.status(), JSON.stringify(s), JSON.stringify(await r.allHeaders()).slice(0,300)); } catch(e) { console.log(u, 'ERR', e.message.slice(0,200)); }
  }
  await b.close();
})();
