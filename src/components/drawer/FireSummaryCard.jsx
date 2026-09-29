import { store } from '../../lib/store.js'
import { flameSvg } from '../../lib/icons.js'
import { formatHa, formatNumber, formatUSDCompact, formatUSDRange } from '../../lib/format.js'
import useApp from '../../state/useApp.js'
import DrawerHeader from './DrawerHeader.jsx'
import FactGrid from './FactGrid.jsx'
import SvgIcon from '../common/SvgIcon.jsx'

/** "Called 15 days ahead, window narrowed from 14 to 5 days" (§10). */
export function leadLine(f) {
  if (f.windowDays < f.windowNarrowedFrom) return `Called ${f.leadDays} days ahead; window narrowed from ${f.windowNarrowedFrom} to ${f.windowDays} days.`
  return `Called ${f.leadDays} days ahead; the ${f.windowDays}-day window narrows as the date nears.`
}

/** "Smokehouse Creek (2024): 1,058,482 ac, 500 structures lost." */
export function analogueLine(a) {
  const loss = a.homesLost ? `, ${formatNumber(a.homesLost)} homes lost` : a.structures ? `, ${formatNumber(a.structures)} structures lost` : ''
  return `${a.name} (${a.year}): ${formatNumber(a.acres)} ac${loss}.`
}

/** The fire's card: header line, severity, lead time, loss band and what sits in the P50 path. */
export default function FireSummaryCard({ fireId }) {
  const { closeDrawer } = useApp()
  const f = store.fireById.get(fireId)
  if (!f) return null
  const b = f.bands.p50
  const plan = store.planByFire.get(f.id)
  const neg = store.negotiationByFire.get(f.id)
  return (
    <div className="card-body">
      <DrawerHeader icon={<SvgIcon html={flameSvg(22)} />} kicker={`${f.id} · ${f.place}`} title={f.name} onClose={closeDrawer}>
        <p className="dh-line">{f.headerLine}</p>
        <div className="dh-pills">
          <span className={`pill ${f.severity === 'Severe' ? 'pill-red' : 'pill-amber'}`}>{f.severity}</span>
          <span className="pill">{f.intensity.class} intensity</span>
          <span className="pill">{f.ignitionZone.class} · {formatHa(f.ignitionZone.hectares)}</span>
        </div>
        <p className="dh-sub">{leadLine(f)}</p>
      </DrawerHeader>
      <section className="card-section">
        <div className="loss-hero">
          <span className="label">Loss if it burns · point (P50)</span>
          <span className="figure">{formatUSDCompact(f.lossPoint)}</span>
          <span className="loss-band">
            Lower–upper {formatUSDRange(f.lossLower, f.lossUpper)} · a 1-in-{Math.round(f.returnPeriodYears)} event for this book
          </span>
        </div>
      </section>
      <section className="card-section">
        <FactGrid
          items={[
            { label: 'Homes in P50 path', value: formatNumber(b.homes) },
            { label: 'Assets in P50 path', value: formatNumber(b.assets) },
            { label: 'Exposed TIV', value: formatUSDCompact(b.tiv) },
            { label: 'Mean damage ratio', value: `${Math.round(b.damageRatio * 100)}%` },
            { label: 'Peak head fire', value: `${f.intensity.rosKmh} km/h · ${formatNumber(f.intensity.kwPerM)} kW/m` },
            { label: 'Peak wind', value: `${f.intensity.windKmh} km/h from ${f.intensity.windDir}` },
          ]}
        />
      </section>
      <section className="card-section">
        <h3 className="label">In the P50 path</h3>
        <p className="card-text">{f.exposureText}.</p>
        <p className="card-text muted">Analogue: {analogueLine(f.analogue)}</p>
      </section>
      {plan && neg && (
        <section className="card-section">
          <h3 className="label">Intervention</h3>
          <p className="card-text">
            <span className="pill pill-orange">{plan.verdict}</span> {plan.summary}
          </p>
          <p className="card-text muted">
            {neg.agent.name}, your Pyrome agent: {neg.stage.toLowerCase()} with {neg.counterparty}.
          </p>
        </section>
      )}
    </div>
  )
}
