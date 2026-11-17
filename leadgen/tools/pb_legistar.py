"""Query the public Legistar Web API (same data as the public legislation search) for security/camera matters.
Usage: python3 pb_legistar.py <client> <since YYYY-MM-DD>
Writes raw/permits/bids/legistar_<client>.json. One request every 3.5 s."""
import json, sys, time, urllib.parse, requests

KW = ['camera', 'cctv', 'surveillance', 'access control', 'security system', 'alarm', 'real time crime',
      'license plate', 'security integrat', 'card access', 'video management', 'genetec', 'milestone',
      'avigilon', 'verkada', 'fusus', 'flock', 'low voltage', 'radio enhancement']

def main(client, since):
    s = requests.Session(); s.headers['User-Agent'] = 'Mozilla/5.0 (research script)'
    found = {}
    variants = []
    for k in KW:
        for v in (k, k.upper(), k.title()):
            if v not in variants: variants.append(v)
    for kw in variants:
        f = f"MatterIntroDate ge datetime'{since}' and substringof('{kw}',MatterTitle)"
        url = f'https://webapi.legistar.com/v1/{client}/matters?$filter=' + urllib.parse.quote(f) + '&$top=1000'
        time.sleep(3.5)
        r = s.get(url, timeout=90)
        if r.status_code != 200:
            print(kw, 'HTTP', r.status_code, r.text[:200]); continue
        rows = r.json()
        print(kw, len(rows), flush=True)
        for m in rows:
            m.setdefault('_kw', []).append(kw)
            found.setdefault(m['MatterId'], m)
            if kw not in found[m['MatterId']].get('_kw', []):
                found[m['MatterId']]['_kw'].append(kw)
    out = sorted(found.values(), key=lambda m: m.get('MatterIntroDate') or '', reverse=True)
    json.dump(out, open(f'/home/user/ash/leadgen/raw/permits/bids/legistar_{client}.json', 'w'), indent=1)
    print('total', len(out))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
