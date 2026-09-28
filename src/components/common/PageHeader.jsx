export default function PageHeader({ icon: Icon, title, summary, aside }) {
  return (
    <header className="page-head">
      <span className="page-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <div className="page-head-text">
        <h1 id="page-title">{title}</h1>
        {summary && <p className="page-summary">{summary}</p>}
      </div>
      {aside && <div className="page-head-aside">{aside}</div>}
    </header>
  )
}
