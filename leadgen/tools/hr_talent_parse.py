import json, re, collections
d = json.load(open('/home/user/ash/leadgen/raw/hiring/talent_cards.json'))
seen = {}
for key, v in d.items():
    for c in v['cards']:
        h = c['href']
        if h not in seen:
            seen[h] = {'text': c['text'], 'queries': [key]}
        else:
            seen[h]['queries'].append(key)
NEG = re.compile(r'security (guard|officer)|armed|unarmed|nail tech|veterinar|pharmacy|hvac|maintenance tech|guard\b|patrol|concierge|cyber|soc analyst|it support|help ?desk|network support|automotive|aviation|dental|medical', re.I)
POS = re.compile(r'cctv|camera|access control|alarm|low.?voltage|security (system|tech|install|integrat|sales)|surveillance|intrusion|integrator|fire alarm', re.I)
rows = []
for h, v in seen.items():
    t = v['text']
    parts = t.split(' | ')
    title = parts[0] if parts else ''
    comp = parts[1] if len(parts) > 1 else ''
    if NEG.search(title): continue
    if not POS.search(t): continue
    m = re.search(r'Last updated: ([^|]+)', t)
    rows.append((comp, title, (m.group(1).strip() if m else ''), h, t))
rows.sort()
for r in rows:
    print(f"{r[0]} || {r[1]} || {r[2]} || {r[3]}")
print(len(rows), 'relevant of', len(seen))
