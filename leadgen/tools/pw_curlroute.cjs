// Playwright helper: requests to hosts listed in CURL_HOSTS are fetched with curl (CA bundle incl. the
// missing DigiCert intermediate that the server omits), so the page renders normally with full TLS verification.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'); const path = require('path'); const os = require('os');
const BUNDLE = path.join(__dirname, 'certs', 'bundle_plus.pem');
const HOSTS = (process.env.CURL_HOSTS || 'findapro.resideo.com').split(',');
let n = 0;
async function curlRoute(route) {
  const req = route.request();
  const u = new URL(req.url());
  if (!HOSTS.includes(u.hostname)) return route.continue();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cr'));
  const hdrFile = path.join(tmp, 'h'), bodyFile = path.join(tmp, 'b');
  const args = ['-sS', '--compressed', '--cacert', BUNDLE, '-m', '60', '-X', req.method(), '-D', hdrFile, '-o', bodyFile];
  const h = await req.allHeaders();
  for (const [k, v] of Object.entries(h)) { if (k.startsWith(':') || ['accept-encoding','content-length','host'].includes(k)) continue; args.push('-H', `${k}: ${v}`); }
  const pd = req.postDataBuffer();
  if (pd) { const pf = path.join(tmp, 'p'); fs.writeFileSync(pf, pd); args.push('--data-binary', '@' + pf); }
  args.push(req.url());
  try { execFileSync('curl', args, { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { return route.abort(); }
  const raw = fs.readFileSync(hdrFile, 'utf8').split(/\r?\n\r?\n/).filter(Boolean).pop();
  const lines = raw.split(/\r?\n/); const status = parseInt(lines[0].split(' ')[1]);
  const headers = {};
  for (const l of lines.slice(1)) { const i = l.indexOf(':'); if (i < 0) continue; const k = l.slice(0, i).trim().toLowerCase(); if (['content-encoding','transfer-encoding','content-length'].includes(k)) continue; headers[k] = headers[k] ? headers[k] + (k === 'set-cookie' ? '\n' : ', ') + l.slice(i + 1).trim() : l.slice(i + 1).trim(); }
  n++;
  await route.fulfill({ status, headers, body: fs.readFileSync(bodyFile) });
  fs.rmSync(tmp, { recursive: true, force: true });
}
async function open() {
  const b = await chromium.launch({ proxy: { server: 'http://127.0.0.1:46823' } });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', viewport: { width: 1366, height: 900 } });
  await ctx.route('**/*', curlRoute);
  return { b, ctx };
}
module.exports = { open };
if (require.main === module) {
  (async () => {
    const [url, out] = [process.argv[2], process.argv[3]];
    const { b, ctx } = await open();
    const p = await ctx.newPage(); const log = [];
    p.on('request', r => { if (['xhr', 'fetch'].includes(r.resourceType())) log.push(r.method() + ' ' + r.url() + ' ' + (r.postData() || '').slice(0, 800)); });
    try { await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }); } catch (e) { console.log('goto err', e.message); }
    await p.waitForTimeout(5000);
    fs.writeFileSync(out + '.txt', await p.evaluate(() => document.body ? document.body.innerText : ''));
    fs.writeFileSync(out + '.html', await p.content());
    fs.writeFileSync(out + '.net.txt', log.join('\n'));
    await p.screenshot({ path: out + '.png', fullPage: true });
    console.log('final url', p.url(), 'curl-routed', n);
    await b.close();
  })();
}
