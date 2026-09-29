import { useState } from 'react'
import { store } from '../../lib/store.js'
import { formatNumber, formatPct, formatUSDCompact } from '../../lib/format.js'
import Section from '../common/Section.jsx'
import SegToggle from '../common/SegToggle.jsx'
import BandCards from './BandCards.jsx'
import LossRange from './LossRange.jsx'
import InPathList from './InPathList.jsx'
import { analogueLine, basisLine } from './fireText.js'

const BASIS = [
  { id: 'ground', label: 'Ground-up' },
  { id: 'gross', label: 'Gross' },
]

/**
 * Exposure tab (§8, §10): lower / point / upper with the ground-up or gross toggle, the three
 * band cards, the return period, analogue, inclusions, and every home and asset in the path.
 */
export default function ExposureTab({ fire }) {
  const [basis, setBasis] = useState('ground')
  const gross = basis === 'gross'
  const terms = store.portfolio.terms
  const n = fire.homesInPath.length + fire.assetsInPath.filter((a) => a.band !== 'watch').length
  return (
    <>
      <Section title="Loss if it burns">
        <SegToggle options={BASIS} value={basis} onChange={setBasis} label="Loss basis" />
        <LossRange fire={fire} gross={gross} />
        <p className="section-note">
          {gross
            ? `Gross: after a ${formatPct(terms.deductible)} deductible and a ${formatUSDCompact(terms.locationLimit)} per-location limit.`
            : 'Ground-up: before deductibles and limits.'}
        </p>
      </Section>
      <Section title="Bands">
        <BandCards fire={fire} gross={gross} />
      </Section>
      <Section title="Basis">
        <p className="card-text">{basisLine(fire)}</p>
        <p className="card-text muted">Analogue: {analogueLine(fire.analogue)}</p>
      </Section>
      <Section title={`In the path · ${formatNumber(n)}`}>
        <InPathList fire={fire} />
      </Section>
    </>
  )
}
