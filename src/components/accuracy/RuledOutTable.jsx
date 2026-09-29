/** §16 "Mitigation they called that PRIMER ruled out": four calls the sensors did not support. */
export default function RuledOutTable({ rows }) {
  return (
    <section className="ruled-card glass" aria-labelledby="ruled-title">
      <h2 id="ruled-title" className="acc-h2">
        Mitigation they called that PRIMER ruled out
      </h2>
      <div className="ruled-wrap">
        <table className="ruled">
          <thead>
            <tr>
              <th scope="col">Where</th>
              <th scope="col">What they called</th>
              <th scope="col">What PRIMER measured</th>
              <th scope="col">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.place}>
                <th scope="row">{r.place}</th>
                <td>{r.theyCalled}</td>
                <td>{r.primerSaw}</td>
                <td className="ruled-outcome">{r.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
