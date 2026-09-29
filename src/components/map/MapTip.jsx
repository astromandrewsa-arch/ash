/** Glass hover card positioned at a map container point, flipped away from the edges. */
export default function MapTip({ place, title, subtitle, children }) {
  const style = {
    left: place.flipX ? place.left - 32 : place.left,
    top: place.flipY ? place.top - 28 : place.top,
    transform: `translate(${place.flipX ? '-100%' : '0'}, ${place.flipY ? '-100%' : '0'})`,
  }
  return (
    <div className="map-tip" style={style} role="tooltip">
      <p className="tip-title">{title}</p>
      {subtitle && <p className="tip-sub">{subtitle}</p>}
      {children}
    </div>
  )
}
