import { homeById } from '../../lib/data.js'
import { formatNumber, formatUSDCompact } from '../../lib/format.js'
import useSpread from '../../state/useSpread.js'
import DrawerSection from './DrawerSection.jsx'

export default function ExposureBlock({ fire }) {
  const { step } = useSpread()
  const e = fire.exposure
  const tiles = [
    { label: 'Homes engulfed', value: formatNumber(e.homesEngulfed) },
    { label: 'Total insured value', value: formatUSDCompact(e.tiv) },
    { label: 'Expected loss', value: formatUSDCompact(e.expectedLoss) },
    { label: 'AAL uplift', value: `+${formatUSDCompact(e.aalUplift)}`, note: `+${e.aalUpliftPctOfBook}% on the book` },
  ]

  return (
    <DrawerSection title="Exposure in path">
      <div className="exposure-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="exposure-tile">
            <span>{t.label}</span>
            <strong>{t.value}</strong>
            {t.note && <small>{t.note}</small>}
          </div>
        ))}
      </div>
      <div className="exposure-list" role="table" aria-label="Homes in path">
        <div className="exposure-row is-head" role="row">
          <span role="columnheader">Address</span>
          <span role="columnheader">TIV</span>
          <span role="columnheader">Exp. loss</span>
          <span role="columnheader">Reached</span>
        </div>
        <div className="exposure-rows">
          {fire.homesInPath.map((p) => {
            const home = homeById.get(p.homeId)
            const reached = p.step <= step
            return (
              <div key={p.homeId} className={`exposure-row${reached ? ' is-reached' : ''}`} role="row">
                <span role="cell" className="exposure-address">
                  <span className="exposure-dot" aria-hidden="true" />
                  <span>
                    {home.address}
                    <small>{home.locality}</small>
                  </span>
                </span>
                <span role="cell">{formatUSDCompact(home.tiv)}</span>
                <span role="cell">{formatUSDCompact(p.expectedLoss)}</span>
                <span role="cell">Day {p.day}</span>
              </div>
            )
          })}
        </div>
      </div>
    </DrawerSection>
  )
}
