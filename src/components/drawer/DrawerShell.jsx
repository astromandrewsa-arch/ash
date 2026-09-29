/** The 460 px glass drawer that slides in from the right (CLAUDE.md §4). */
export default function DrawerShell({ open, label = 'Detail', children }) {
  return (
    <aside className={`side-drawer${open ? ' is-open' : ''}`} aria-label={label} aria-hidden={!open} inert={!open}>
      {children}
    </aside>
  )
}
