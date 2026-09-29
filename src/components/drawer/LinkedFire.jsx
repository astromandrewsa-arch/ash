/** A dated fire mentioned on another card; clicking opens that fire. */
export default function LinkedFire({ fire, onOpen, children }) {
  return (
    <button type="button" className="linked-fire" onClick={() => onOpen(fire.id)}>
      <span className={`pill ${fire.severity === 'Severe' ? 'pill-red' : 'pill-amber'}`}>{fire.id}</span>
      <span className="linked-fire-text">{children}</span>
    </button>
  )
}
