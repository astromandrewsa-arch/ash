/** Which items span both columns: the wide ones, and any item that would sit alone in its row. */
function spans(list) {
  const out = list.map((it) => Boolean(it.wide))
  let waiting = -1 // an item still looking for a partner in its row
  list.forEach((it, i) => {
    if (it.wide) {
      if (waiting >= 0) out[waiting] = true
      waiting = -1
    } else if (waiting >= 0) {
      waiting = -1
    } else {
      waiting = i
    }
  })
  if (waiting >= 0) out[waiting] = true
  return out
}

/** Two-column label/value grid used by the drawer cards. An item with `action` renders as a link. */
export default function FactGrid({ items }) {
  const list = items.filter(Boolean)
  const wide = spans(list)
  return (
    <dl className="fact-grid">
      {list.map((it, i) => (
        <div key={it.label} className={wide[i] ? 'is-wide' : undefined}>
          <dt>{it.label}</dt>
          <dd className={it.tone ? `tone-${it.tone}` : undefined}>
            {it.action ? (
              <button type="button" className="fact-link" onClick={it.action}>
                {it.value}
              </button>
            ) : (
              it.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
