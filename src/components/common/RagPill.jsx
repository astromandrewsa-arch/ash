/** Red / amber / green status pill. */
export default function RagPill({ rag, label }) {
  return (
    <span className={`rag-pill rag-${rag}`}>
      <span className="rag-pill-dot" aria-hidden="true" />
      {label}
    </span>
  )
}
