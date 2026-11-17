"""how_gis.py: pull Miami-Dade County public GIS layers (ArcGIS Online, org 8Pc9XBTAsYuxx9Ny) needed for the
houses-of-worship segment. Phone fields are never requested. Saves JSON to leadgen/raw/how/gis_<layer>.json.
usage: python3 how_gis.py LAYER "FIELD1,FIELD2" [WHERE]
"""
import sys, os, json, time, requests
B = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw', 'how')
layer, fields = sys.argv[1], sys.argv[2]
where = sys.argv[3] if len(sys.argv) > 3 else '1=1'
assert 'PHONE' not in fields.upper()
feats, off = [], 0
while True:
    r = requests.get(f'{B}/{layer}/FeatureServer/0/query', params={
        'where': where, 'outFields': fields, 'returnGeometry': 'false', 'f': 'json',
        'resultOffset': off, 'resultRecordCount': 1000, 'orderByFields': 'OBJECTID'}, timeout=60)
    d = r.json()
    fs = [f['attributes'] for f in d.get('features', [])]
    feats += fs
    print(layer, off, len(fs), flush=True)
    if not d.get('exceededTransferLimit') and len(fs) < 1000:
        break
    off += len(fs)
    time.sleep(3.5)
json.dump(feats, open(os.path.join(OUT, f'gis_{layer}.json'), 'w'), indent=1)
print('total', len(feats))
