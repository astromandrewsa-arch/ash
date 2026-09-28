export default function PlaceholderPage({ view }) {
  const Icon = view.icon
  return (
    <section className="page" aria-labelledby="page-title">
      <header className="page-head">
        <span className="page-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <div>
          <h1 id="page-title">{view.label}</h1>
          <p className="page-summary">{view.summary}</p>
        </div>
      </header>
      <div className="card page-placeholder">
        <p className="page-placeholder-kicker">Coming in a later build step</p>
        <ul>
          {view.planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
