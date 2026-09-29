/** A fire ID in tables: warm-grey with a small severity dot, so orange stays for what is active. */
export default function FireId({ fire }) {
  const severe = fire.severity === 'Severe'
  return (
    <span className="fire-id">
      <i className={`sev-dot ${severe ? 'is-severe' : 'is-nonsevere'}`} aria-label={severe ? 'Severe' : 'Non-severe'} />
      {fire.id}
    </span>
  )
}
