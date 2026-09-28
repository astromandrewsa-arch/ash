export default function Toggle({ label, swatch, checked, onChange }) {
  return (
    <label className="toggle">
      {swatch && <span className={`swatch swatch-${swatch}`} aria-hidden="true" />}
      <span className="toggle-label">{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </label>
  )
}
