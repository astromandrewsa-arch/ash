"""Pull low-voltage / alarm / CCTV / access-control / BDA permits from the public Miami-Dade County ArcGIS layer
"Building Permits Issued By Miami-Dade County - 2 Previous Years to Present" (MDPublisher, open data).
ContractorPhone is deliberately NOT requested (lead-gen rule: never record phone numbers).
One request every 3.5 s."""
import json, time, sys, requests

URL = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/miamidade_permit_data/FeatureServer/0/query'
OUT = '/home/user/ash/leadgen/raw/permits/mdc_lowvoltage_permits.json'
CATS = ['FIRE ALARM SPECLT', 'MUNICIPAL FIRE ALARM', 'FIRE ALARM', 'DATA COMMUNICATION CABLES', 'SOUND & INTERCOM',
        'BURGLAR ALARM', 'TELEPHONE AND COMMUNICATION', 'MUNICIPAL SPECIALTY WIRING', 'SPECIALTY WIRING',
        'IN BUILDING PUBLIC RADIO ENCHANCEMENT SYSTEM', 'IN BUILDING PUBLIC RADIO ENHANCEMENT SYSTEM',
        'SMART HOUSE SYSTEMS', 'LOW VOLTAGE ELECTRIFIED FENCE', 'ENERGY MANAGEMENT SYSTEM']
FIELDS = ['PermitIssuedDate', 'ApplicationDate', 'PermitNumber', 'ProcessNumber', 'MasterPermitNumber', 'PermitType',
          'ResidentialCommercial', 'EstimatedValue', 'ApplicationTypeDescription', 'ProposedUseDescription',
          'DetailDescriptionComments', 'FolioNumber', 'OwnerName', 'PropertyAddress', 'ContractorNumber', 'ContractorName',
          'ContractorAddress', 'ContractorCity', 'ContractorState', 'ContractorZip', 'StructureFloors'] + \
         [f'CategoryDescription{i}' for i in range(1, 11)] + ['City', 'ObjectId']

def where():
    inlist = ','.join("'" + c.replace("'", "''") + "'" for c in CATS)
    parts = [f'CategoryDescription{i} IN ({inlist})' for i in range(1, 11)]
    for kw in ['CAMERA', 'CCTV', 'ACCESS CONTROL', 'SECURITY SYSTEM', 'LOW VOLT', 'CARD READER', 'SURVEILLANCE', 'BURGLAR', 'FIRE ALARM', 'BDA', 'BI-DIRECTIONAL', 'ERRCS']:
        parts.append(f"UPPER(DetailDescriptionComments) LIKE '%{kw}%'")
    return '(' + ' OR '.join(parts) + ')'

def main():
    s = requests.Session(); s.headers['User-Agent'] = 'Mozilla/5.0 (research script)'
    w = where()
    r = s.post(URL, data={'where': w, 'returnCountOnly': 'true', 'f': 'json'}, timeout=90).json()
    print('count', r); total = r.get('count', 0)
    rows = []; off = 0
    while off < total:
        time.sleep(3.5)
        d = s.post(URL, data={'where': w, 'outFields': ','.join(FIELDS), 'orderByFields': 'ObjectId', 'resultOffset': off,
                              'resultRecordCount': 1000, 'returnGeometry': 'false', 'f': 'json'}, timeout=120).json()
        feats = d.get('features', [])
        if not feats:
            print('no features at', off, str(d)[:300]); break
        rows += [f['attributes'] for f in feats]
        off += len(feats)
        print(off, '/', total, flush=True)
    json.dump(rows, open(OUT, 'w'), indent=0)
    print('saved', len(rows))

if __name__ == '__main__':
    main()
