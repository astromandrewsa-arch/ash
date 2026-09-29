/** 300 ms skeleton shown on each page switch. */
export default function PageSkeleton() {
  return (
    <section className="page2" aria-busy="true" aria-label="Loading">
      <div className="skeleton-grid">
        <span className="sk" style={{ width: 280, height: 30 }} />
        <span className="sk" style={{ width: 420, height: 14 }} />
        <div className="skeleton-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="sk" style={{ height: 92 }} />
          ))}
        </div>
        <span className="sk" style={{ height: 380, marginTop: 4 }} />
      </div>
    </section>
  )
}
