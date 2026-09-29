import { formatPct, formatUSDCompact } from '../../lib/format.js'
import { OUTCOMES } from '../../lib/simulation.js'
import KpiTile from '../common/KpiTile.jsx'

const rpText = (rp) => (rp < 2 ? 'under 1-in-2' : `1-in-${Math.round(rp)}`)
const short = { none: 'none', asNegotiated: 'negotiated', fails: 'fails' }

/** Premium at risk, season loss ratio and return period of the book outcome (§14). */
export default function BookOutcomes({ sim, outcome }) {
  const label = OUTCOMES.find((o) => o.id === outcome).label
  const others = (fmt, obj) => OUTCOMES.map((o) => `${short[o.id]} ${fmt(obj[o.id])}`).join(' · ')
  return (
    <div className="kpi-row sim-kpis">
      <KpiTile label="Premium at risk · 30 days" value={formatUSDCompact(sim.premiumAtRisk)} note="homeowners premium in the paths" />
      <KpiTile label={`Season loss ratio · ${label.toLowerCase()}`} value={formatPct(sim.lossRatio[outcome])} note={others((v) => formatPct(v), sim.lossRatio)} tone={outcome === 'asNegotiated' ? 'saving' : 'loss'} />
      <KpiTile
        plain
        label={`Return period · ${label.toLowerCase()}`}
        value={rpText(sim.returnPeriods[outcome])}
        note={OUTCOMES.filter((o) => o.id !== outcome)
          .map((o) => `${short[o.id]} ${rpText(sim.returnPeriods[o.id])}`)
          .join(' · ')}
      />
      <KpiTile label="Carrier pays" value={formatUSDCompact(sim.totals.carrier)} note={`of ${formatUSDCompact(sim.totals.cost)} in plan costs`} />
    </div>
  )
}
