import Avatar from '../common/Avatar.jsx'

export default function AgentCard({ process }) {
  return (
    <section className="agent-card">
      <div className="agent-card-person">
        <Avatar name={process.agent.name} />
        <div>
          <strong>{process.agent.name}</strong>
          <span>{process.agent.role}</span>
        </div>
      </div>
      <ul className="agent-counterparts" aria-label="Counterparts">
        {process.counterparts.map((c) => (
          <li key={c.body} className={c.body === process.primaryCounterpart ? 'is-primary' : ''}>
            <strong>{c.body}</strong>
            <span>{c.role}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
