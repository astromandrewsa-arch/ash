/** A two- or three-way segmented toggle (radio semantics). */
export default function SegToggle({ options, value, onChange, label, className = '' }) {
  return (
    <div className={`seg-toggle ${className}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === value} className={o.id === value ? 'is-on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
