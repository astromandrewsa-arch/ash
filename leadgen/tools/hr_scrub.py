"""Remove phone-number patterns from every text file in leadgen/raw/hiring (rule: never store phone numbers)."""
import re, os
D = '/home/user/ash/leadgen/raw/hiring'
PH = re.compile(r'(\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b|\b\d{3}\.\d{3}\.\d{4}\b|\b8\d{2}[.-][0-9A-Z]{3}[.-][0-9A-Z]{4}\b')
n = 0
for root, _, files in os.walk(D):
    for f in files:
        p = os.path.join(root, f)
        try:
            t = open(p, encoding='utf-8', errors='ignore').read()
        except Exception:
            continue
        t2 = PH.sub('[phone removed]', t)
        t2 = re.sub(r'tel:[^"\'\s<>]+', 'tel:[removed]', t2)
        if t2 != t:
            open(p, 'w', encoding='utf-8').write(t2); n += 1
print('scrubbed files:', n)
