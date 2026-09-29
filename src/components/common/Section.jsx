/** A titled section inside a drawer or panel tab. */
export default function Section({ title, note, children, className = '' }) {
  return (
    <section className={`card-section ${className}`}>
      {title && <h3 className="label section-title">{title}</h3>}
      {note && <p className="section-note">{note}</p>}
      {children}
    </section>
  )
}
