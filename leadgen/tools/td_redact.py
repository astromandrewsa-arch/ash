"""td_redact.py: strip US phone-number patterns from saved raw files (rule: never record phone numbers).
usage: python3 td_redact.py FILE [FILE ...]"""
import re, sys
PH = re.compile(r'(?<![\w/=.-])(?:\+?1[\s.-]?)?\(?\b[2-9]\d{2}\)?[\s.\-–‑]?\d{3}[\s.\-–‑]\d{4}\b(?:\s*(?:x|ext\.?)\s*\d{1,5})?')
TEL = re.compile(r'tel:[+\d\-\.\(\)%20 ]+')
def redact(s):
    s = TEL.sub('tel:REDACTED', s)
    return PH.sub('[phone redacted]', s)
if __name__ == '__main__':
    for f in sys.argv[1:]:
        try:
            s = open(f, encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        r = redact(s)
        if r != s:
            open(f, 'w', encoding='utf-8').write(r)
