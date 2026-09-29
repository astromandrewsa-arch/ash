/** Interim page frame for views whose v2 content arrives in a later pass. */
export default function PlaceholderPage({ title, summary, icon: Icon, sections }) {
  return (
    <section className="page2">
      <header className="page2-head">
        <div>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
      </header>
      <div className="placeholder-grid">
        {sections.map((s) => (
          <article key={s.title} className="glass placeholder-card">
            {Icon && <Icon size={18} className="placeholder-icon" aria-hidden="true" />}
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
