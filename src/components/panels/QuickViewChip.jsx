/** One Quick View toggle: a pill with the layer's swatch. */
export default function QuickViewChip({ label, swatch, on, onToggle }) {
  return (
    <button type="button" className={`qv-chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={onToggle}>
      <i className={`qv-swatch sw-${swatch}`} aria-hidden="true" />
      {label}
    </button>
  )
}
