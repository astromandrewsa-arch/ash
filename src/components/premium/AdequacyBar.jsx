/** Diverging bar around zero: under-priced runs left in orange, over-priced right in blue. */
export default function AdequacyBar({ value, max }) {
  const w = Math.min(1, Math.abs(value) / max) * 50
  const under = value < 0
  return (
    <span className="adq-bar" aria-hidden="true">
      <span className={`adq-fill ${under ? 'is-under' : 'is-over'}`} style={under ? { right: '50%', width: `${w}%` } : { left: '50%', width: `${w}%` }} />
      <span className="adq-zero" />
    </span>
  )
}
