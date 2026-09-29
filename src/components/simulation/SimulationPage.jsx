import { useMemo, useState } from 'react'
import useApp from '../../state/useApp.js'
import { store } from '../../lib/store.js'
import { bookSimulation } from '../../lib/simulation.js'
import OutcomeToggle from './OutcomeToggle.jsx'
import SimCalendar from './SimCalendar.jsx'
import ScheduleTable from './ScheduleTable.jsx'
import ArithmeticTable from './ArithmeticTable.jsx'
import BookOutcomes from './BookOutcomes.jsx'
import OutcomeChart from './OutcomeChart.jsx'
import PayerLines from './PayerLines.jsx'

/** Simulation (§14): thirty days from the issue date under no intervention, the negotiated plans, or every plan failing. */
export default function SimulationPage() {
  const { portfolioId, select } = useApp()
  const [outcome, setOutcome] = useState('asNegotiated')
  const sim = useMemo(() => bookSimulation(portfolioId), [portfolioId])
  const issued = store.fires[0]?.called
  return (
    <section className="page2 simulation" aria-labelledby="sim-title">
      <header className="page2-head">
        <div>
          <h1 id="sim-title">Simulation</h1>
          <p>Thirty days from the issue date: what the book loses with no intervention, as negotiated, and if every plan fails.</p>
        </div>
        <div className="page2-actions">
          <OutcomeToggle value={outcome} onChange={setOutcome} />
        </div>
      </header>
      <SimCalendar rows={sim.rows} issued={issued} />
      <div className="sim-main">
        <ScheduleTable rows={sim.rows} onOpen={(id) => select('fire', id)} />
        <div className="sim-right">
          <ArithmeticTable rows={sim.rows} totals={sim.totals} outcome={outcome} />
          <OutcomeChart totals={sim.totals} outcome={outcome} />
        </div>
      </div>
      <BookOutcomes sim={sim} outcome={outcome} />
      <PayerLines rows={sim.rows} />
    </section>
  )
}
