#!/usr/bin/env node
// One-off: vendors real geography from Esri's public Living Atlas feature services into scripts/geo/.
// The data generator reads only these committed files, so `npm run data` stays offline and
// deterministic. Re-run by hand only to refresh the geometry:
//
//   NODE_USE_ENV_PROXY=1 node scripts/fetchGeo.mjs
//
// Sources (public, no key): USA Detailed Water Bodies, USA Rivers and Streams, USA Freeway System,
// US Wind Turbine Database. Geometry is generalised to ~30 m and rounded to 5 decimals.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'geo')
const BASE = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services'

// [west, south, east, north] around each dated fire and the places the map needs water for.
export const REGIONS = {
  panhandle: [-101.9, 35.35, -99.8, 36.15],
  austin: [-98.2, 30.15, -97.75, 30.62],
  bastrop: [-97.45, 29.95, -97.05, 30.25],
  crossTimbers: [-99.1, 32.15, -98.7, 32.5],
  hillCountry: [-99.05, 30.18, -98.7, 30.45],
  possumKingdom: [-98.7, 32.78, -98.3, 33.05],
  rollingPlains: [-101.15, 33.75, -100.45, 34.3],
  permian: [-101.1, 32.15, -100.2, 32.6],
  osage: [-96.65, 36.65, -96.25, 36.98],
  stillwater: [-97.35, 35.92, -96.7, 36.25],
}

async function query(layer, bbox, { where = '1=1', fields = '*', offset = 0.0003 } = {}) {
  const features = []
  let start = 0
  for (;;) {
    const params = new URLSearchParams({
      where,
      geometry: bbox.join(','),
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      outSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: fields,
      returnGeometry: 'true',
      geometryPrecision: '5',
      maxAllowableOffset: String(offset),
      resultOffset: String(start),
      resultRecordCount: '1000',
      f: 'geojson',
    })
    const res = await fetch(`${BASE}/${layer}/query?${params}`)
    if (!res.ok) throw new Error(`${layer}: HTTP ${res.status}`)
    const json = await res.json()
    if (json.error) throw new Error(`${layer}: ${JSON.stringify(json.error)}`)
    features.push(...json.features)
    if (!json.properties?.exceededTransferLimit && json.features.length < 1000) break
    start += json.features.length
  }
  return features
}

const MAJOR_RIVERS = ['Canadian River', 'Colorado River', 'Brazos River', 'Pedernales River', 'Leon River', 'Cimarron River', 'North Pease River', 'Middle Pease River', 'Tongue River', 'Salt Fork Brazos River', 'Washita River']

async function main() {
  mkdirSync(OUT, { recursive: true })
  const water = []
  const rivers = []
  const roads = []
  for (const [region, bbox] of Object.entries(REGIONS)) {
    const w = await query('USA_Detailed_Water_Bodies/FeatureServer/0', bbox, { where: 'SQKM > 0.25', fields: 'NAME,FTYPE,SQKM' })
    water.push(...w.map((f) => ({ ...f, properties: { region, name: f.properties.NAME?.trim() || null, sqkm: f.properties.SQKM } })))
    const r = await query('USA_Rivers_and_Streams/FeatureServer/0', bbox, { fields: 'Name,Feature', offset: 0.0005 })
    rivers.push(...r.filter((f) => MAJOR_RIVERS.includes(f.properties.Name)).map((f) => ({ ...f, properties: { region, name: f.properties.Name } })))
    const fw = await query('USA_Freeway_System/FeatureServer/1', bbox, { offset: 0.0005 })
    roads.push(...fw.map((f) => ({ ...f, properties: { region, name: Object.values(f.properties).find((v) => typeof v === 'string' && /^[IU]\d/.test(v)) || 'freeway' } })))
    console.log(`${region}: ${w.length} water, ${r.length} streams (${rivers.filter((x) => x.properties.region === region).length} major), ${fw.length} freeway pieces`)
  }
  const turbines = []
  for (const [farm, bbox] of Object.entries({ roscoe: [-100.62, 32.12, -100.05, 32.52], wildorado: [-102.5, 35.15, -102.1, 35.45] })) {
    const t = await query('US_Wind_Turbine_Database/FeatureServer/0', bbox, { fields: 'p_name,t_cap' })
    turbines.push(...t.map((f) => ({ type: 'Feature', geometry: f.geometry, properties: { farm, project: f.properties.p_name } })))
    console.log(`${farm}: ${t.length} turbines`)
  }
  const write = (name, features) => writeFileSync(join(OUT, name), `${JSON.stringify({ type: 'FeatureCollection', features })}\n`)
  write('water.geojson', water)
  write('rivers.geojson', rivers)
  write('freeways.geojson', roads)
  write('turbines.geojson', turbines)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
