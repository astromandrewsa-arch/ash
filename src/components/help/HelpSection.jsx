import TechnicalFormula from '../premium/TechnicalFormula.jsx'

/** One Help topic: a lead line, paragraphs, a definition list, the formula or the sources. */
export default function HelpSection({ section: s }) {
  return (
    <section id={`help-${s.id}`} className="help-section" aria-labelledby={`help-${s.id}-title`}>
      <h3 id={`help-${s.id}-title`}>{s.title}</h3>
      {s.lead && <p className="help-lead">{s.lead}</p>}
      {s.formula && <TechnicalFormula />}
      {s.paragraphs?.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
      {s.terms && (
        <dl className="help-terms2">
          {s.terms.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>{t.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {s.sources && (
        <ul className="help-sources">
          {s.sources.map((t) => (
            <li key={t.id}>
              <span className="help-src-label">{t.label}</span>
              <strong>{t.value}</strong>
              <span className="help-src-source">{t.source}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
