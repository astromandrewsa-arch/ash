import { formatPct } from '../../lib/format.js'

/** The technical premium's symbols and the book's pricing inputs. */
export default function PricingTerms({ pricing: p }) {
  const terms = [
    { sym: 'FE', text: `fixed expense, $${p.fixedExpensePerPolicy} a policy` },
    { sym: 'E[L]', text: 'PRIMER’s dated expected loss' },
    { sym: 'ALAE%', text: `loss adjustment, ${formatPct(p.alae)} of loss` },
    { sym: 'VE%', text: `variable expense, ${formatPct(p.variableExpense)} of premium` },
    { sym: 'RoP%', text: `target return, ${formatPct(p.returnOnPremium)} of premium` },
  ]
  return (
    <dl className="tech-terms">
      {terms.map((t) => (
        <div key={t.sym}>
          <dt>
            <var>{t.sym}</var>
          </dt>
          <dd>{t.text}</dd>
        </div>
      ))}
    </dl>
  )
}
