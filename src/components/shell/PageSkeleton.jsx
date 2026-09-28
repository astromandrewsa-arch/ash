/** Placeholder shown briefly while a page "loads". */
export default function PageSkeleton() {
  return (
    <section className="page page-skeleton" aria-busy="true" aria-label="Loading">
      <div className="sk-head">
        <span className="sk sk-icon" />
        <div>
          <span className="sk sk-title" />
          <span className="sk sk-line" />
        </div>
      </div>
      <div className="tile-row">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="sk sk-tile" />
        ))}
      </div>
      <span className="sk sk-block" />
    </section>
  )
}
