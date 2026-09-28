export default function DrawerSection({ title, aside, children, className = '' }) {
  return (
    <section className={`drawer-section ${className}`}>
      <header className="drawer-section-head">
        <h3>{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  )
}
