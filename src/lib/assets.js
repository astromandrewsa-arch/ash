// Asset helpers shared by the map and the drawer.
import { formatKm, formatNumber, formatUSDCompact } from './format.js'

export const ASSET_KIND = { line: 'Power line', pipeline: 'Pipeline', refinery: 'Refinery', tankfarm: 'Tank farm', wind: 'Wind farm', substation: 'Substation' }

/** Where an asset's icon sits: mid-line for lines, the footprint centre, or the point itself. */
export function assetAnchor(asset) {
  if (asset.kind === 'substation') return asset.geometry
  if (asset.kind === 'line' || asset.kind === 'pipeline') return asset.geometry[Math.floor(asset.geometry.length / 2)]
  let lat = 0
  let lng = 0
  for (const [a, b] of asset.geometry) {
    lat += a
    lng += b
  }
  return [lat / asset.geometry.length, lng / asset.geometry.length]
}

/** One line under the asset name in tooltips. */
export function assetSummary(asset) {
  if (asset.kind === 'line') return `${formatNumber(asset.poles.length)} poles · ${formatKm(asset.km)} · ${formatUSDCompact(asset.tiv)}`
  if (asset.kind === 'pipeline') return `${formatKm(asset.km)} · ${asset.stations?.length ?? 0} pump stations · ${formatUSDCompact(asset.tiv)}`
  if (asset.kind === 'wind') return `${formatNumber(asset.turbineCount)} turbines · ${formatUSDCompact(asset.tiv)}`
  if (asset.capacity) return `${asset.capacity} · ${formatUSDCompact(asset.tiv)}`
  return `${ASSET_KIND[asset.kind]} · ${formatUSDCompact(asset.tiv)}`
}
