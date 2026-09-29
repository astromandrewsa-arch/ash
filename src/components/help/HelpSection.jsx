/** One titled section of the Help dialog; the id lets an info icon open Help at it. */
export default function HelpSection({ id, title, children }) {
  return (
    <section id={`help-${id}`} className="help-section" aria-labelledby={`help-${id}-title`}>
      <h3 id={`help-${id}-title`}>{title}</h3>
      {children}
    </section>
  )
}
