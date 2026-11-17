// Walks the public Resideo Find-a-Pro questionnaire, clicking given option labels in order, then dumps the page.
const { open } = require('./pw_curlroute.cjs');
const fs = require('fs');
(async () => {
  const out = process.argv[2]; const steps = process.argv.slice(3);
  const { b, ctx } = await open();
  const p = await ctx.newPage(); const log = [];
  p.on('request', r => { if (['xhr', 'fetch'].includes(r.resourceType()) && r.url().includes('apex')) log.push(r.method() + ' ' + r.url() + ' ' + (r.postData() || '').slice(0, 1500)); });
  p.on('response', async r => { if (r.url().includes('apex/execute') && r.request().postData() && !/DataUri|AssetDeveloper/.test(r.request().postData())) { try { log.push('RESP ' + (await r.text()).slice(0, 3000)); } catch (e) {} } });
  try { await p.goto('https://findapro.resideo.com/', { waitUntil: 'load', timeout: 90000 }); } catch (e) { console.log('goto err', e.message); }
  await p.waitForTimeout(15000);
  try { await p.getByText('DECLINE ALL', { exact: true }).click({ timeout: 5000 }); } catch (e) {}
  for (const s of steps) {
    if (s.startsWith('FILL:')) { const [, sel, val] = s.split(':'); await p.fill(sel, val); }
    else if (s.startsWith('WAIT:')) { await p.waitForTimeout(parseInt(s.slice(5))); }
    else { try { await p.getByText(s, { exact: true }).first().click({ timeout: 10000 }); } catch (e) { console.log('click fail', s, e.message.slice(0, 150)); } }
    await p.waitForTimeout(4000);
  }
  await p.waitForTimeout(6000);
  fs.writeFileSync(out + '.txt', await p.evaluate(() => document.body.innerText));
  fs.writeFileSync(out + '.html', await p.content());
  fs.writeFileSync(out + '.net.txt', log.join('\n'));
  await p.screenshot({ path: out + '.png', fullPage: true });
  await b.close();
})();
