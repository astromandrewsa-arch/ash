import { areas, fires, homes, processes } from './data.js'

const norm = (s) => s.trim().toLowerCase()

/** Suggestions for the search box: fire IDs, places, counties and localities. */
export const searchSuggestions = [
  ...processes.map((p) => p.fireId),
  ...areas.flatMap((a) => [a.name, a.nearTown, a.county, ...a.localities.map((l) => l.name)]),
].filter((v, i, all) => all.indexOf(v) === i)

/**
 * Resolve a query to something to open: a fire ID, a policy number or address, or a place
 * (area, town, county or locality), which opens that area's dated fire.
 */
export function resolveSearch(query) {
  const q = norm(query)
  if (!q) return null

  const fireId = processes.find((p) => norm(p.fireId) === q)?.fireId
  if (fireId) return { type: 'fire', id: fireId }

  const home = homes.find((h) => norm(h.policyNumber) === q || norm(h.address) === q)
  if (home) return { type: 'home', id: home.id }

  const area = areas.find(
    (a) =>
      [a.name, a.nearTown, a.county, a.county.replace(' County', ''), ...a.localities.map((l) => l.name)].some((v) => norm(v) === q) ||
      norm(a.nearTown).startsWith(q) ||
      norm(a.name).startsWith(q),
  )
  if (area) return { type: 'fire', id: area.fireId }

  const partial = fires.filter((f) => norm(f.id).startsWith(q))
  if (partial.length === 1) return { type: 'fire', id: partial[0].id }

  const addressHit = homes.filter((h) => norm(h.address).includes(q))
  if (q.length >= 4 && addressHit.length === 1) return { type: 'home', id: addressHit[0].id }

  return null
}
