// Generic probe: open URL, optionally type into a selector and press Enter, log non-asset requests and responses.
const { chromium } = require('playwright');
const [url, sel, val, waitMs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: {width: 1400, height: 1000} });
  const skip = /\.(png|jpe?g|svg|woff2?|ttf|css|webp|gif|ico)(\?|$)|google|segment|analytics|hotjar|doubleclick|linkedin|facebook|bing|clarity|cookielaw|onetrust|sentry|mixpanel|crazyegg|zoominfo|marketo|mktoresp|g2crowd|g2\.com|openai|hubspot|hs-|demandbase|6sc|adsrvr|twitter|tiktok|qualified|drift|intercom|vimeo|youtube|cloudflareinsights|newrelic|nr-data|datadog|optimizely|pendo|fullstory|bizible|licdn|reddit|quantserve|clearbit|bombora|terminus|gstatic|recaptcha|cdn-cgi/
  p.on('response', async r => { const u = r.url(); if (skip.test(u)) return; const ct = r.headers()['content-type']||''; console.log('RESP', r.status(), r.request().method(), ct.split(';')[0], u.slice(0, 250)); if (/json/.test(ct)) { try { const t = await r.text(); console.log('   BODY', t.slice(0, 400).replace(/\s+/g,' ')); } catch(e){} } });
  p.on('request', r => { if (r.method()==='POST' && !skip.test(r.url())) console.log('POSTDATA', r.url().slice(0,150), (r.postData()||'').slice(0,400)); });
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(e=>console.log('goto err', e.message));
  if (sel && sel !== '-') {
    try { await p.fill(sel, val); await p.press(sel, 'Enter'); } catch (e) { console.log('fill err', e.message); }
  }
  await p.waitForTimeout(parseInt(waitMs||'8000'));
  console.log('URL', p.url());
  require('fs').writeFileSync('/home/user/ash/leadgen/raw/mfr_b/probe_last.html', await p.content());
  require('fs').writeFileSync('/home/user/ash/leadgen/raw/mfr_b/probe_last.txt', await p.evaluate(()=>document.body.innerText));
  await b.close();
})();
