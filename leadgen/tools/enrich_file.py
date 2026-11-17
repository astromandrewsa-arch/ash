import json, sys
sys.path.insert(0, '/home/user/ash/leadgen')
from enrich import enrich_many
recs = json.load(open(sys.argv[1]))
urls = [r.get("website") for r in recs if r.get("website")]
res = enrich_many(urls, workers=int(sys.argv[2]) if len(sys.argv) > 2 else 6)
print("done", len(res), sum(1 for v in res.values() if v.get("ok")))
