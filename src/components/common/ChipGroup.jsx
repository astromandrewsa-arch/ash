/** A labelled row of single-select chips (radio semantics). options: [{ value, label }]. */
export default function ChipGroup({ label, value, options, onChange }) {
  return (
    <div className="chip-group" role="radiogroup" aria-label={label}>
      <span className="chip-group-label">{label}</span>
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className={`chip${o.value === value ? ' is-on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
