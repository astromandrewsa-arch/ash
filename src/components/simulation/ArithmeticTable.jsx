import { formatUSDCompact } from '../../lib/format.js'
import { OUTCOMES } from '../../lib/simulation.js'
import FireId from '../common/FireId.jsx'

/** Per-fire expected loss over 30 days under the three outcomes, the carrier's share, and the book rows (§14). */
export default function ArithmeticTable({ rows, totals, outcome }) {
  return (
    <section className="sim-panel glass" aria-labelledby="arith-title">
      <h2 id="arith-title" className="label sim-panel-title">
        Expected loss over 30 days
      </h2>
      <table className="sim-table arith">
        <thead>
          <tr>
            <th scope="col">Fire</th>
            {OUTCOMES.map((o) => (
              <th key={o.id} scope="col" className={`num${o.id === outcome ? ' is-on' : ''}`}>
                {o.label}
              </th>
            ))}
            <th scope="col" className="num">
              Carrier pays
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.fire.id}>
              <td className="sim-fire">
                <FireId fire={r.fire} />
              </td>
              {OUTCOMES.map((o) => (
                <td key={o.id} className={`num${o.id === outcome ? ' is-on' : ''}`}>
                  {formatUSDCompact(r[o.id])}
                </td>
              ))}
              <td className="num muted">{r.carrier ? formatUSDCompact(r.carrier) : '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Book</th>
            {OUTCOMES.map((o) => (
              <td key={o.id} className={`num${o.id === outcome ? ' is-on' : ''}`}>
                {formatUSDCompact(totals[o.id])}
              </td>
            ))}
            <td className="num">{formatUSDCompact(totals.carrier)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="sim-formula">
        No intervention = P(fire) × point loss. As negotiated = P(fire after plan) × (P(prevent) × loss if it holds + (1 − P(prevent)) × loss if it fails) + cost; a state
        agency plan uses the loss with the plan in place. Every plan fails = P(fire) × loss if it fails + cost.
      </p>
    </section>
  )
}
