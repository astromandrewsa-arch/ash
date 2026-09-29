import InfoButton from './InfoButton.jsx'

/** A titled section inside a drawer or panel tab; `help` adds an info icon that opens Help at that topic. */
export default function Section({ title, note, help, children, className = '' }) {
  return (
    <section className={`card-section ${className}`}>
      {title && (
        <h3 className="label section-title">
          {title}
          {help && <InfoButton topic={help} label={title} />}
        </h3>
      )}
      {note && <p className="section-note">{note}</p>}
      {children}
    </section>
  )
}
