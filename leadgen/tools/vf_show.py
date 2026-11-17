"""Print boilerplate-filtered text of a company's About/Team/Contact-like pages (phone-free) for manual review."""
import json, re, sys, collections
sys.path.insert(0, '/home/user/ash/leadgen/tools')
pat = re.compile(r'about|team|leader|staff|who-we|our-company|history|nosotros|management|people|meet|founder|owner|contact|location|office', re.I)
slug = sys.argv[1]; lim = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
extra = re.compile(sys.argv[3], re.I) if len(sys.argv) > 3 else None
d = json.load(open(f'/home/user/ash/leadgen/raw/verify/{slug}.json'))
cnt = collections.Counter()
for p in d['pages']:
    for l in set(x.strip() for x in p['text'].split('\n')):
        cnt[l] += 1
multi = len(d['pages']) > 2
for i, p in enumerate(d['pages']):
    if pat.search(p['url']) or (extra and extra.search(p['url'])) or (i == 0 and len(sys.argv) > 4):
        lines = [l.strip() for l in p['text'].split('\n') if l.strip() and (not multi or cnt[l.strip()] < 2 or re.search(r'\d{5}|@', l))]
        print('=== ', p['url']); print('\n'.join(lines)[:lim]); print()
