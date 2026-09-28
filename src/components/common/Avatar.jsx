const initialsOf = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar-chip is-${size}`} aria-hidden="true">
      {initialsOf(name)}
    </span>
  )
}
