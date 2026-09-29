const KIND = { lake: 'Lake', river: 'River', highway: 'Highway', field: 'Plowed field', escarpment: 'Escarpment', island: 'Unburnable pads', patch: 'Last season’s burns' }
const EFFECT = { hard: 'holds', partial: 'slows (crossed after a delay)', '70%': '70% effective, crossed after 2 h' }

/** The fire's barriers grouped by name, with what each does to the spread. */
export default function BarrierList({ barriers }) {
  const groups = new Map()
  for (const b of barriers) {
    const name = b.kind === 'lake' && b.name === 'Lake' ? 'Small lakes and tanks' : b.name
    const key = `${b.kind}|${name}`
    const g = groups.get(key) || { kind: b.kind, name, effect: b.effect, count: 0 }
    g.count++
    groups.set(key, g)
  }
  const rows = [...groups.values()].sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind.localeCompare(b.kind)))
  return (
    <ul className="barrier-list">
      {rows.map((g) => (
        <li key={`${g.kind}|${g.name}`}>
          <i className={`barrier-swatch is-${g.kind}`} aria-hidden="true" />
          <span className="barrier-name">
            {g.name}
            {(g.kind === 'island' || g.kind === 'patch') && g.count > 1 ? ` · ${g.count}` : ''}
          </span>
          <span className="barrier-effect">{EFFECT[g.effect] ?? g.effect}</span>
        </li>
      ))}
    </ul>
  )
}
